using backend.Application.Common.Interfaces;

namespace backend.Application.Rooms.Queries;

public record GetRoomsQuery : IRequest<RoomsVm>;

public class GetRoomsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetRoomsQuery, RoomsVm>
{
    public async Task<RoomsVm> Handle(GetRoomsQuery request, CancellationToken cancellationToken)
    {
        return new RoomsVm
        {
            Lists = await context.Rooms
                .AsNoTracking()
                .OrderByDescending(x => x.Created)
                .ProjectTo<RoomDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken)
        };
    }
}

public class RoomsVm
{
    public IReadOnlyCollection<RoomDto> Lists { get; init; } = Array.Empty<RoomDto>();
}

public class RoomDto
{
    public Guid Id { get; init; }
    public string RoomName { get; init; } = null!;
    public int? Capacity { get; init; }
    public int CurrentOccupancy { get; init; }
    public string? Location { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Room, RoomDto>();
        }
    }
}
