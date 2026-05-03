using backend.Domain.Common;

namespace backend.Domain.Entities;

public class DonationAllocation : BaseAuditableEntity
{

    public Guid? DonationId { get; set; }
    public string Purpose { get; set; } = null!;
    public decimal AllocatedAmount { get; set; }
    public DateTime AllocationDate { get; set; } = DateTime.UtcNow;
    public Guid? ManagerId { get; set; }
    public string? Notes { get; set; }

    public virtual Donation? Donation { get; set; }
    public virtual Employee? Manager { get; set; }
}