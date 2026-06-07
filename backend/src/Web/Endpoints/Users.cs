using backend.Application.Common.Interfaces;
using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using backend.Domain.Entities;
using backend.Application.Users.Queries.GetUsers;
using backend.Application.Users.Commands.RegisterUser;
using Microsoft.EntityFrameworkCore;

namespace backend.Web.Endpoints;

public class Users : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        // Thay vì MapIdentityApi (nó tự tạo /register), ta Map thủ công hoặc đổi tên endpoint register của ta
        // Cách đơn giản nhất là đổi tên endpoint custom thành /sign-up hoặc cấu hình lại MapIdentityApi
        
        // Đăng ký các Identity Endpoints chuẩn (Login, Refresh, etc.)
        var identityGroup = groupBuilder.MapGroup("");
        identityGroup.MapIdentityApi<Account>();

        // Chỉnh sửa: Đổi tên endpoint register custom để tránh trùng lặp hoàn toàn với MapIdentityApi
        groupBuilder.MapPost(RegisterUser, "register-custom")
            .WithName("RegisterCustom");

        groupBuilder.MapGet(GetUsers)
            .WithName("GetUsers");

        groupBuilder.MapGet(GetCurrentUser, "me")
            .WithName("GetCurrentUser")
            .RequireAuthorization();

        // Thêm API Logout custom
        groupBuilder.MapPost(Logout, "logout")
            .WithName("LogoutCustom")
            .RequireAuthorization();
        
        // Endpoint chẩn đoán
        groupBuilder.MapPost(TestLogin, "test-login")
            .WithName("TestLogin");

        // Custom Login endpoint supporting both email and username
        groupBuilder.MapPost(LoginCustom, "login-custom")
            .WithName("LoginCustom");

        // Custom endpoint to complete adopter profile anonymously
        groupBuilder.MapPost(CompleteProfile, "complete-profile")
            .WithName("CompleteProfile");
    }

    public static async Task<IResult> RegisterUser(ISender sender, RegisterUserCommand command)
    {
        try
        {
            var id = await sender.Send(command);
            return TypedResults.Created($"/api/Users/{id}", id);
        }
        catch (Exception ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }

    // Đổi ApplicationUser thành Account
    public static async Task<IResult> Logout(SignInManager<Account> signInManager)
    {
        await signInManager.SignOutAsync();
        return TypedResults.Ok();
    }

    public static async Task<Ok<List<UserDto>>> GetUsers(ISender sender)
    {
        var result = await sender.Send(new GetUsersQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<IResult> GetCurrentUser(ISender sender, IUser currentUser, UserManager<Account> userManager)
    {
        var userId = currentUser.Id;
        if (string.IsNullOrEmpty(userId)) return TypedResults.Unauthorized();

        var users = await sender.Send(new GetUsersQuery());
        var user = users.FirstOrDefault(u => u.Id.ToString() == userId);

        if (user == null) return TypedResults.NotFound();

        return TypedResults.Ok(user);
    }
    
    public static async Task<IResult> TestLogin(
        [FromBody] LoginRequest request, 
        UserManager<Account> userManager, 
        SignInManager<Account> signInManager)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return TypedResults.BadRequest("Không tìm thấy user với email này.");

        var checkPassword = await userManager.CheckPasswordAsync(user, request.Password);
        if (!checkPassword)
            return TypedResults.BadRequest("Sai mật khẩu (CheckPasswordAsync = false).");

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        return TypedResults.Ok(new 
        { 
            Message = "Test SignInManager",
            Succeeded = result.Succeeded,
            IsLockedOut = result.IsLockedOut,
            IsNotAllowed = result.IsNotAllowed,
            RequiresTwoFactor = result.RequiresTwoFactor
        });
    }

    public static async Task<IResult> LoginCustom(
        [FromBody] LoginRequest request,
        [FromQuery] bool? useCookies,
        [FromQuery] bool? useSessionCookies,
        UserManager<Account> userManager,
        SignInManager<Account> signInManager,
        IApplicationDbContext context)
    {
        var user = await userManager.FindByNameAsync(request.Email) 
                   ?? await userManager.FindByEmailAsync(request.Email);
                   
        if (user == null)
        {
            return TypedResults.Unauthorized();
        }

        var checkPassword = await userManager.CheckPasswordAsync(user, request.Password);
        if (!checkPassword)
        {
            return TypedResults.Unauthorized();
        }

        // Check if user is an Adopter, and if so, check if their profile is completed
        var roles = await userManager.GetRolesAsync(user);
        if (roles.Contains(backend.Domain.Constants.Roles.Adopter))
        {
            var adopter = await context.Adopters.FirstOrDefaultAsync(a => a.AccountId == user.Id);
            if (adopter == null || adopter.IDCard == "Chưa cập nhật" || string.IsNullOrWhiteSpace(adopter.Address) || string.IsNullOrWhiteSpace(adopter.MaritalStatus))
            {
                return TypedResults.BadRequest(new { 
                    status = "IncompleteProfile", 
                    accountId = user.Id, 
                    detail = "Vui lòng hoàn thành thông tin cá nhân trước khi đăng nhập." 
                });
            }
        }

        var useCookie = useCookies == true || useSessionCookies == true;
        var isPersistent = useCookies == true && useSessionCookies != true;

        var result = await signInManager.PasswordSignInAsync(user, request.Password, isPersistent, lockoutOnFailure: true);

        if (!result.Succeeded)
        {
            return TypedResults.Unauthorized();
        }

        if (useCookie)
        {
            return TypedResults.Ok();
        }

        var principal = await signInManager.CreateUserPrincipalAsync(user);
        return TypedResults.SignIn(principal, authenticationScheme: IdentityConstants.BearerScheme);
    }

    public static async Task<IResult> CompleteProfile(
        [FromBody] CompleteProfileRequest request,
        IApplicationDbContext context)
    {
        var adopter = await context.Adopters
            .Include(a => a.Account)
            .FirstOrDefaultAsync(a => a.AccountId == request.AccountId);
            
        if (adopter == null)
        {
            return TypedResults.BadRequest("Không tìm thấy hồ sơ người nhận nuôi tương ứng.");
        }

        adopter.FullName = request.FullName;
        adopter.IDCard = request.IdCard;
        adopter.MaritalStatus = request.MaritalStatus;
        adopter.Address = request.Address;
        adopter.FinancialStatus = $"Thu nhập: {request.IncomeScope} | Nghề nghiệp: {request.Occupation}";

        if (adopter.Account != null)
        {
            adopter.Account.PhoneNumber = request.Phone;
        }

        await context.SaveChangesAsync(default);

        return TypedResults.Ok(new { message = "Cập nhật hồ sơ cá nhân thành công!" });
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class CompleteProfileRequest
    {
        public Guid AccountId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string IdCard { get; set; } = string.Empty;
        public string MaritalStatus { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Occupation { get; set; } = string.Empty;
        public string IncomeScope { get; set; } = string.Empty;
    }
}