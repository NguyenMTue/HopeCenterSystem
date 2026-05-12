using backend.Application.Common.Interfaces;

namespace backend.Application.Rooms.Commands;

public record UpdateRoomCommand : IRequest
{
    public Guid Id { get; init; }
    public string RoomName { get; init; } = null!;
    public int? Capacity { get; init; }
    public int CurrentOccupancy { get; init; }
    public string? Location { get; init; }
}

public class UpdateRoomCommandValidator : AbstractValidator<UpdateRoomCommand>
{
    public UpdateRoomCommandValidator()
    {
        RuleFor(v => v.RoomName)
            .MaximumLength(200)
            .NotEmpty();
    }
}

public class UpdateRoomCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateRoomCommand>
{
    public async Task Handle(UpdateRoomCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Rooms
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.RoomName = request.RoomName;
        entity.Capacity = request.Capacity;
        entity.CurrentOccupancy = request.CurrentOccupancy;
        entity.Location = request.Location;

        await context.SaveChangesAsync(cancellationToken);
    }
}
