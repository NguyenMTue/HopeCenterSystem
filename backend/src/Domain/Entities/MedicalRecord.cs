using backend.Domain.Common;

namespace backend.Domain.Entities;

public class MedicalRecord : BaseAuditableEntity
{

    public Guid? ChildId { get; set; }
    public DateTime CheckupDate { get; set; } = DateTime.UtcNow;
    public string Diagnosis { get; set; } = null!;
    public string? Treatment { get; set; }
    public string? DoctorName { get; set; }
    public string? Notes { get; set; }

    public virtual Child? Child { get; set; }
}