using backend.Application.Common.Interfaces;

namespace backend.Application.Adopters.Queries.GetAdopters;

public record GetAdoptersQuery : IRequest<AdoptersVm>;

public class GetAdoptersQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAdoptersQuery, AdoptersVm>
{
    public async Task<AdoptersVm> Handle(GetAdoptersQuery request, CancellationToken cancellationToken)
    {
        return new AdoptersVm
        {
            Lists = await context.Adopters
                .AsNoTracking()
                .ProjectTo<AdopterDto>(mapper.ConfigurationProvider)
                .OrderBy(t => t.FullName)
                .ToListAsync(cancellationToken)
        };
    }
}

public class AdoptersVm
{
    public IReadOnlyCollection<AdopterDto> Lists { get; init; } = Array.Empty<AdopterDto>();
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
