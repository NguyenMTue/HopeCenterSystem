using backend.Application.Common.Interfaces;

namespace backend.Application.TaskAssignments.Commands.UpdateTaskAssignment;

public record UpdateTaskAssignmentCommand : IRequest
{
    public Guid Id { get; init; }
    public string TaskName { get; init; } = null!;
    public DateTime? DueDate { get; init; }
    public string Status { get; init; } = null!;
}

public class UpdateTaskAssignmentCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateTaskAssignmentCommand>
{
    public async Task Handle(UpdateTaskAssignmentCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.TaskAssignments
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.TaskName = request.TaskName;
        entity.DueDate = request.DueDate;
        entity.Status = request.Status;

        await context.SaveChangesAsync(cancellationToken);
    }
}
