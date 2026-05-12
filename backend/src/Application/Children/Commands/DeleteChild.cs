using backend.Application.Common.Interfaces;

namespace backend.Application.Children.Commands;

public record DeleteChildCommand(Guid Id) : IRequest;

public class DeleteChildCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteChildCommand>
{
    public async Task Handle(DeleteChildCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Children
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        context.Children.Remove(entity);

        await context.SaveChangesAsync(cancellationToken);
    }
}
