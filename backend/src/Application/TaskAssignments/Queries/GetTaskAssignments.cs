using backend.Application.Common.Interfaces;

namespace backend.Application.TaskAssignments.Queries.GetTaskAssignments;

public record GetTaskAssignmentsQuery : IRequest<TaskAssignmentsVm>;

public class GetTaskAssignmentsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetTaskAssignmentsQuery, TaskAssignmentsVm>
{
    public async Task<TaskAssignmentsVm> Handle(GetTaskAssignmentsQuery request, CancellationToken cancellationToken)
    {
        return new TaskAssignmentsVm
        {
            Lists = await context.TaskAssignments
                .AsNoTracking()
                .ProjectTo<TaskAssignmentDto>(mapper.ConfigurationProvider)
                .OrderBy(t => t.DueDate)
                .ToListAsync(cancellationToken)
        };
    }
}

public class TaskAssignmentsVm
{
    public IReadOnlyCollection<TaskAssignmentDto> Lists { get; init; } = Array.Empty<TaskAssignmentDto>();
}

public class TaskAssignmentDto
{
    public Guid Id { get; init; }
    public Guid? AssignerId { get; init; }
    public Guid? AssigneeId { get; init; }
    public string TaskName { get; init; } = null!;
    public DateTime? DueDate { get; init; }
    public string Status { get; init; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.TaskAssignment, TaskAssignmentDto>();
        }
    }
}
