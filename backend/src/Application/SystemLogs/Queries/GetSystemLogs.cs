using backend.Application.Common.Interfaces;

namespace backend.Application.SystemLogs.Queries.GetSystemLogs;

public record GetSystemLogsQuery : IRequest<SystemLogsVm>;

public class GetSystemLogsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetSystemLogsQuery, SystemLogsVm>
{
    public async Task<SystemLogsVm> Handle(GetSystemLogsQuery request, CancellationToken cancellationToken)
    {
        return new SystemLogsVm
        {
            Lists = await context.SystemLogs
                .AsNoTracking()
                .ProjectTo<SystemLogDto>(mapper.ConfigurationProvider)
                .OrderByDescending(t => t.Timestamp)
                .ToListAsync(cancellationToken)
        };
    }
}

public class SystemLogsVm
{
    public IReadOnlyCollection<SystemLogDto> Lists { get; init; } = Array.Empty<SystemLogDto>();
}

public class SystemLogDto
{
    public Guid Id { get; init; }
    public Guid AccountId { get; init; }
    public string? Action { get; init; }
    public string? Details { get; init; }
    public DateTime Timestamp { get; init; }
    public string? Module { get; init; }
    public string? IpAddress { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.SystemLog, SystemLogDto>();
        }
    }
}
