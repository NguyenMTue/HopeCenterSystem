using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class DailyCareTaskConfiguration : IEntityTypeConfiguration<DailyCareTask>
{
    public void Configure(EntityTypeBuilder<DailyCareTask> builder)
    {
        builder.Property(t => t.TaskName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Session)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.CareType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Note)
            .HasMaxLength(500);

        builder.HasOne(t => t.Child)
            .WithMany()
            .HasForeignKey(t => t.ChildId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.Employee)
            .WithMany()
            .HasForeignKey(t => t.EmployeeId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
