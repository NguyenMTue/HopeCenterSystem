using backend.Application.Common.Interfaces;
using backend.Application.Common.Mappings;
using backend.Application.Common.Models;
using backend.Domain.Enums;

namespace backend.Application.Donations.Queries.GetDonations;

public record GetDonationsQuery : IRequest<PaginatedList<DonationDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public DonationType? DonationType { get; init; }
}

public class GetDonationsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetDonationsQuery, PaginatedList<DonationDto>>
{
    public async Task<PaginatedList<DonationDto>> Handle(GetDonationsQuery request, CancellationToken cancellationToken)
    {
        var query = context.Donations.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(x => x.DonorName.Contains(request.SearchTerm));
        }

        if (request.DonationType.HasValue)
        {
            query = query.Where(x => x.DonationType == request.DonationType.Value);
        }

        return await query
            .OrderByDescending(t => t.ReceiveDate)
            .ProjectTo<DonationDto>(mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
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

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.Donation, DonationDto>();
        }
    }
}
