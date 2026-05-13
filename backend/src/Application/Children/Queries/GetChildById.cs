using backend.Application.Common.Interfaces;

namespace backend.Application.Children.Queries;

public record GetChildByIdQuery(Guid Id) : IRequest<ChildDto>;

public class GetChildByIdQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetChildByIdQuery, ChildDto>
{
    public async Task<ChildDto> Handle(GetChildByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await context.Children
            .AsNoTracking()
            .ProjectTo<ChildDto>(mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        return entity!;
    }
}
