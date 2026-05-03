using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class Attachment : BaseAuditableEntity
{
    // public Guid Id { get; set; }
    public Guid TargetId { get; set; }
    public AttachmentTargetType? TargetType { get; set; }
    public string FileName { get; set; } = null!;
    public string FilePath { get; set; } = null!;
    public string? FileType { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public long FileSize { get; set; }
}