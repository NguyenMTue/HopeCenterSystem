using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class ChildConfiguration : IEntityTypeConfiguration<Child>
{
    public void Configure(EntityTypeBuilder<Child> builder)
    {
        // Value Conversions cho Enums
        builder.Property(c => c.Gender)
            .HasConversion<string>();

        builder.Property(c => c.Status)
            .HasConversion<string>();

        // (Tùy chọn) Giới hạn độ dài chuỗi để tối ưu Database
        builder.Property(c => c.FullName)
            .IsRequired()
            .HasMaxLength(100);
    }
}