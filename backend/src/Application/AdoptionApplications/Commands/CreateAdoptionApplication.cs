using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.AdoptionApplications.Commands.CreateAdoptionApplication;

public record CreateAdoptionApplicationCommand : IRequest<Guid>
{
    public Guid? AdopterId { get; init; }
    public Guid? ChildId { get; init; }
    public string? Reason { get; init; }
    public string? Notes { get; init; }
}

public class CreateAdoptionApplicationCommandHandler(IApplicationDbContext context, IUser user) : IRequestHandler<CreateAdoptionApplicationCommand, Guid>
{
    public async Task<Guid> Handle(CreateAdoptionApplicationCommand request, CancellationToken cancellationToken)
    {
        Guid? adopterId = request.AdopterId;

        // Tự động giải quyết AdopterId dựa trên user đang đăng nhập nếu chưa được truyền lên
        if (adopterId == null || adopterId == Guid.Empty)
        {
            var userIdStr = user.Id;
            if (!string.IsNullOrEmpty(userIdStr) && Guid.TryParse(userIdStr, out var accountId))
            {
                var adopter = await context.Adopters
                    .FirstOrDefaultAsync(a => a.AccountId == accountId, cancellationToken);
                if (adopter != null)
                {
                    adopterId = adopter.Id;
                }
            }
        }

        var entity = new AdoptionApplication
        {
            AdopterId = adopterId,
            ChildId = request.ChildId,
            Reason = request.Reason,
            Notes = request.Notes,
            SubmitDate = DateTime.UtcNow,
            Status = ApplicationStatus.Pending
        };

        context.AdoptionApplications.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
