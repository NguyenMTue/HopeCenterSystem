using backend.Application.Incidents.Commands.CreateIncident;
using backend.Application.Incidents.Commands.UpdateIncident;
using backend.Application.Incidents.Queries.GetIncidents;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Http;

namespace backend.Web.Endpoints;

public class Incidents : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetIncidents, "");
        groupBuilder.MapPost(CreateIncident, "");
        groupBuilder.MapPut(UpdateIncident, "{id}");
    }

    public static async Task<Ok<IncidentsVm>> GetIncidents(ISender sender)
    {
        var result = await sender.Send(new GetIncidentsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateIncident(ISender sender, CreateIncidentCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Incidents/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateIncident(ISender sender, Guid id, UpdateIncidentCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }
}
