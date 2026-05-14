using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.AdoptionApplications.Commands.UpdateAdoptionApplication;

public record UpdateAdoptionApplicationCommand : IRequest
{
    public Guid Id { get; init; }
    public ApplicationStatus Status { get; init; }
    public Guid? ApproverId { get; init; }
    public string? RejectionReason { get; init; }
    public string? Reason { get; init; }
    public string? Notes { get; init; }
}

public class UpdateAdoptionApplicationCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateAdoptionApplicationCommand>
{
    public async Task Handle(UpdateAdoptionApplicationCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.AdoptionApplications
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.Status = request.Status;
        entity.ApproverId = request.ApproverId;
        entity.RejectionReason = request.RejectionReason;
        entity.Reason = request.Reason;
        entity.Notes = request.Notes;

        if (request.Status == ApplicationStatus.Approved && entity.ChildId.HasValue)
        {
            var child = await context.Children
                .FindAsync(new object[] { entity.ChildId.Value }, cancellationToken);

            if (child != null)
            {
                child.Status = ChildStatus.Adopted;
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
