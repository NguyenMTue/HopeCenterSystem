using backend.Application.CareLogs.Commands.CreateCareLog;
using backend.Application.CareLogs.Queries.GetCareLogs;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class CareLogs : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetCareLogs, "");
        groupBuilder.MapPost(CreateCareLog, "");
    }

    public static async Task<Ok<CareLogsVm>> GetCareLogs(ISender sender)
    {
        var result = await sender.Send(new GetCareLogsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateCareLog(ISender sender, CreateCareLogCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/CareLogs/{id}", id);
    }
}
