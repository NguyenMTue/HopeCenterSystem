using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Notifications.Commands.CreateNotification;

public record CreateNotificationCommand : IRequest<Guid>
{
    public Guid AccountId { get; init; }
    public string Title { get; init; } = null!;
    public string Message { get; init; } = null!;
}

public class CreateNotificationCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateNotificationCommand, Guid>
{
    public async Task<Guid> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        var entity = new Notification
        {
            AccountId = request.AccountId,
            Title = request.Title,
            Message = request.Message,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };

        context.Notifications.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
