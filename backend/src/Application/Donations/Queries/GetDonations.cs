using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.Donations.Queries.GetDonations;

public record GetDonationsQuery : IRequest<DonationsVm>;

public class GetDonationsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetDonationsQuery, DonationsVm>
{
    public async Task<DonationsVm> Handle(GetDonationsQuery request, CancellationToken cancellationToken)
    {
        return new DonationsVm
        {
            Lists = await context.Donations
                .AsNoTracking()
                .ProjectTo<DonationDto>(mapper.ConfigurationProvider)
                .OrderByDescending(t => t.ReceiveDate)
                .ToListAsync(cancellationToken)
        };
    }
}

public class DonationsVm
{
    public IReadOnlyCollection<DonationDto> Lists { get; init; } = Array.Empty<DonationDto>();
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
