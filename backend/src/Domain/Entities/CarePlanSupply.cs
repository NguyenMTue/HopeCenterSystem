using backend.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain.Entities;

public class CarePlanSupply : BaseAuditableEntity
{
    public Guid CarePlanId { get; set; }
    public Guid InventoryItemId { get; set; }
    public int Quantity { get; set; }

    [ForeignKey("CarePlanId")]
    public virtual CarePlan CarePlan { get; set; } = null!;

    [ForeignKey("InventoryItemId")]
    public virtual InventoryItem InventoryItem { get; set; } = null!;
}
