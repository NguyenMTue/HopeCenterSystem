using backend.Application.InventoryItems.Commands.CreateInventoryItem;
using backend.Application.InventoryItems.Commands.DeleteInventoryItem;
using backend.Application.InventoryItems.Commands.UpdateInventoryItem;
using backend.Application.InventoryItems.Queries.GetInventoryItems;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Http;

namespace backend.Web.Endpoints;

public class InventoryItems : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetInventoryItems, "");
        groupBuilder.MapPost(CreateInventoryItem, "");
        groupBuilder.MapPut(UpdateInventoryItem, "{id}");
        groupBuilder.MapDelete(DeleteInventoryItem, "{id}");
    }

    public static async Task<Ok<InventoryItemsVm>> GetInventoryItems(ISender sender)
    {
        var result = await sender.Send(new GetInventoryItemsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateInventoryItem(ISender sender, CreateInventoryItemCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/InventoryItems/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateInventoryItem(ISender sender, Guid id, UpdateInventoryItemCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteInventoryItem(ISender sender, Guid id)
    {
        await sender.Send(new DeleteInventoryItemCommand(id));
        return TypedResults.NoContent();
    }
}
