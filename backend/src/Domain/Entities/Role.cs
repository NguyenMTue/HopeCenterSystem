using backend.Domain.Common;
using Microsoft.AspNetCore.Identity;

namespace backend.Domain.Entities;

public class Role : IdentityRole<Guid>
{

    public string RoleName { get; set; } = null!;
    public string? Description { get; set; }

    public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();
}