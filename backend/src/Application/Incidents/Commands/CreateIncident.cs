using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Application.Incidents.Commands.CreateIncident;

public record CreateIncidentCommand : IRequest<Guid>
{
    public Guid? ChildId { get; init; }
    public Guid? ReporterId { get; init; }
    public DateTime IncidentDate { get; init; }
    public string Description { get; init; } = null!;
    public IncidentSeverity? Severity { get; init; }
}

public class CreateIncidentCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateIncidentCommand, Guid>
{
    public async Task<Guid> Handle(CreateIncidentCommand request, CancellationToken cancellationToken)
    {
        var entity = new Incident
        {
            ChildId = request.ChildId,
            ReporterId = request.ReporterId,
            IncidentDate = request.IncidentDate,
            Description = request.Description,
            Severity = request.Severity
        };

        context.Incidents.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
