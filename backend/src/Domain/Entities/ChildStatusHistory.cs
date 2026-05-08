using backend.Domain.Common;
using backend.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain.Entities;

public class ChildStatusHistory : BaseAuditableEntity
{
    // Liên kết với Trẻ
    public Guid ChildId { get; set; }
    
    // Liên kết với Account (Người thực hiện thay đổi) - Ánh xạ vào bảng AspNetUsers
    public Guid? ChangedById { get; set; }
    
    public ChildStatus? OldStatus { get; set; }
    public ChildStatus NewStatus { get; set; }
    public DateTime ChangeDate { get; set; } = DateTime.UtcNow;
    public string? Reason { get; set; }

    [ForeignKey("ChildId")]
    public virtual Child Child { get; set; } = null!;

    [ForeignKey("ChangedById")]
    public virtual Account? ChangedBy { get; set; }
}