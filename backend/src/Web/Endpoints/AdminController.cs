using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Web.Endpoints;

public class AdminController : IEndpointGroup
{
    public static string RoutePrefix => "/api/Admin";

    public static void Map(RouteGroupBuilder groupBuilder)
    {
        // Enforce role authorization (Only Administrator role)
        groupBuilder.RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = "Administrator" });
        
        groupBuilder.MapGet(GetUsers, "users")
            .WithName("AdminGetUsers");
        groupBuilder.MapPost(CreateUser, "users")
            .WithName("AdminCreateUser");
        groupBuilder.MapPut(UpdateUser, "users/{id}")
            .WithName("AdminUpdateUser");
        groupBuilder.MapDelete(DeleteUser, "users/{id}")
            .WithName("AdminDeleteUser");
        groupBuilder.MapPost(BackupDatabase, "backup")
            .WithName("AdminBackupDatabase");
        groupBuilder.MapPost(RestoreDatabase, "restore")
            .WithName("AdminRestoreDatabase");
    }

    public static async Task<IResult> GetUsers(UserManager<Account> userManager, IApplicationDbContext context)
    {
        var users = await userManager.Users
            .Include(u => u.Employee)
            .Include(u => u.Adopter)
            .Include(u => u.Donor)
            .AsNoTracking()
            .ToListAsync();

        var userList = new List<object>();

        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);

            // Determine UserType based on Roles to avoid issues with orphaned database profiles
            string userType = "AccountOnly";
            if (roles.Any(r => r.Equals("Administrator", StringComparison.OrdinalIgnoreCase) || 
                              r.Equals("Director", StringComparison.OrdinalIgnoreCase) || 
                              r.Equals("Manager", StringComparison.OrdinalIgnoreCase) || 
                              r.Equals("CareGiver", StringComparison.OrdinalIgnoreCase) ||
                              r.Equals("Caregiver", StringComparison.OrdinalIgnoreCase)))
            {
                userType = "Employee";
            }
            else if (roles.Any(r => r.Equals("Adopter", StringComparison.OrdinalIgnoreCase)))
            {
                userType = "Adopter";
            }
            else if (roles.Any(r => r.Equals("Donor", StringComparison.OrdinalIgnoreCase)))
            {
                userType = "Donor";
            }

            userList.Add(new
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                IsActive = user.IsActive,
                Roles = roles.ToList(),
                FullName = user.Employee?.FullName ?? user.Adopter?.FullName ?? user.Donor?.FullName ?? "Chưa thiết lập",
                Position = user.Employee?.Position,
                Phone = user.Employee?.Phone ?? user.Donor?.Phone,
                Address = user.Adopter?.Address ?? user.Donor?.Address,
                UserType = userType
            });
        }

        return TypedResults.Ok(userList);
    }

    public static async Task<IResult> CreateUser(
        [FromBody] CreateUserRequest request,
        UserManager<Account> userManager,
        IApplicationDbContext context,
        IUser currentUser,
        ISystemLogService logService)
    {
        if (request.Roles != null && 
            request.Roles.Any(r => r.Equals("Adopter", StringComparison.OrdinalIgnoreCase)) && 
            request.Roles.Count > 1)
        {
            return TypedResults.BadRequest("Tài khoản người nhận nuôi (Adopter) không được phép đồng thời giữ các vai trò khác.");
        }

        if (string.IsNullOrEmpty(request.UserName) || string.IsNullOrEmpty(request.Password))
        {
            return TypedResults.BadRequest("Tên đăng nhập và mật khẩu không được để trống.");
        }

        var existingUser = await userManager.FindByNameAsync(request.UserName) ?? await userManager.FindByEmailAsync(request.Email ?? "");
        if (existingUser != null)
        {
            return TypedResults.BadRequest("Tên đăng nhập hoặc Email đã tồn tại trên hệ thống.");
        }

        var user = new Account
        {
            UserName = request.UserName,
            Email = request.Email ?? $"{request.UserName}@hopecenter.com",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return TypedResults.BadRequest(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        // Assign Roles
        if (request.Roles != null && request.Roles.Count > 0)
        {
            await userManager.AddToRolesAsync(user, request.Roles);
        }

        // Create corresponding profiles
        if (request.Roles != null)
        {
            if (request.Roles.Any(r => r == "CareGiver" || r == "Manager" || r == "Director" || r == "Administrator"))
            {
                context.Employees.Add(new Employee
                {
                    AccountId = user.Id,
                    FullName = request.FullName ?? request.UserName,
                    Position = request.Position ?? "Nhân viên",
                    Phone = request.Phone,
                    DOB = DateTime.UtcNow.AddYears(-30)
                });
            }
            
            if (request.Roles.Contains("Adopter"))
            {
                context.Adopters.Add(new Adopter
                {
                    AccountId = user.Id,
                    FullName = request.FullName ?? request.UserName,
                    IDCard = "Chưa cập nhật",
                    Address = request.Address ?? "Chưa cập nhật",
                    MaritalStatus = "Chưa cập nhật",
                    FinancialStatus = "Chưa cập nhật"
                });
            }
            
            if (request.Roles.Contains("Donor"))
            {
                context.Donors.Add(new Donor
                {
                    AccountId = user.Id,
                    FullName = request.FullName ?? request.UserName,
                    Phone = request.Phone,
                    Email = user.Email,
                    Address = request.Address
                });
            }

            await context.SaveChangesAsync(default);
        }

        if (!string.IsNullOrEmpty(currentUser.Id) && Guid.TryParse(currentUser.Id, out Guid adminId))
        {
            await logService.LogAsync(adminId, "Create", "Admin", $"Tạo tài khoản mới: {request.UserName} với các vai trò: {string.Join(", ", request.Roles ?? new())}");
        }

        return TypedResults.Created($"/api/Admin/users/{user.Id}", user.Id);
    }

    public static async Task<IResult> UpdateUser(
        Guid id,
        [FromBody] UpdateUserRequest request,
        UserManager<Account> userManager,
        IApplicationDbContext context,
        IUser currentUser,
        ISystemLogService logService)
    {
        if (request.Roles != null && 
            request.Roles.Any(r => r.Equals("Adopter", StringComparison.OrdinalIgnoreCase)) && 
            request.Roles.Count > 1)
        {
            return TypedResults.BadRequest("Tài khoản người nhận nuôi (Adopter) không được phép đồng thời giữ các vai trò khác.");
        }

        var user = await userManager.FindByIdAsync(id.ToString());
        if (user == null) return TypedResults.NotFound();

        user.IsActive = request.IsActive;
        await userManager.UpdateAsync(user);

        if (request.Roles != null)
        {
            var currentRoles = await userManager.GetRolesAsync(user);
            await userManager.RemoveFromRolesAsync(user, currentRoles);
            await userManager.AddToRolesAsync(user, request.Roles);

            // Dynamically ensure they have a profile matching their new roles
            if (request.Roles.Any(r => r == "CareGiver" || r == "Manager" || r == "Director" || r == "Administrator"))
            {
                var employee = await context.Employees.FirstOrDefaultAsync(e => e.AccountId == user.Id);
                if (employee == null)
                {
                    context.Employees.Add(new Employee
                    {
                        AccountId = user.Id,
                        FullName = user.UserName ?? "Nhân viên",
                        Position = "Nhân viên",
                        DOB = DateTime.UtcNow.AddYears(-30)
                    });
                }
            }

            if (request.Roles.Contains("Adopter"))
            {
                var adopter = await context.Adopters.FirstOrDefaultAsync(a => a.AccountId == user.Id);
                if (adopter == null)
                {
                    context.Adopters.Add(new Adopter
                    {
                        AccountId = user.Id,
                        FullName = user.UserName ?? "Người nhận nuôi",
                        IDCard = "Chưa cập nhật",
                        Address = "Chưa cập nhật",
                        MaritalStatus = "Chưa cập nhật",
                        FinancialStatus = "Chưa cập nhật"
                    });
                }
            }

            if (request.Roles.Contains("Donor"))
            {
                var donor = await context.Donors.FirstOrDefaultAsync(d => d.AccountId == user.Id);
                if (donor == null)
                {
                    context.Donors.Add(new Donor
                    {
                        AccountId = user.Id,
                        FullName = user.UserName ?? "Nhà tài trợ",
                        Email = user.Email
                    });
                }
            }

            await context.SaveChangesAsync(default);
        }

        if (!string.IsNullOrEmpty(currentUser.Id) && Guid.TryParse(currentUser.Id, out Guid adminId))
        {
            await logService.LogAsync(adminId, "Update", "Admin", $"Cập nhật tài khoản {user.UserName}. Trạng thái kích hoạt: {request.IsActive}, các vai trò mới: {string.Join(", ", request.Roles ?? new())}");
        }

        return TypedResults.NoContent();
    }

    public static async Task<IResult> DeleteUser(
        Guid id, 
        UserManager<Account> userManager, 
        IApplicationDbContext context,
        IUser currentUser,
        ISystemLogService logService)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user == null) return TypedResults.NotFound();

        var employee = await context.Employees.FirstOrDefaultAsync(e => e.AccountId == id);
        if (employee != null) context.Employees.Remove(employee);

        var adopter = await context.Adopters.FirstOrDefaultAsync(a => a.AccountId == id);
        if (adopter != null) context.Adopters.Remove(adopter);

        var donor = await context.Donors.FirstOrDefaultAsync(d => d.AccountId == id);
        if (donor != null) context.Donors.Remove(donor);

        await context.SaveChangesAsync(default);
        
        var username = user.UserName;
        await userManager.DeleteAsync(user);

        if (!string.IsNullOrEmpty(currentUser.Id) && Guid.TryParse(currentUser.Id, out Guid adminId))
        {
            await logService.LogAsync(adminId, "Delete", "Admin", $"Xóa tài khoản: {username}");
        }

        return TypedResults.NoContent();
    }

    public static async Task<IResult> BackupDatabase(
        IApplicationDbContext context,
        IUser currentUser,
        ISystemLogService logService)
    {
        try
        {
            var connStr = context.Database.GetConnectionString();
            var builder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(connStr);
            var databaseName = builder.InitialCatalog;

            // Truy vấn đường dẫn vật lý thực tế của file .mdf từ hệ quản trị CSDL SQL Server
            // Điều này đảm bảo đường dẫn backup luôn nằm trong filesystem mà SQL Server có quyền truy cập
            // (kể cả khi SQL Server chạy trong Docker Container Linux còn Web chạy trên Host Windows)
            string? dbFile = null;
            try
            {
                dbFile = await context.Database
                    .SqlQueryRaw<string>("SELECT physical_name AS Value FROM sys.database_files WHERE file_id = 1")
                    .FirstOrDefaultAsync(cancellationToken: default);
            }
            catch
            {
                dbFile = await context.Database
                    .SqlQueryRaw<string>("SELECT TOP 1 physical_name AS Value FROM sys.master_files WHERE database_id = DB_ID() AND file_id = 1")
                    .FirstOrDefaultAsync(cancellationToken: default);
            }

            if (string.IsNullOrEmpty(dbFile))
            {
                return TypedResults.BadRequest(new { message = "Không thể xác định đường dẫn lưu trữ của cơ sở dữ liệu." });
            }

            // Thay đổi đuôi file .mdf thành .bak để lưu file sao lưu vào cùng thư mục với dữ liệu gốc của DB
            var backupPath = Path.ChangeExtension(dbFile, ".bak");

            // Execute SQL backup using string interpolation since SQL Server BACKUP TO DISK does not support parameterized path variables
            var backupName = $"Backup of {databaseName} at {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}";
            var sql = $"BACKUP DATABASE [{databaseName}] TO DISK = '{backupPath.Replace("'", "''")}' WITH FORMAT, INIT, NAME = '{backupName.Replace("'", "''")}'";
#pragma warning disable EF1002
            await context.Database.ExecuteSqlRawAsync(sql, cancellationToken: default);
#pragma warning restore EF1002

            if (!string.IsNullOrEmpty(currentUser.Id) && Guid.TryParse(currentUser.Id, out Guid adminId))
            {
                await logService.LogAsync(adminId, "Backup", "System", $"Thực hiện sao lưu cơ sở dữ liệu '{databaseName}' thành công tại đường dẫn {backupPath}");
            }

            return TypedResults.Ok(new { message = "Sao lưu dữ liệu thành công!", backupFile = backupPath });
        }
        catch (Exception ex)
        {
            return TypedResults.BadRequest(new { message = $"Sao lưu dữ liệu thất bại: {ex.Message}" });
        }
    }

    public static async Task<IResult> RestoreDatabase(
        IApplicationDbContext context,
        IUser currentUser,
        ISystemLogService logService)
    {
        try
        {
            var connStr = context.Database.GetConnectionString();
            var builder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(connStr);
            var databaseName = builder.InitialCatalog;

            // Connect to master database to drop connections and restore
            builder.InitialCatalog = "master";
            var masterConnStr = builder.ConnectionString;

            string? dbFile = null;
            using (var conn = new Microsoft.Data.SqlClient.SqlConnection(masterConnStr))
            {
                await conn.OpenAsync();
                var getPathSql = "SELECT physical_name FROM sys.master_files WHERE database_id = DB_ID(@DbName) AND file_id = 1";
                using (var cmd = new Microsoft.Data.SqlClient.SqlCommand(getPathSql, conn))
                {
                    cmd.Parameters.AddWithValue("@DbName", databaseName);
                    var result = await cmd.ExecuteScalarAsync();
                    dbFile = result?.ToString();
                }
            }

            if (string.IsNullOrEmpty(dbFile))
            {
                return TypedResults.BadRequest(new { message = "Không thể xác định đường dẫn file sao lưu để phục hồi." });
            }

            var backupPath = Path.ChangeExtension(dbFile, ".bak");

            using (var conn = new Microsoft.Data.SqlClient.SqlConnection(masterConnStr))
            {
                await conn.OpenAsync();
                
                // Set database to SINGLE_USER to kill existing connections
                var setSingleUserSql = $"ALTER DATABASE [{databaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;";
                using (var cmd = new Microsoft.Data.SqlClient.SqlCommand(setSingleUserSql, conn))
                {
                    await cmd.ExecuteNonQueryAsync();
                }

                // Restore database using string interpolation since SQL Server RESTORE FROM DISK does not support parameterized path variables
                var restoreSql = $"RESTORE DATABASE [{databaseName}] FROM DISK = '{backupPath.Replace("'", "''")}' WITH REPLACE;";
                using (var cmd = new Microsoft.Data.SqlClient.SqlCommand(restoreSql, conn))
                {
                    await cmd.ExecuteNonQueryAsync();
                }

                // Restore database back to MULTI_USER
                var setMultiUserSql = $"ALTER DATABASE [{databaseName}] SET MULTI_USER;";
                using (var cmd = new Microsoft.Data.SqlClient.SqlCommand(setMultiUserSql, conn))
                {
                    await cmd.ExecuteNonQueryAsync();
                }

                // Clear all connection pools to force EF Core to open fresh connections instead of using severed ones
                Microsoft.Data.SqlClient.SqlConnection.ClearAllPools();
            }

            if (!string.IsNullOrEmpty(currentUser.Id) && Guid.TryParse(currentUser.Id, out Guid adminId))
            {
                await logService.LogAsync(adminId, "Restore", "System", $"Thực hiện phục hồi cơ sở dữ liệu '{databaseName}' từ bản sao lưu tại đường dẫn {backupPath}");
            }

            return TypedResults.Ok(new { message = "Phục hồi dữ liệu thành công! Vui lòng tải lại trang." });
        }
        catch (Exception ex)
        {
            // Trong trường hợp lỗi xảy ra, cố gắng đảm bảo database được đưa về chế độ MULTI_USER
            try
            {
                var connStr = context.Database.GetConnectionString();
                var builder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(connStr);
                var databaseName = builder.InitialCatalog;
                builder.InitialCatalog = "master";
                using (var conn = new Microsoft.Data.SqlClient.SqlConnection(builder.ConnectionString))
                {
                    await conn.OpenAsync();
                    var setMultiUserSql = $"ALTER DATABASE [{databaseName}] SET MULTI_USER;";
                    using (var cmd = new Microsoft.Data.SqlClient.SqlCommand(setMultiUserSql, conn))
                    {
                        await cmd.ExecuteNonQueryAsync();
                    }
                    // Clear all connection pools to force EF Core to open fresh connections instead of using severed ones
                    Microsoft.Data.SqlClient.SqlConnection.ClearAllPools();
                }
            }
            catch { /* Bỏ qua nếu không thể đặt lại */ }

            return TypedResults.Ok(new { message = $"Phục hồi dữ liệu thất bại: {ex.Message}" });
        }
    }

    public class CreateUserRequest
    {
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? Email { get; set; }
        public List<string>? Roles { get; set; }
        public string? FullName { get; set; }
        public string? Position { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }

    public class UpdateUserRequest
    {
        public bool IsActive { get; set; }
        public List<string>? Roles { get; set; }
    }
}
