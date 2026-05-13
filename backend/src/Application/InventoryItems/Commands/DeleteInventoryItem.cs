using backend.Application.Common.Interfaces;

namespace backend.Application.InventoryItems.Commands.DeleteInventoryItem;

public record DeleteInventoryItemCommand(Guid Id) : IRequest;

public class DeleteInventoryItemCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteInventoryItemCommand>
{
    public async Task Handle(DeleteInventoryItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.InventoryItems
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        context.InventoryItems.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }
}
