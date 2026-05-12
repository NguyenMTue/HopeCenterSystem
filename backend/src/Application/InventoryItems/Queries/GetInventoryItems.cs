using backend.Application.Common.Interfaces;

namespace backend.Application.InventoryItems.Queries.GetInventoryItems;

public record GetInventoryItemsQuery : IRequest<InventoryItemsVm>;

public class GetInventoryItemsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetInventoryItemsQuery, InventoryItemsVm>
{
    public async Task<InventoryItemsVm> Handle(GetInventoryItemsQuery request, CancellationToken cancellationToken)
    {
        return new InventoryItemsVm
        {
            Lists = await context.InventoryItems
                .AsNoTracking()
                .ProjectTo<InventoryItemDto>(mapper.ConfigurationProvider)
                .OrderBy(t => t.ItemName)
                .ToListAsync(cancellationToken)
        };
    }
}

public class InventoryItemsVm
{
    public IReadOnlyCollection<InventoryItemDto> Lists { get; init; } = Array.Empty<InventoryItemDto>();
}

public class InventoryItemDto
{
    public Guid Id { get; init; }
    public string ItemName { get; init; } = null!;
    public string? Category { get; init; }
    public string? Unit { get; init; }
    public int CurrentQuantity { get; init; }
    public int MinStockLevel { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.InventoryItem, InventoryItemDto>();
        }
    }
}
