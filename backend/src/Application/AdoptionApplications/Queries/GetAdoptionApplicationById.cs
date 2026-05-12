using backend.Application.Common.Interfaces;
using backend.Application.AdoptionApplications.Queries.GetAdoptionApplications;

namespace backend.Application.AdoptionApplications.Queries.GetAdoptionApplicationById;

public record GetAdoptionApplicationByIdQuery(Guid Id) : IRequest<AdoptionApplicationDto>;

public class GetAdoptionApplicationByIdQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAdoptionApplicationByIdQuery, AdoptionApplicationDto>
{
    public async Task<AdoptionApplicationDto> Handle(GetAdoptionApplicationByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await context.AdoptionApplications
            .AsNoTracking()
            .Where(x => x.Id == request.Id)
            .ProjectTo<AdoptionApplicationDto>(mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        return entity;
    }
}
