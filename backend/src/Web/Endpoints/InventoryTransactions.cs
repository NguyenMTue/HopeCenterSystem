using backend.Application.InventoryTransactions.Commands.CreateInventoryTransaction;
using backend.Application.InventoryTransactions.Queries.GetInventoryTransactions;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class InventoryTransactions : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetInventoryTransactions, "");
        groupBuilder.MapPost(CreateInventoryTransaction, "");
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
}
