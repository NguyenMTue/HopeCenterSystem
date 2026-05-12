using backend.Application.Common.Interfaces;

namespace backend.Application.Rooms.Queries;

public record GetRoomByIdQuery(Guid Id) : IRequest<RoomDto>;

public class GetRoomByIdQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetRoomByIdQuery, RoomDto>
{
    public async Task<RoomDto> Handle(GetRoomByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await context.Rooms
            .AsNoTracking()
            .ProjectTo<RoomDto>(mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        return entity!;
    }
}
