using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Application.AdoptionApplications.Commands.CreateAdoptionApplication;

public record CreateAdoptionApplicationCommand : IRequest<Guid>
{
    public Guid? AdopterId { get; init; }
    public Guid? ChildId { get; init; }
    public string? Reason { get; init; }
    public string? Notes { get; init; }
}

public class CreateAdoptionApplicationCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateAdoptionApplicationCommand, Guid>
{
    public async Task<Guid> Handle(CreateAdoptionApplicationCommand request, CancellationToken cancellationToken)
    {
        var entity = new AdoptionApplication
        {
            AdopterId = request.AdopterId,
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
