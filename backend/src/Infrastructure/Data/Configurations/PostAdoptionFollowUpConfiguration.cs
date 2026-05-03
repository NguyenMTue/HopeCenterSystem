using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class PostAdoptionFollowUpConfiguration : IEntityTypeConfiguration<PostAdoptionFollowUp>
{
    public void Configure(EntityTypeBuilder<PostAdoptionFollowUp> builder)
    {
        builder.Property(p => p.OverallAssessment)
            .HasConversion<string>();
    }
}