using backend.Application.Common.Interfaces;

namespace backend.Application.DailyCareTasks.Queries;

public record GetDailyCareTasksQuery : IRequest<DailyCareTasksVm>
{
    public Guid? EmployeeId { get; init; }
    public DateTime? TaskDate { get; init; }
}

public class GetDailyCareTasksQueryHandler(IApplicationDbContext context, IMapper mapper) 
    : IRequestHandler<GetDailyCareTasksQuery, DailyCareTasksVm>
{
    public async Task<DailyCareTasksVm> Handle(GetDailyCareTasksQuery request, CancellationToken cancellationToken)
    {
        var query = context.DailyCareTasks.AsNoTracking();

        if (request.EmployeeId.HasValue)
        {
            query = query.Where(t => t.EmployeeId == request.EmployeeId.Value);
        }

        var date = request.TaskDate?.Date ?? DateTime.UtcNow.Date;
        query = query.Where(t => t.TaskDate.Date == date);

        var list = await query
            .ProjectTo<DailyCareTaskDto>(mapper.ConfigurationProvider)
            .OrderBy(t => t.Session)
            .ThenBy(t => t.CareType)
            .ToListAsync(cancellationToken);

        return new DailyCareTasksVm { Lists = list };
    }
}

public class DailyCareTasksVm
{
    public IReadOnlyCollection<DailyCareTaskDto> Lists { get; init; } = Array.Empty<DailyCareTaskDto>();
}

public class DailyCareTaskDto
{
    public Guid Id { get; init; }
    public Guid ChildId { get; init; }
    public string? ChildName { get; init; }
    public Guid? EmployeeId { get; init; }
    public string TaskName { get; init; } = null!;
    public string Session { get; init; } = "Sáng";
    public string CareType { get; init; } = "BasicCare";
    public bool IsCompleted { get; init; }
    public string? Note { get; init; }
    public DateTime TaskDate { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.DailyCareTask, DailyCareTaskDto>()
                .ForMember(d => d.ChildName, opt => opt.MapFrom(s => s.Child.FullName));
        }
    }
}
