using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class Donation : BaseAuditableEntity
{

    public string DonorName { get; set; } = null!;
    public DonationType? DonationType { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalAllocatedAmount { get; set; }
    public DateTime ReceiveDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Đã tiếp nhận";
    

    public virtual ICollection<DonationAllocation> DonationAllocations { get; set; } = new List<DonationAllocation>();
}