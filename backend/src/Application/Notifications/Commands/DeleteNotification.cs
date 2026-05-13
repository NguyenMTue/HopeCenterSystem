using backend.Application.Common.Interfaces;

namespace backend.Application.Notifications.Commands.DeleteNotification;

public record DeleteNotificationCommand(Guid Id) : IRequest;

public class DeleteNotificationCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteNotificationCommand>
{
    public async Task Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Notifications
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        context.Notifications.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }
}
