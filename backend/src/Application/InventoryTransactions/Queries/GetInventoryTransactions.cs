using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.InventoryTransactions.Queries.GetInventoryTransactions;

public record GetInventoryTransactionsQuery : IRequest<InventoryTransactionsVm>;

public class GetInventoryTransactionsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetInventoryTransactionsQuery, InventoryTransactionsVm>
{
    public async Task<InventoryTransactionsVm> Handle(GetInventoryTransactionsQuery request, CancellationToken cancellationToken)
    {
        return new InventoryTransactionsVm
        {
            Lists = await context.InventoryTransactions
                .AsNoTracking()
                .ProjectTo<InventoryTransactionDto>(mapper.ConfigurationProvider)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync(cancellationToken)
        };
    }
}

public class InventoryTransactionsVm
{
    public IReadOnlyCollection<InventoryTransactionDto> Lists { get; init; } = Array.Empty<InventoryTransactionDto>();
}

public class InventoryTransactionDto
{
    public Guid Id { get; init; }
    public Guid? ItemId { get; init; }
    public Guid? EmployeeId { get; init; }
    public TransactionType Type { get; init; }
    public int Quantity { get; init; }
    public DateTime TransactionDate { get; init; }
    public string? Reason { get; init; }
    public string? Notes { get; init; }
    public string? ReferenceDocument { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.InventoryTransaction, InventoryTransactionDto>();
        }
    }
}
