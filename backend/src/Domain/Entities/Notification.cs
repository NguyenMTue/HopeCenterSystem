using backend.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain.Entities;

public class Notification : BaseAuditableEntity
{

    public Guid AccountId { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;

    [ForeignKey("AccountId")]
    public virtual Account Account { get; set; } = null!;
}