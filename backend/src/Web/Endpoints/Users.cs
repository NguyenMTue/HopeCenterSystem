using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using backend.Domain.Entities;
using backend.Application.Users.Queries.GetUsers;
using backend.Application.Users.Commands.RegisterUser;

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
        groupBuilder.MapPost(Register, "register-custom");

        groupBuilder.MapGet(GetUsers);

        // Thêm API Logout custom
        groupBuilder.MapPost(Logout, "logout").RequireAuthorization();
        
        // Endpoint chẩn đoán
        groupBuilder.MapPost(TestLogin, "test-login");
    }

    public static async Task<Created<Guid>> Register(ISender sender, RegisterUserCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Users/{id}", id);
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

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}