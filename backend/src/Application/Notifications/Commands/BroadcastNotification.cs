using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Notifications.Commands.BroadcastNotification;

public record BroadcastNotificationCommand : IRequest
{
    public string Title { get; init; } = null!;
    public string Message { get; init; } = null!;
    public string? TargetRole { get; init; } // Ví dụ: "Donor" hoặc null để gửi tất cả
}

public class BroadcastNotificationCommandHandler(
    IApplicationDbContext context, 
    UserManager<Account> userManager) : IRequestHandler<BroadcastNotificationCommand>
{
    public async Task Handle(BroadcastNotificationCommand request, CancellationToken cancellationToken)
    {
        IList<Account> targetAccounts;
        
        if (!string.IsNullOrEmpty(request.TargetRole))
        {
            targetAccounts = await userManager.GetUsersInRoleAsync(request.TargetRole);
        }
        else
        {
            targetAccounts = await userManager.Users.ToListAsync(cancellationToken);
        }

        foreach (var account in targetAccounts)
        {
            context.Notifications.Add(new Notification
            {
                AccountId = account.Id,
                Title = request.Title,
                Message = request.Message,
                SentAt = DateTime.UtcNow,
                IsRead = false
            });
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
