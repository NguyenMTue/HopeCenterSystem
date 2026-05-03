using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class CarePlan : BaseAuditableEntity
{
    // public Guid Id { get; set; }
    public Guid? ChildId { get; set; }
    public string Title { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public Guid? ApproverId { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

    public virtual Child? Child { get; set; }
    public virtual Employee? Approver { get; set; }
    public virtual ICollection<CareLog> CareLogs { get; set; } = new List<CareLog>();
}