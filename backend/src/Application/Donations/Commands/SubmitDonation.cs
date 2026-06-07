using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace backend.Application.Donations.Commands.SubmitDonation;

public record SubmitDonationCommand : IRequest<Guid>
{
    public DonationType DonationType { get; init; }
    public decimal TotalAmount { get; init; }
    public Guid? InventoryItemId { get; init; }
    public int? Quantity { get; init; }
    
    // Guest fields for anonymous donations
    public string? GuestName { get; init; }
    public string? GuestContact { get; init; }
    public string? Category { get; init; }
    public string? Details { get; init; }
}

public class SubmitDonationCommandHandler(
    IApplicationDbContext context, 
    IUser user,
    UserManager<Account> userManager) : IRequestHandler<SubmitDonationCommand, Guid>
{
    public async Task<Guid> Handle(SubmitDonationCommand request, CancellationToken cancellationToken)
    {
        var userIdStr = user.Id;
        Guid? donorId = null;
        string donorName = request.GuestName ?? "Nhà tài trợ ẩn danh";

        if (!string.IsNullOrEmpty(userIdStr) && Guid.TryParse(userIdStr, out var accountId))
        {
            var donor = await context.Donors
                .FirstOrDefaultAsync(d => d.AccountId == accountId, cancellationToken);
                
            if (donor == null)
            {
                var account = await userManager.FindByIdAsync(accountId.ToString());
                if (account != null)
                {
                    donor = new Donor
                    {
                        AccountId = accountId,
                        FullName = account.UserName ?? account.Email ?? "Nhà tài trợ",
                        Email = account.Email,
                        Phone = account.PhoneNumber
                    };
                    context.Donors.Add(donor);
                    await context.SaveChangesAsync(cancellationToken);
                }
            }

            if (donor != null)
            {
                donorId = donor.Id;
                donorName = donor.FullName;
            }
        }
        else
        {
            // For guests, use the provided GuestName and GuestContact
            if (!string.IsNullOrEmpty(request.GuestName))
            {
                donorName = request.GuestName;
                if (!string.IsNullOrEmpty(request.GuestContact))
                {
                    donorName += $" ({request.GuestContact})";
                }
            }
        }

        Guid? inventoryItemId = request.InventoryItemId;
        if (request.DonationType == DonationType.Item && !inventoryItemId.HasValue && !string.IsNullOrEmpty(request.Category))
        {
            var item = await context.InventoryItems
                .FirstOrDefaultAsync(i => i.Category == request.Category, cancellationToken);
            if (item != null)
            {
                inventoryItemId = item.Id;
            }
        }

        var detailsSuffix = "";
        if (!string.IsNullOrEmpty(request.Details))
        {
            detailsSuffix = $" [{request.Details}]";
        }

        var entity = new Donation
        {
            DonorId = donorId,
            DonorName = donorName + detailsSuffix,
            DonationType = request.DonationType,
            TotalAmount = request.DonationType == DonationType.Cash ? request.TotalAmount : 0,
            Quantity = request.DonationType == DonationType.Item ? (request.Quantity ?? 1) : null,
            InventoryItemId = request.DonationType == DonationType.Item ? inventoryItemId : null,
            ReceiveDate = DateTime.UtcNow,
            Status = "Chờ phê duyệt", // Default status is pending approval
            TotalAllocatedAmount = 0
        };

        context.Donations.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
