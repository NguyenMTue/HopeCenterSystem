using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Notification> Notifications { get; }
    DbSet<SystemLog> SystemLogs { get; }
    DbSet<Room> Rooms { get; }
    DbSet<Employee> Employees { get; }
    DbSet<Adopter> Adopters { get; }
    DbSet<Child> Children { get; }
    DbSet<MedicalRecord> MedicalRecords { get; }
    DbSet<CarePlan> CarePlans { get; }
    DbSet<CareLog> CareLogs { get; }
    DbSet<Incident> Incidents { get; }
    DbSet<TaskAssignment> TaskAssignments { get; }
    DbSet<AdoptionApplication> AdoptionApplications { get; }
    DbSet<Attachment> Attachments { get; }
    DbSet<InventoryItem> InventoryItems { get; }
    DbSet<InventoryTransaction> InventoryTransactions { get; }
    DbSet<Donation> Donations { get; }
    DbSet<DonationAllocation> DonationAllocations { get; }
    DbSet<PostAdoptionFollowUp> PostAdoptionFollowUps { get; }
    DbSet<ChildStatusHistory> ChildStatusHistories { get; }
    DbSet<DailyCareTask> DailyCareTasks { get; }
    DbSet<Vaccination> Vaccinations { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
