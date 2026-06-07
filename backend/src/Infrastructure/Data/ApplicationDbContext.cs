using System.Reflection;
using backend.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using backend.Application.Common.Interfaces;

namespace backend.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<Account, Role, Guid>, IApplicationDbContext
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
    public DbSet<CarePlanSupply> CarePlanSupplies => Set<CarePlanSupply>();
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
    public DbSet<DailyCareTask> DailyCareTasks => Set<DailyCareTask>();
    public DbSet<Vaccination> Vaccinations => Set<Vaccination>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); // Bắt buộc giữ dòng này ở đầu

        // 1. Đổi tên các bảng Identity để khớp với thiết kế sạch
        builder.Entity<Account>().ToTable("Accounts");
        builder.Entity<Role>().ToTable("Roles");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("AccountRoles");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("AccountClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("AccountLogins");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("AccountTokens");

        // 2. Cấu hình quan hệ 1-1 giữa Account và Employee/Adopter
        // Một Account có thể là một Employee hoặc không, nhưng một Employee bắt buộc có một Account
        builder.Entity<Employee>()
            .HasOne(e => e.Account)
            .WithOne(a => a.Employee)
            .HasForeignKey<Employee>(e => e.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Adopter>()
            .HasOne(ad => ad.Account)
            .WithOne(a => a.Adopter)
            .HasForeignKey<Adopter>(ad => ad.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        // 3. Cấu hình TaskAssignment (Bạn đã làm đúng, giữ lại)
        builder.Entity<TaskAssignment>(entity =>
        {
            entity.HasOne(ta => ta.Assigner)
                .WithMany(e => e.AssignedTasks)
                .HasForeignKey(ta => ta.AssignerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ta => ta.Assignee)
                .WithMany(e => e.ReceivedTasks)
                .HasForeignKey(ta => ta.AssigneeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // 4. Áp dụng các cấu hình khác từ Assembly
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}