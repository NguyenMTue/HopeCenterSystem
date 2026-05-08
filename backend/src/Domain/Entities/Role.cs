using Microsoft.AspNetCore.Identity;

namespace backend.Domain.Entities;

public class Role : IdentityRole<Guid>
{
    public Role() : base() { }

    public Role(string roleName) : base(roleName) { }

    // Giữ lại Description để phục vụ việc mở rộng phân quyền sau này
    public string? Description { get; set; }

    // Lưu ý: Không cần ICollection<Account> ở đây 
    // vì Identity quản lý quan hệ n-n tự động.
}