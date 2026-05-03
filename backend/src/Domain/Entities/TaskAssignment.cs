using backend.Domain.Common;

namespace backend.Domain.Entities;

public class TaskAssignment : BaseAuditableEntity
{

    public Guid? AssignerId { get; set; }
    public Guid? AssigneeId { get; set; }
    public string TaskName { get; set; } = null!;
    public DateTime? DueDate { get; set; }
    public string Status { get; set; } = "Mới";

    public virtual Employee? Assigner { get; set; }
    public virtual Employee? Assignee { get; set; }
}