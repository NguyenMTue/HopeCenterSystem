using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.AdoptionApplications.Commands.UpdateAdoptionApplication;

public record UpdateAdoptionApplicationCommand : IRequest
{
    public Guid Id { get; init; }
    public Guid? ChildId { get; init; }
    public ApplicationStatus Status { get; init; }
    public Guid? ApproverId { get; init; }
    public string? RejectionReason { get; init; }
    public string? Reason { get; init; }
    public string? Notes { get; init; }
    public string? DesiredCriteria { get; init; }
}

public class UpdateAdoptionApplicationCommandHandler(IApplicationDbContext context, IUser user) : IRequestHandler<UpdateAdoptionApplicationCommand>
{
    public async Task Handle(UpdateAdoptionApplicationCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.AdoptionApplications
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        // Enforce role-based status transition rules
        var roles = user.Roles ?? new List<string>();
        var isManager = roles.Contains("Manager");
        var isDirector = roles.Contains("Director");

        if (isManager && !isDirector)
        {
            if (request.Status == ApplicationStatus.Approved || 
                request.Status == ApplicationStatus.Rejected || 
                request.Status == ApplicationStatus.MatchingProposed)
            {
                throw new UnauthorizedAccessException("Manager does not have permission to approve, reject, or propose matching for adoption applications. Only the Director can perform these actions.");
            }
        }

        entity.Status = request.Status;
        entity.ApproverId = request.ApproverId;
        entity.RejectionReason = request.RejectionReason;
        entity.Reason = request.Reason;
        entity.Notes = request.Notes;
        
        if (request.ChildId.HasValue)
        {
            entity.ChildId = request.ChildId.Value;
        }

        if (request.DesiredCriteria != null)
        {
            entity.DesiredCriteria = request.DesiredCriteria;
        }

        if ((request.Status == ApplicationStatus.Approved || 
             request.Status == ApplicationStatus.AdopterAccepted || 
             request.Status == ApplicationStatus.Completed) && 
            entity.ChildId.HasValue)
        {
            var child = await context.Children
                .FindAsync(new object[] { entity.ChildId.Value }, cancellationToken);

            if (child != null && child.Status != ChildStatus.Adopted)
            {
                var oldStatus = child.Status;
                child.Status = ChildStatus.Adopted;
                child.RoomId = null;

                Guid? changedById = null;
                if (Guid.TryParse(user.Id, out var parsedId))
                {
                    changedById = parsedId;
                }

                context.ChildStatusHistories.Add(new ChildStatusHistory
                {
                    ChildId = child.Id,
                    OldStatus = oldStatus,
                    NewStatus = ChildStatus.Adopted,
                    ChangeDate = DateTime.UtcNow,
                    ChangedById = changedById,
                    Reason = $"Đơn nhận nuôi #{entity.Id} đạt trạng thái {request.Status}"
                });
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
