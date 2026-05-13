using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.CareLogs.Commands.CreateCareLog;

public record CreateCareLogCommand : IRequest<Guid>
{
    public Guid? PlanId { get; init; }
    public Guid? EmployeeId { get; init; }
    public DateTime LogTime { get; init; }
    public string? ActivityDetails { get; init; }
    public string? Status { get; init; }
}

public class CreateCareLogCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateCareLogCommand, Guid>
{
    public async Task<Guid> Handle(CreateCareLogCommand request, CancellationToken cancellationToken)
    {
        var entity = new CareLog
        {
            PlanId = request.PlanId,
            EmployeeId = request.EmployeeId,
            LogTime = request.LogTime,
            ActivityDetails = request.ActivityDetails,
            Status = request.Status
        };

        context.CareLogs.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
