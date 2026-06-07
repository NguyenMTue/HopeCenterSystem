using backend.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain.Entities;

public class DailyCareTask : BaseAuditableEntity
{
    public Guid ChildId { get; set; }
    public Guid? EmployeeId { get; set; }
    public string TaskName { get; set; } = null!;
    public string Session { get; set; } = "Sáng"; // Sáng, Trưa, Chiều, Tối
    public string CareType { get; set; } = "BasicCare"; // BasicCare, MedicalCare
    public bool IsCompleted { get; set; } = false;
    public string? Note { get; set; }
    public DateTime TaskDate { get; set; } = DateTime.UtcNow.Date;

    [ForeignKey("ChildId")]
    public virtual Child Child { get; set; } = null!;

    [ForeignKey("EmployeeId")]
    public virtual Employee? Employee { get; set; }
}
