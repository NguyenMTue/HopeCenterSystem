using backend.Application.InventoryTransactions.Commands.CreateInventoryTransaction;
using backend.Application.InventoryTransactions.Commands.UpdateInventoryTransactionStatus;
using backend.Application.InventoryTransactions.Queries.GetInventoryTransactions;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class InventoryTransactions : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetInventoryTransactions, "");
        groupBuilder.MapPost(CreateInventoryTransaction, "");
        groupBuilder.MapPut(UpdateInventoryTransactionStatus, "{id}");
    }

    public static async Task<Ok<InventoryTransactionsVm>> GetInventoryTransactions(ISender sender)
    {
        var result = await sender.Send(new GetInventoryTransactionsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateInventoryTransaction(ISender sender, CreateInventoryTransactionCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/InventoryTransactions/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateInventoryTransactionStatus(ISender sender, Guid id, UpdateInventoryTransactionStatusCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }
}
