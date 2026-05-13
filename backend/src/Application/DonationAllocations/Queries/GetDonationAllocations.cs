using backend.Application.Common.Interfaces;

namespace backend.Application.DonationAllocations.Queries.GetDonationAllocations;

public record GetDonationAllocationsQuery : IRequest<DonationAllocationsVm>;

public class GetDonationAllocationsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetDonationAllocationsQuery, DonationAllocationsVm>
{
    public async Task<DonationAllocationsVm> Handle(GetDonationAllocationsQuery request, CancellationToken cancellationToken)
    {
        return new DonationAllocationsVm
        {
            Lists = await context.DonationAllocations
                .AsNoTracking()
                .ProjectTo<DonationAllocationDto>(mapper.ConfigurationProvider)
                .OrderByDescending(t => t.AllocationDate)
                .ToListAsync(cancellationToken)
        };
    }
}

public class DonationAllocationsVm
{
    public IReadOnlyCollection<DonationAllocationDto> Lists { get; init; } = Array.Empty<DonationAllocationDto>();
}

public class DonationAllocationDto
{
    public Guid Id { get; init; }
    public Guid? DonationId { get; init; }
    public string Purpose { get; init; } = null!;
    public decimal AllocatedAmount { get; init; }
    public DateTime AllocationDate { get; init; }
    public Guid? ManagerId { get; init; }
    public string? Notes { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.DonationAllocation, DonationAllocationDto>();
        }
    }
}
