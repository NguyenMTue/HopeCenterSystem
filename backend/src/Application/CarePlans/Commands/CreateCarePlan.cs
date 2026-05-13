using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Application.CarePlans.Commands.CreateCarePlan;

public record CreateCarePlanCommand : IRequest<Guid>
{
    public Guid ChildId { get; init; }
    public string Title { get; init; } = null!;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
}

public class CreateCarePlanCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateCarePlanCommand, Guid>
{
    public async Task<Guid> Handle(CreateCarePlanCommand request, CancellationToken cancellationToken)
    {
        var entity = new CarePlan
        {
            ChildId = request.ChildId,
            Title = request.Title,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = ApplicationStatus.Pending
        };

        context.CarePlans.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
