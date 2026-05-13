using backend.Application.Common.Interfaces;

namespace backend.Application.Rooms.Commands;

public record CreateRoomCommand : IRequest<Guid>
{
    public string RoomName { get; init; } = null!;
    public int? Capacity { get; init; }
    public int CurrentOccupancy { get; init; }
    public string? Location { get; init; }
}

public class CreateRoomCommandValidator : AbstractValidator<CreateRoomCommand>
{
    public CreateRoomCommandValidator()
    {
        RuleFor(v => v.RoomName)
            .MaximumLength(200)
            .NotEmpty();
    }
}

public class CreateRoomCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateRoomCommand, Guid>
{
    public async Task<Guid> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        var entity = new Room
        {
            RoomName = request.RoomName,
            Capacity = request.Capacity,
            CurrentOccupancy = request.CurrentOccupancy,
            Location = request.Location
        };

        context.Rooms.Add(entity);

        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
