using backend.Domain.Common;

namespace backend.Domain.Entities;

public class Notification : BaseAuditableEntity
{

    public Guid? AccountId { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;

    public virtual Account? Account { get; set; }
}