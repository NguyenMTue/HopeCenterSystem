using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class AdopterConfiguration : IEntityTypeConfiguration<Adopter>
{
    public void Configure(EntityTypeBuilder<Adopter> builder)
    {
        // Ràng buộc Unique
        builder.HasIndex(a => a.AccountId)
            .IsUnique();

        builder.HasIndex(a => a.IDCard)
            .IsUnique();

        builder.Property(a => a.FullName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(a => a.IDCard)
            .IsRequired()
            .HasMaxLength(20);
    }
}