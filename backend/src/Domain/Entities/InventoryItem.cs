using backend.Domain.Common;

namespace backend.Domain.Entities;

public class InventoryItem : BaseAuditableEntity
{

    public string ItemName { get; set; } = null!;
    public string? Category { get; set; }
    public string? Unit { get; set; }
    public int CurrentQuantity { get; set; } = 0;
    public int MinStockLevel { get; set; } = 10;

    public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
}