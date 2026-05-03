using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class DonationConfiguration : IEntityTypeConfiguration<Donation>
{
    public void Configure(EntityTypeBuilder<Donation> builder)
    {
        builder.Property(d => d.DonationType)
            .HasConversion<string>();

        // Cấu hình kiểu dữ liệu tiền tệ (Decimal) tránh lỗi precision
        builder.Property(d => d.TotalAmount)
            .HasColumnType("decimal(18,2)");
    }
}