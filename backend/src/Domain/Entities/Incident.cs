using backend.Domain.Common;
    using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class Incident : BaseAuditableEntity
{

    public Guid? ChildId { get; set; }
    public Guid? ReporterId { get; set; }
    public DateTime IncidentDate { get; set; } = DateTime.UtcNow;
    public string Description { get; set; } = null!;
    public IncidentSeverity? Severity { get; set; }
    public string? Status { get; set; } = "Đang chờ";
    public string? ResolutionNotes { get; set; }

    public virtual Child? Child { get; set; }
    public virtual Employee? Reporter { get; set; }
}