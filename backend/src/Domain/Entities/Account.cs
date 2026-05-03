using backend.Domain.Common;
using Microsoft.AspNetCore.Identity;

namespace backend.Domain.Entities;

public class Account : IdentityUser<Guid>
{
    // public Guid Id { get; set; }
    // public string Username { get; set; } = null!;
    public Guid? RoleId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual Role? Role { get; set; }
    public virtual Employee? Employee { get; set; }
    public virtual Adopter? Adopter { get; set; }
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<SystemLog> SystemLogs { get; set; } = new List<SystemLog>();
    // Bổ sung vào phần danh sách liên kết
    public virtual ICollection<ChildStatusHistory> StatusChanges { get; set; } = new List<ChildStatusHistory>();
}