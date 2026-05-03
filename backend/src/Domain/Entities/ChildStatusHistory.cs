using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class ChildStatusHistory : BaseAuditableEntity
{

    
    // Liên kết với Trẻ
    public Guid? ChildId { get; set; }
    
    // Liên kết với Account (Người thực hiện thay đổi)
    public Guid? ChangedById { get; set; }
    
    public ChildStatus? OldStatus { get; set; }
    public ChildStatus NewStatus { get; set; }
    public DateTime ChangeDate { get; set; } = DateTime.UtcNow;
    public string? Reason { get; set; }

    public virtual Child? Child { get; set; }
    public virtual Account? ChangedBy { get; set; }
}