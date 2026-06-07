using backend.Domain.Common;
using backend.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain.Entities;

public class Donation : BaseAuditableEntity
{
    public Guid? DonorId { get; set; }
    
    [ForeignKey("DonorId")]
    public virtual Donor? Donor { get; set; }

    public string DonorName { get; set; } = null!;
    public DonationType? DonationType { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalAllocatedAmount { get; set; }
    public DateTime ReceiveDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Đã tiếp nhận";

    public Guid? InventoryItemId { get; set; }

    [ForeignKey("InventoryItemId")]
    public virtual InventoryItem? InventoryItem { get; set; }

    public int? Quantity { get; set; }
    
    public virtual ICollection<DonationAllocation> DonationAllocations { get; set; } = new List<DonationAllocation>();
}