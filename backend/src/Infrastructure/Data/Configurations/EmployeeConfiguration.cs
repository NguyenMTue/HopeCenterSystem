using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        // Quan hệ 1-1 với Account
        builder.HasIndex(e => e.AccountId)
            .IsUnique();

        builder.Property(e => e.FullName)
            .IsRequired()
            .HasMaxLength(100);
    }
}