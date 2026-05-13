using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.InventoryItems.Commands.CreateInventoryItem;

public record CreateInventoryItemCommand : IRequest<Guid>
{
    public string ItemName { get; init; } = null!;
    public string? Category { get; init; }
    public string? Unit { get; init; }
    public int MinStockLevel { get; init; }
}

public class CreateInventoryItemCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateInventoryItemCommand, Guid>
{
    public async Task<Guid> Handle(CreateInventoryItemCommand request, CancellationToken cancellationToken)
    {
        var entity = new InventoryItem
        {
            ItemName = request.ItemName,
            Category = request.Category,
            Unit = request.Unit,
            MinStockLevel = request.MinStockLevel,
            CurrentQuantity = 0
        };

        context.InventoryItems.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
