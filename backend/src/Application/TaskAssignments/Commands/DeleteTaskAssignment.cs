using backend.Application.Common.Interfaces;

namespace backend.Application.TaskAssignments.Commands.DeleteTaskAssignment;

public record DeleteTaskAssignmentCommand(Guid Id) : IRequest;

public class DeleteTaskAssignmentCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteTaskAssignmentCommand>
{
    public async Task Handle(DeleteTaskAssignmentCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.TaskAssignments
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        context.TaskAssignments.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }
}
