using backend.Application.Common.Interfaces;

namespace backend.Application.InventoryItems.Commands.UpdateInventoryItem;

public record UpdateInventoryItemCommand : IRequest
{
    public Guid Id { get; init; }
    public string ItemName { get; init; } = null!;
    public string? Category { get; init; }
    public string? Unit { get; init; }
    public int CurrentQuantity { get; init; }
    public int MinStockLevel { get; init; }
}

public class UpdateInventoryItemCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateInventoryItemCommand>
{
    public async Task Handle(UpdateInventoryItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.InventoryItems
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.ItemName = request.ItemName;
        entity.Category = request.Category;
        entity.Unit = request.Unit;
        entity.CurrentQuantity = request.CurrentQuantity;
        entity.MinStockLevel = request.MinStockLevel;

        await context.SaveChangesAsync(cancellationToken);
    }
}
