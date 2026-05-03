using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class ChildStatusHistoryConfiguration : IEntityTypeConfiguration<ChildStatusHistory>
{
    public void Configure(EntityTypeBuilder<ChildStatusHistory> builder)
    {
        builder.Property(c => c.OldStatus)
            .HasConversion<string>();

        builder.Property(c => c.NewStatus)
            .HasConversion<string>();
    }
}