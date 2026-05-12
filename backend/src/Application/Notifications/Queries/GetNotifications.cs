using backend.Application.Common.Interfaces;

namespace backend.Application.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery : IRequest<NotificationsVm>;

public class GetNotificationsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetNotificationsQuery, NotificationsVm>
{
    public async Task<NotificationsVm> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        return new NotificationsVm
        {
            Lists = await context.Notifications
                .AsNoTracking()
                .ProjectTo<NotificationDto>(mapper.ConfigurationProvider)
                .OrderByDescending(t => t.SentAt)
                .ToListAsync(cancellationToken)
        };
    }
}

public class NotificationsVm
{
    public IReadOnlyCollection<NotificationDto> Lists { get; init; } = Array.Empty<NotificationDto>();
}

public class NotificationDto
{
    public Guid Id { get; init; }
    public Guid AccountId { get; init; }
    public string Title { get; init; } = null!;
    public string Message { get; init; } = null!;
    public DateTime SentAt { get; init; }
    public bool IsRead { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.Notification, NotificationDto>();
        }
    }
}
