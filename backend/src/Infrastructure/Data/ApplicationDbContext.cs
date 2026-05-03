using System.Reflection;
using backend.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using backend.Application.Common.Interfaces;

namespace backend.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<Account, Role, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // Khai báo DbSet
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SystemLog> SystemLogs => Set<SystemLog>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Adopter> Adopters => Set<Adopter>();
    public DbSet<Child> Children => Set<Child>();
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
    public DbSet<CarePlan> CarePlans => Set<CarePlan>();
    public DbSet<CareLog> CareLogs => Set<CareLog>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<TaskAssignment> TaskAssignments => Set<TaskAssignment>();
    public DbSet<AdoptionApplication> AdoptionApplications => Set<AdoptionApplication>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<DonationAllocation> DonationAllocations => Set<DonationAllocation>();
    public DbSet<PostAdoptionFollowUp> PostAdoptionFollowUps => Set<PostAdoptionFollowUp>();
    public DbSet<ChildStatusHistory> ChildStatusHistories => Set<ChildStatusHistory>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); // Bắt buộc phải có để Identity hoạt động

        // Cấu hình cụ thể cho TaskAssignment để giải quyết xung đột quan hệ kép
        builder.Entity<TaskAssignment>(entity =>
        {
            // Mối quan hệ với người giao việc (Assigner)
            entity.HasOne(ta => ta.Assigner)
                .WithMany(e => e.AssignedTasks)
                .HasForeignKey(ta => ta.AssignerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Mối quan hệ với người nhận việc (Assignee)
            entity.HasOne(ta => ta.Assignee)
                .WithMany(e => e.ReceivedTasks)
                .HasForeignKey(ta => ta.AssigneeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Tự động áp dụng các cấu hình từ các class thực thi IEntityTypeConfiguration
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Đổi tên bảng Identity
        builder.Entity<Account>().ToTable("Accounts");
        builder.Entity<Role>().ToTable("Roles");
    }
}