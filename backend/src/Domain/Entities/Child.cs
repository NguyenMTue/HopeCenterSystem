using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class Child : BaseAuditableEntity
{

    public string FullName { get; set; } = null!;
    public DateTime? DOB { get; set; }
    public Gender? Gender { get; set; }
    public string? HealthStatus { get; set; }
    public string? Background { get; set; }
    public Guid? RoomId { get; set; }
    public ChildStatus Status { get; set; } = ChildStatus.Active;
    public DateTime AdmissionDate { get; set; } = DateTime.UtcNow;
    public double? Weight { get; set; } // Cân nặng (kg)
    public double? Height { get; set; } // Chiều cao (cm)

    public virtual Room? Room { get; set; }
    public virtual ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    public virtual ICollection<CarePlan> CarePlans { get; set; } = new List<CarePlan>();
    public virtual ICollection<Incident> Incidents { get; set; } = new List<Incident>();
    public virtual ICollection<AdoptionApplication> AdoptionApplications { get; set; } = new List<AdoptionApplication>();
    // Bổ sung vào phần danh sách liên kết (Navigation Properties)
    public virtual ICollection<ChildStatusHistory> StatusHistories { get; set; } = new List<ChildStatusHistory>();
}