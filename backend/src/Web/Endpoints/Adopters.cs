using backend.Application.Adopters.Commands.CreateAdopter;
using backend.Application.Adopters.Commands.DeleteAdopter;
using backend.Application.Adopters.Commands.UpdateAdopter;
using backend.Application.Adopters.Queries.GetAdopterById;
using backend.Application.Adopters.Queries.GetAdopters;
using backend.Application.Common.Models;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Adopters : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetAdopters);
        groupBuilder.MapGet(GetAdopterById, "{id}");
        groupBuilder.MapPost(CreateAdopter);
        groupBuilder.MapPut(UpdateAdopter, "{id}");
        groupBuilder.MapDelete(DeleteAdopter, "{id}");
    }

    public static async Task<Ok<PaginatedList<AdopterDto>>> GetAdopters(ISender sender, [AsParameters] GetAdoptersQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public static async Task<Ok<AdopterDto>> GetAdopterById(ISender sender, Guid id)
    {
        var result = await sender.Send(new GetAdopterByIdQuery(id));
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateAdopter(ISender sender, CreateAdopterCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Adopters/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateAdopter(ISender sender, Guid id, UpdateAdopterCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteAdopter(ISender sender, Guid id)
    {
        await sender.Send(new DeleteAdopterCommand(id));
        return TypedResults.NoContent();
    }
}
