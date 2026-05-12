using backend.Application.CarePlans.Commands.CreateCarePlan;
using backend.Application.CarePlans.Commands.DeleteCarePlan;
using backend.Application.CarePlans.Commands.UpdateCarePlan;
using backend.Application.CarePlans.Queries.GetCarePlans;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Http;

namespace backend.Web.Endpoints;

public class CarePlans : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetCarePlans, "");
        groupBuilder.MapPost(CreateCarePlan, "");
        groupBuilder.MapPut(UpdateCarePlan, "{id}");
        groupBuilder.MapDelete(DeleteCarePlan, "{id}");
    }

    public static async Task<Ok<CarePlansVm>> GetCarePlans(ISender sender)
    {
        var result = await sender.Send(new GetCarePlansQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateCarePlan(ISender sender, CreateCarePlanCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/CarePlans/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateCarePlan(ISender sender, Guid id, UpdateCarePlanCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteCarePlan(ISender sender, Guid id)
    {
        await sender.Send(new DeleteCarePlanCommand(id));
        return TypedResults.NoContent();
    }
}
