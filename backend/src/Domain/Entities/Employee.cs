using backend.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain.Entities;

public class Employee : BaseAuditableEntity
{

    public Guid AccountId { get; set; }
    public string FullName { get; set; } = null!;
    public DateTime? DOB { get; set; }
    public string? Phone { get; set; }
    public string? Position { get; set; }
    public bool IsDeleted { get; set; } = false;

    [ForeignKey("AccountId")]
    public virtual Account Account { get; set; } = null!;
    public virtual ICollection<CarePlan> ApprovedCarePlans { get; set; } = new List<CarePlan>();
    public virtual ICollection<CarePlan> CarePlans { get; set; } = new List<CarePlan>();
    public virtual ICollection<CareLog> CareLogs { get; set; } = new List<CareLog>();
    public virtual ICollection<Incident> ReportedIncidents { get; set; } = new List<Incident>();
    public virtual ICollection<TaskAssignment> AssignedTasks { get; set; } = new List<TaskAssignment>();
    public virtual ICollection<TaskAssignment> ReceivedTasks { get; set; } = new List<TaskAssignment>();
    public virtual ICollection<AdoptionApplication> ApprovedApplications { get; set; } = new List<AdoptionApplication>();
    public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
    public virtual ICollection<DonationAllocation> ManagedAllocations { get; set; } = new List<DonationAllocation>();
    // Bổ sung vào phần danh sách liên kết
    public virtual ICollection<PostAdoptionFollowUp> ConductedFollowUps { get; set; } = new List<PostAdoptionFollowUp>();
}