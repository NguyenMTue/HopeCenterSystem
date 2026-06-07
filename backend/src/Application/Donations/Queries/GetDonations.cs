using backend.Application.Common.Interfaces;
using backend.Application.Common.Mappings;
using backend.Application.Common.Models;
using backend.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Donations.Queries.GetDonations;

public record GetDonationsQuery : IRequest<PaginatedList<DonationDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public DonationType? DonationType { get; init; }
}

public class GetDonationsQueryHandler(IApplicationDbContext context, IMapper mapper, IUser user) : IRequestHandler<GetDonationsQuery, PaginatedList<DonationDto>>
{
    public async Task<PaginatedList<DonationDto>> Handle(GetDonationsQuery request, CancellationToken cancellationToken)
    {
        var query = context.Donations.AsNoTracking();

        var isDonor = user.Roles?.Contains("Donor") ?? false;
        if (isDonor && Guid.TryParse(user.Id, out var accountId))
        {
            var donor = await context.Donors
                .FirstOrDefaultAsync(d => d.AccountId == accountId, cancellationToken);
            if (donor != null)
            {
                query = query.Where(x => x.DonorId == donor.Id);
            }
            else
            {
                query = query.Where(x => false);
            }
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            if (Guid.TryParse(request.SearchTerm, out var searchGuid))
            {
                query = query.Where(x => x.Id == searchGuid);
            }
            else
            {
                query = query.Where(x => x.DonorName.Contains(request.SearchTerm) || x.Id.ToString().Contains(request.SearchTerm));
            }
        }

        if (request.DonationType.HasValue)
        {
            query = query.Where(x => x.DonationType == request.DonationType.Value);
        }

        var list = await query
            .OrderByDescending(t => t.Created)
            .ProjectTo<DonationDto>(mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        // Tính toán trạng thái giải ngân động
        foreach (var item in list.Items)
        {
            if (item.Status == "Chờ phê duyệt")
            {
                item.DisbursementStatus = "Chờ phê duyệt";
            }
            else if (item.DonationType == DonationType.Item)
            {
                // Đối với hiện vật, khi đã duyệt tiếp nhận thì coi như hoàn tất phân bổ vào kho
                item.DisbursementStatus = "Đã hoàn tất";
            }
            else if (item.TotalAmount > 0)
            {
                var percent = (item.TotalAllocatedAmount / item.TotalAmount) * 100;
                if (percent <= 0)
                {
                    item.DisbursementStatus = "Đã tiếp nhận";
                }
                else if (percent >= 100)
                {
                    item.DisbursementStatus = "Đã hoàn tất";
                }
                else
                {
                    item.DisbursementStatus = $"Đã phân bổ {(int)percent}%";
                }
            }
            else
            {
                item.DisbursementStatus = "Đã tiếp nhận";
            }
        }

        return list;
    }
}

public class DonationDto
{
    public Guid Id { get; init; }
    public string DonorName { get; init; } = null!;
    public DonationType? DonationType { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal TotalAllocatedAmount { get; init; }
    public DateTime ReceiveDate { get; init; }
    public string Status { get; init; } = null!;
    public string DisbursementStatus { get; set; } = null!;
    public Guid? InventoryItemId { get; init; }
    public string? ItemName { get; init; }
    public int? Quantity { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.Donation, DonationDto>()
                .ForMember(d => d.ItemName, opt => opt.MapFrom(s => s.InventoryItem != null ? s.InventoryItem.ItemName : null));
        }
    }
}

