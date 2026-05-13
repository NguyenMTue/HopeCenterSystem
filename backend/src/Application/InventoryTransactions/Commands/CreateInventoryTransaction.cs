using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Application.InventoryTransactions.Commands.CreateInventoryTransaction;

public record CreateInventoryTransactionCommand : IRequest<Guid>
{
    public Guid ItemId { get; init; }
    public Guid? EmployeeId { get; init; }
    public TransactionType Type { get; init; }
    public int Quantity { get; init; }
    public string? Reason { get; init; }
    public string? Notes { get; init; }
    public string? ReferenceDocument { get; init; }
}

public class CreateInventoryTransactionCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateInventoryTransactionCommand, Guid>
{
    public async Task<Guid> Handle(CreateInventoryTransactionCommand request, CancellationToken cancellationToken)
    {
        var item = await context.InventoryItems
            .FindAsync(new object[] { request.ItemId }, cancellationToken);

        Guard.Against.NotFound(request.ItemId, item);

        var entity = new InventoryTransaction
        {
            ItemId = request.ItemId,
            EmployeeId = request.EmployeeId,
            Type = request.Type,
            Quantity = request.Quantity,
            Reason = request.Reason,
            Notes = request.Notes,
            ReferenceDocument = request.ReferenceDocument,
            TransactionDate = DateTime.UtcNow
        };

        if (request.Type == TransactionType.Import)
        {
            item.CurrentQuantity += request.Quantity;
        }
        else if (request.Type == TransactionType.Export)
        {
            if (item.CurrentQuantity < request.Quantity)
            {
                throw new InvalidOperationException($"Số lượng trong kho không đủ để xuất (Hiện có: {item.CurrentQuantity}, Yêu cầu: {request.Quantity})");
            }
            item.CurrentQuantity -= request.Quantity;
        }

        context.InventoryTransactions.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
