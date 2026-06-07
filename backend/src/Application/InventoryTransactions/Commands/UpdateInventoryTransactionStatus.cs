using backend.Application.Common.Interfaces;
using backend.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.InventoryTransactions.Commands.UpdateInventoryTransactionStatus;

public record UpdateInventoryTransactionStatusCommand : IRequest
{
    public Guid Id { get; init; }
    public bool Approved { get; init; }
}

public class UpdateInventoryTransactionStatusCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateInventoryTransactionStatusCommand>
{
    public async Task Handle(UpdateInventoryTransactionStatusCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.InventoryTransactions
            .Include(t => t.InventoryItem)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        var notes = entity.Notes ?? "";
        if (!notes.Contains("[ĐANG CHỜ DUYỆT]"))
        {
            throw new InvalidOperationException("This request has already been processed or is not in pending state.");
        }

        if (request.Approved)
        {
            // Process approval: deduct stock if type is Export
            if (entity.Type == TransactionType.Export && entity.InventoryItem != null)
            {
                if (entity.InventoryItem.CurrentQuantity < entity.Quantity)
                {
                    throw new InvalidOperationException($"Số lượng tồn kho không đủ để xuất (Hiện có: {entity.InventoryItem.CurrentQuantity}, Yêu cầu: {entity.Quantity})");
                }
                entity.InventoryItem.CurrentQuantity -= entity.Quantity;
            }
            else if (entity.Type == TransactionType.Import && entity.InventoryItem != null)
            {
                entity.InventoryItem.CurrentQuantity += entity.Quantity;
            }

            entity.Notes = notes.Replace("[ĐANG CHỜ DUYỆT]", "[ĐÃ DUYỆT]");
        }
        else
        {
            // Process rejection: do not deduct stock, just mark notes
            entity.Notes = notes.Replace("[ĐANG CHỜ DUYỆT]", "[ĐÃ TỪ CHỐI]");
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
