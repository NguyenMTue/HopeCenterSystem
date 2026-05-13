using backend.Application.Common.Interfaces;
using backend.Application.Adopters.Queries.GetAdopters;

namespace backend.Application.Adopters.Queries.GetAdopterById;

public record GetAdopterByIdQuery(Guid Id) : IRequest<AdopterDto>;

public class GetAdopterByIdQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAdopterByIdQuery, AdopterDto>
{
    public async Task<AdopterDto> Handle(GetAdopterByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await context.Adopters
            .AsNoTracking()
            .Where(x => x.Id == request.Id)
            .ProjectTo<AdopterDto>(mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        return entity;
    }
}
