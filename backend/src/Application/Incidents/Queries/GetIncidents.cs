using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.Incidents.Queries.GetIncidents;

public record GetIncidentsQuery : IRequest<IncidentsVm>;

public class GetIncidentsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetIncidentsQuery, IncidentsVm>
{
    public async Task<IncidentsVm> Handle(GetIncidentsQuery request, CancellationToken cancellationToken)
    {
        return new IncidentsVm
        {
            Lists = await context.Incidents
                .AsNoTracking()
                .ProjectTo<IncidentDto>(mapper.ConfigurationProvider)
                .OrderByDescending(t => t.IncidentDate)
                .ToListAsync(cancellationToken)
        };
    }
}

public class IncidentsVm
{
    public IReadOnlyCollection<IncidentDto> Lists { get; init; } = Array.Empty<IncidentDto>();
}

public class IncidentDto
{
    public Guid Id { get; init; }
    public Guid? ChildId { get; init; }
    public string? ChildName { get; init; }
    public Guid? ReporterId { get; init; }
    public DateTime IncidentDate { get; init; }
    public string Description { get; init; } = null!;
    public IncidentSeverity? Severity { get; init; }
    public string? Status { get; init; }
    public string? ResolutionNotes { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.Incident, IncidentDto>()
                .ForMember(d => d.ChildName, opt => opt.MapFrom(s => s.Child != null ? s.Child.FullName : null));
        }
    }
}
