using backend.Application.Common.Interfaces;

namespace backend.Application.Notifications.Commands.UpdateNotification;

public record MarkNotificationAsReadCommand(Guid Id) : IRequest;

public class MarkNotificationAsReadCommandHandler(IApplicationDbContext context) : IRequestHandler<MarkNotificationAsReadCommand>
{
    public async Task Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Notifications
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.IsRead = true;

        await context.SaveChangesAsync(cancellationToken);
    }
}
