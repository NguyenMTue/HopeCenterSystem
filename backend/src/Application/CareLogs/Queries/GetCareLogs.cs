using backend.Application.Common.Interfaces;

namespace backend.Application.CareLogs.Queries.GetCareLogs;

public record GetCareLogsQuery : IRequest<CareLogsVm>;

public class GetCareLogsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetCareLogsQuery, CareLogsVm>
{
    public async Task<CareLogsVm> Handle(GetCareLogsQuery request, CancellationToken cancellationToken)
    {
        return new CareLogsVm
        {
            Lists = await context.CareLogs
                .AsNoTracking()
                .ProjectTo<CareLogDto>(mapper.ConfigurationProvider)
                .OrderByDescending(t => t.LogTime)
                .ToListAsync(cancellationToken)
        };
    }
}

public class CareLogsVm
{
    public IReadOnlyCollection<CareLogDto> Lists { get; init; } = Array.Empty<CareLogDto>();
}

public class CareLogDto
{
    public Guid Id { get; init; }
    public Guid? PlanId { get; init; }
    public Guid? EmployeeId { get; init; }
    public DateTime LogTime { get; init; }
    public string? ActivityDetails { get; init; }
    public string? Status { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.CareLog, CareLogDto>();
        }
    }
}
