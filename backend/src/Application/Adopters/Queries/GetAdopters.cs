using backend.Application.Common.Interfaces;
using backend.Application.Common.Mappings;
using backend.Application.Common.Models;

namespace backend.Application.Adopters.Queries.GetAdopters;

public record GetAdoptersQuery : IRequest<PaginatedList<AdopterDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
}

public class GetAdoptersQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAdoptersQuery, PaginatedList<AdopterDto>>
{
    public async Task<PaginatedList<AdopterDto>> Handle(GetAdoptersQuery request, CancellationToken cancellationToken)
    {
        var query = context.Adopters.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(x => x.FullName.Contains(request.SearchTerm) || x.IDCard.Contains(request.SearchTerm));
        }

        return await query
            .OrderBy(t => t.FullName)
            .ProjectTo<AdopterDto>(mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
}

public class AdopterDto
{
    public Guid Id { get; init; }
    public Guid AccountId { get; init; }
    public string FullName { get; init; } = null!;
    public string IDCard { get; init; } = null!;
    public string? FinancialStatus { get; init; }
    public string? MaritalStatus { get; init; }
    public string? Address { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.Adopter, AdopterDto>();
        }
    }
}
