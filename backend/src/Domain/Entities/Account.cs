using Microsoft.AspNetCore.Identity;

namespace backend.Domain.Entities;

public class Account : IdentityUser<Guid>
{
    // Giữ lại các trường custom mà IdentityUser không có
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // QUAN TRỌNG: Đã bỏ RoleId và virtual Role.
    // Việc phân quyền giờ được quản lý qua bảng trung gian AspNetUserRoles.

    // Giữ các liên kết 1-1 tới thông tin chi tiết
    public virtual Employee? Employee { get; set; }
    public virtual Adopter? Adopter { get; set; }
    public virtual Donor? Donor { get; set; }

    // Giữ các liên kết nghiệp vụ khác
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<SystemLog> SystemLogs { get; set; } = new List<SystemLog>();
    public virtual ICollection<ChildStatusHistory> StatusChanges { get; set; } = new List<ChildStatusHistory>();
}