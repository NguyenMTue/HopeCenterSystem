using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.TaskAssignments.Commands.CreateTaskAssignment;

public record CreateTaskAssignmentCommand : IRequest<Guid>
{
    public Guid? AssignerId { get; init; }
    public Guid? AssigneeId { get; init; }
    public string TaskName { get; init; } = null!;
    public DateTime? DueDate { get; init; }
}

public class CreateTaskAssignmentCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateTaskAssignmentCommand, Guid>
{
    public async Task<Guid> Handle(CreateTaskAssignmentCommand request, CancellationToken cancellationToken)
    {
        var entity = new TaskAssignment
        {
            AssignerId = request.AssignerId,
            AssigneeId = request.AssigneeId,
            TaskName = request.TaskName,
            DueDate = request.DueDate,
            Status = "Mới"
        };

        context.TaskAssignments.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
