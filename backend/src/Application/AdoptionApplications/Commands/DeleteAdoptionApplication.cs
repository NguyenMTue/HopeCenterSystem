using backend.Application.Common.Interfaces;

namespace backend.Application.AdoptionApplications.Commands.DeleteAdoptionApplication;

public record DeleteAdoptionApplicationCommand(Guid Id) : IRequest;

public class DeleteAdoptionApplicationCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteAdoptionApplicationCommand>
{
    public async Task Handle(DeleteAdoptionApplicationCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.AdoptionApplications
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        context.AdoptionApplications.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }
}
