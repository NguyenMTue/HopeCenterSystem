using backend.Application.Common.Interfaces;

namespace backend.Application.Rooms.Commands;

public record DeleteRoomCommand(Guid Id) : IRequest;

public class DeleteRoomCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteRoomCommand>
{
    public async Task Handle(DeleteRoomCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Rooms
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        context.Rooms.Remove(entity);

        await context.SaveChangesAsync(cancellationToken);
    }
}
