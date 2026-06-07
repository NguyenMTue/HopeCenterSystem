using backend.Application.Common.Interfaces;
using backend.Domain.Enums;
using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Donations.Commands.UpdateDonation;

public record UpdateDonationCommand : IRequest
{
    public Guid Id { get; init; }
    public string Status { get; init; } = null!;
}

public class UpdateDonationCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateDonationCommand>
{
    public async Task Handle(UpdateDonationCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Donations
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        var oldStatus = entity.Status;
        entity.Status = request.Status;

        // Nếu chuyển từ "Chờ phê duyệt" sang "Đã tiếp nhận" và là tài trợ hiện vật (Item) thì cộng kho
        if (oldStatus == "Chờ phê duyệt" && request.Status == "Đã tiếp nhận" && entity.DonationType == DonationType.Item && entity.InventoryItemId.HasValue && entity.Quantity.HasValue)
        {
            var item = await context.InventoryItems.FindAsync(new object[] { entity.InventoryItemId.Value }, cancellationToken);
            if (item != null)
            {
                item.CurrentQuantity += entity.Quantity.Value;

                context.InventoryTransactions.Add(new InventoryTransaction
                {
                    ItemId = entity.InventoryItemId.Value,
                    EmployeeId = null,
                    Type = TransactionType.Import,
                    Quantity = entity.Quantity.Value,
                    TransactionDate = DateTime.UtcNow,
                    Reason = $"Nhận tài trợ từ nhà tài trợ: {entity.DonorName}",
                    Notes = $"[TỰ ĐỘNG CẬP NHẬT] Nhập kho từ tài trợ trực tuyến mã #{entity.Id.ToString()[..8].ToUpper()}"
                });
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}

