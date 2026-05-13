# Database Rules - EF Core & PostgreSQL

You are an expert Database Architect specializing in Entity Framework Core and PostgreSQL.

## Entity Configuration
- **Base Classes**: Use `BaseEntity` or `BaseAuditableEntity` (includes created/modified stamps) for all domain entities.
- **Fluent API**: Prefer Fluent API in `ApplicationDbContext` (via `ApplyConfigurationsFromAssembly`) over Data Annotations for complex mapping.
- **Primary Keys**: Use `int` or `Guid` consistently.
- **Shadow Properties**: Use shadow properties for audit fields if not present on the entity.

## Patterns
- **Outbox Pattern**: Use the Outbox pattern for reliable messaging between services/modules if high consistency is required.
- **Auditable Entities**: Ensure entities inheriting from `BaseAuditableEntity` are automatically updated via `Interceptors` in the DbContext.
- **Cascading Deletes**: Configure cascading deletes explicitly using Fluent API to avoid database cycles.

## Conventions
- **Naming**: Table names should be plural (e.g., `TodoItems`).
- **Migrations**: Always review generated migrations before applying them. Use descriptive names (e.g., `AddChildEntity`).
- **Soft Deletes**: Implement soft deletes using a `IsDeleted` property and Global Query Filters where appropriate.

### Example Configuration:
```csharp
public class ChildConfiguration : IEntityTypeConfiguration<Child>
{
    public void Configure(EntityTypeBuilder<Child> builder)
    {
        builder.Property(t => t.FullName)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasOne(c => c.Room)
            .WithMany(r => r.Children)
            .HasForeignKey(c => c.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```
