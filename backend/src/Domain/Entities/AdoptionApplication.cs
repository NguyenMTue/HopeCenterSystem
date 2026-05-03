using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class AdoptionApplication : BaseAuditableEntity
{
    // public Guid Id { get; set; }
    public Guid? AdopterId { get; set; }
    public Guid? ChildId { get; set; }
    public DateTime SubmitDate { get; set; } = DateTime.UtcNow;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public Guid? ApproverId { get; set; }
    public string? RejectionReason { get; set; }

    public virtual Adopter? Adopter { get; set; }
    public virtual Child? Child { get; set; }
    public virtual Employee? Approver { get; set; }
    public string? Reason { get; set; } // Lý do xin nhận nuôi
    public string? Notes { get; set; }  // Ghi chú từ nhân viên hoặc người nhận nuôi
    // Bổ sung vào phần danh sách liên kết
    public virtual ICollection<PostAdoptionFollowUp> FollowUps { get; set; } = new List<PostAdoptionFollowUp>();
}