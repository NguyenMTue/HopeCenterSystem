using backend.Application.SystemLogs.Queries.GetSystemLogs;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class SystemLogs : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder
            .MapGet(GetSystemLogs);
    }

    public static async Task<Ok<SystemLogsVm>> GetSystemLogs(ISender sender)
    {
        var result = await sender.Send(new GetSystemLogsQuery());
        return TypedResults.Ok(result);
    }
}
