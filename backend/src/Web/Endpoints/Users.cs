using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using backend.Domain.Entities;

namespace backend.Web.Endpoints;

public class Users : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        // Dòng này tạo ra các API chuẩn: /register, /login, /refresh, /confirmEmail...
        // Nó sẽ sử dụng thực thể Account của bạn
        groupBuilder.MapIdentityApi<Account>();

        // Thêm API Logout custom
        groupBuilder.MapPost(Logout, "logout").RequireAuthorization();
    }

    // Đổi ApplicationUser thành Account
    public static async Task<IResult> Logout(SignInManager<Account> signInManager)
    {
        await signInManager.SignOutAsync();
        return TypedResults.Ok();
    }
}