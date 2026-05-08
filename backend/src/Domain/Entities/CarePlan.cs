using backend.Domain.Common;
using backend.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain.Entities;

public class CarePlan : BaseAuditableEntity
{
    // Liên kết với Trẻ (Nên để bắt buộc vì kế hoạch phải dành cho một đối tượng cụ thể)
    public Guid ChildId { get; set; }
    
    public string Title { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    // Người duyệt (Liên kết với bảng Employee)
    public Guid? ApproverId { get; set; }
    
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

    [ForeignKey("ChildId")]
    public virtual Child Child { get; set; } = null!;

    [ForeignKey("ApproverId")]
    public virtual Employee? Approver { get; set; }

    public virtual ICollection<CareLog> CareLogs { get; set; } = new List<CareLog>();
}