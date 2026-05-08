using backend.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain.Entities;

public class SystemLog : BaseAuditableEntity
{

    public Guid AccountId { get; set; }
    public string? Action { get; set; }
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public string? Module { get; set; }    // Chức năng phát sinh log
    public string? IpAddress { get; set; } // Địa chỉ IP người dùng

    [ForeignKey("AccountId")]
    public virtual Account Account { get; set; } = null!;
}