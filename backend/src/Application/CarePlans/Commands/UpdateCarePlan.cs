using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.CarePlans.Commands.UpdateCarePlan;

public record UpdateCarePlanCommand : IRequest
{
    public Guid Id { get; init; }
    public string Title { get; init; } = null!;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public Guid? ApproverId { get; init; }
    public ApplicationStatus Status { get; init; }
}

public class UpdateCarePlanCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateCarePlanCommand>
{
    public async Task Handle(UpdateCarePlanCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.CarePlans
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.Title = request.Title;
        entity.StartDate = request.StartDate;
        entity.EndDate = request.EndDate;
        entity.ApproverId = request.ApproverId;
        entity.Status = request.Status;

        await context.SaveChangesAsync(cancellationToken);
    }
}
