using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.AdoptionApplications.Queries.GetAdoptionApplications;

public record GetAdoptionApplicationsQuery : IRequest<AdoptionApplicationsVm>;

public class GetAdoptionApplicationsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAdoptionApplicationsQuery, AdoptionApplicationsVm>
{
    public async Task<AdoptionApplicationsVm> Handle(GetAdoptionApplicationsQuery request, CancellationToken cancellationToken)
    {
        return new AdoptionApplicationsVm
        {
            Lists = await context.AdoptionApplications
                .AsNoTracking()
                .ProjectTo<AdoptionApplicationDto>(mapper.ConfigurationProvider)
                .OrderByDescending(t => t.SubmitDate)
                .ToListAsync(cancellationToken)
        };
    }
}

public class AdoptionApplicationsVm
{
    public IReadOnlyCollection<AdoptionApplicationDto> Lists { get; init; } = Array.Empty<AdoptionApplicationDto>();
}

public class AdoptionApplicationDto
{
    public Guid Id { get; init; }
    public Guid? AdopterId { get; init; }
    public Guid? ChildId { get; init; }
    public DateTime SubmitDate { get; init; }
    public ApplicationStatus Status { get; init; }
    public Guid? ApproverId { get; init; }
    public string? RejectionReason { get; init; }
    public string? Reason { get; init; }
    public string? Notes { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.AdoptionApplication, AdoptionApplicationDto>();
        }
    }
}
