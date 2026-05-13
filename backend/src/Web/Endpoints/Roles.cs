using backend.Application.Roles.Queries;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Roles : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetRoles);
    }

    public static async Task<Ok<List<RoleDto>>> GetRoles(ISender sender)
    {
        var result = await sender.Send(new GetRolesQuery());
        return TypedResults.Ok(result);
    }
}
