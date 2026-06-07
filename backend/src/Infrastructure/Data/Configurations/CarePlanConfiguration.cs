using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class CarePlanConfiguration : IEntityTypeConfiguration<CarePlan>
{
    public void Configure(EntityTypeBuilder<CarePlan> builder)
    {
        builder.Property(cp => cp.Status)
            .HasConversion<string>();
            
        builder.Property(cp => cp.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasOne(cp => cp.Approver)
            .WithMany(e => e.ApprovedCarePlans)
            .HasForeignKey(cp => cp.ApproverId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cp => cp.Employee)
            .WithMany(e => e.CarePlans)
            .HasForeignKey(cp => cp.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}