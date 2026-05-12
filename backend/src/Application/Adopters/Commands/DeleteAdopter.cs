using backend.Application.Common.Interfaces;

namespace backend.Application.Adopters.Commands.DeleteAdopter;

public record DeleteAdopterCommand(Guid Id) : IRequest;

public class DeleteAdopterCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteAdopterCommand>
{
    public async Task Handle(DeleteAdopterCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Adopters
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        context.Adopters.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }
}
