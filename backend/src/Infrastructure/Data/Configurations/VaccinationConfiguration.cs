using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class VaccinationConfiguration : IEntityTypeConfiguration<Vaccination>
{
    public void Configure(EntityTypeBuilder<Vaccination> builder)
    {
        builder.Property(t => t.VaccineName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(t => t.Dose)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasOne(t => t.Child)
            .WithMany()
            .HasForeignKey(t => t.ChildId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
