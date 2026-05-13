using backend.Application.Children.Commands;
using backend.Application.Children.Queries;
using backend.Application.Common.Models;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Children : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetChildren);
        groupBuilder.MapGet(GetChildById, "{id}");
        groupBuilder.MapPost(CreateChild);
        groupBuilder.MapPut(UpdateChild, "{id}");
        groupBuilder.MapDelete(DeleteChild, "{id}");
    }

    public static async Task<Ok<PaginatedList<ChildDto>>> GetChildren(ISender sender, [AsParameters] GetChildrenQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public static async Task<Ok<ChildDto>> GetChildById(ISender sender, Guid id)
    {
        var result = await sender.Send(new GetChildByIdQuery(id));
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateChild(ISender sender, CreateChildCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Children/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateChild(ISender sender, Guid id, UpdateChildCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteChild(ISender sender, Guid id)
    {
        await sender.Send(new DeleteChildCommand(id));
        return TypedResults.NoContent();
    }
}
