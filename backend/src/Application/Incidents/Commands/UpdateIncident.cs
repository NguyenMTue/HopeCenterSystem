using backend.Application.Common.Interfaces;
using backend.Domain.Enums;
using MediatR;

namespace backend.Application.Incidents.Commands.UpdateIncident;

public record UpdateIncidentCommand : IRequest
{
    public Guid Id { get; init; }
    public string? Status { get; init; }
    public string? ResolutionNotes { get; init; }
}

public class UpdateIncidentCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateIncidentCommand>
{
    public async Task Handle(UpdateIncidentCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Incidents
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.Status = request.Status;
        entity.ResolutionNotes = request.ResolutionNotes;

        await context.SaveChangesAsync(cancellationToken);
    }
}
