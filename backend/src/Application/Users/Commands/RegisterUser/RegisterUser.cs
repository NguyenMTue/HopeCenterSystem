using backend.Application.Common.Interfaces;
using backend.Domain.Constants;
using backend.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace backend.Application.Users.Commands.RegisterUser;

public record RegisterUserCommand : IRequest<Guid>
{
    public string Email { get; init; } = null!;
    public string Password { get; init; } = null!;
    public string UserName { get; init; } = null!;
    public List<string> Roles { get; init; } = new();
    public string? FullName { get; init; }
    public string? Position { get; init; }
    public string? Phone { get; init; }
    public string? Address { get; init; }
}

public class RegisterUserCommandHandler(
    UserManager<Account> userManager,
    IApplicationDbContext context) : IRequestHandler<RegisterUserCommand, Guid>
{
    public async Task<Guid> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var user = new Account
        {
            UserName = string.IsNullOrWhiteSpace(request.UserName) ? request.Email : request.UserName,
            Email = request.Email,
            EmailConfirmed = true, // Tự động xác nhận email để dễ test
            IsActive = true
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        // Xử lý Role - Chỉ cho phép đăng ký vai trò Adopter từ bên ngoài
        var rolesToAssign = new List<string> { backend.Domain.Constants.Roles.Adopter };

        foreach (var role in rolesToAssign)
        {
            await userManager.AddToRoleAsync(user, role);
        }

        // Xử lý tạo thông tin chi tiết (Employee hoặc Adopter)
        if (rolesToAssign.Any(r => r == backend.Domain.Constants.Roles.Adopter))
        {
            var adopter = new Adopter
            {
                AccountId = user.Id,
                FullName = request.FullName ?? request.UserName,
                Address = request.Address,
                IDCard = "Chưa cập nhật" // Giá trị mặc định
            };
            context.Adopters.Add(adopter);
        }
        else
        {
            // Nếu có các quyền nhân viên thì tạo bản ghi Employee
            var employee = new Employee
            {
                AccountId = user.Id,
                FullName = request.FullName ?? request.UserName,
                Position = request.Position ?? "Nhân viên mới",
                Phone = request.Phone
            };
            context.Employees.Add(employee);
        }

        await context.SaveChangesAsync(cancellationToken);

        return user.Id;
    }
}
