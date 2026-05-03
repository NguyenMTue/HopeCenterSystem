using backend.Domain.Common;

namespace backend.Domain.Entities;

public class CareLog : BaseAuditableEntity
{
    // public Guid Id { get; set; }
    public Guid? PlanId { get; set; }
    public Guid? EmployeeId { get; set; }
    public DateTime LogTime { get; set; }
    public string? ActivityDetails { get; set; }
    public string? Status { get; set; }

    public virtual CarePlan? CarePlan { get; set; }
    public virtual Employee? Employee { get; set; }
}