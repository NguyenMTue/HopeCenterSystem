using HopeCenterSystem.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HopeCenterSystem.Web.Endpoints;

public class Users : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        // Chỉ giữ dòng này nếu bạn muốn sử dụng các API mặc định của Identity (/login, /register...)
        // Nếu dòng này gây lỗi "Scheme already exists", hãy kiểm tra xem 
        // builder.Services.AddIdentityApiEndpoints đã được gọi ĐÚNG MỘT LẦN ở Program.cs chưa.
        groupBuilder.MapIdentityApi<ApplicationUser>();

        groupBuilder.MapPost(Logout, "logout").RequireAuthorization();
    }

    // Hàm Logout đã sửa ở bước trước
    public static async Task<IResult> Logout(SignInManager<ApplicationUser> signInManager)
    {
        await signInManager.SignOutAsync();
        return TypedResults.Ok();
    }
}
