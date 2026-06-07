using backend.Application.Common.Interfaces;

namespace backend.Application.Children.Commands;

public record CreateChildCommand : IRequest<Guid>
{
    public string FullName { get; init; } = null!;
    public DateTime? DOB { get; init; }
    public Gender? Gender { get; init; }
    public string? HealthStatus { get; init; }
    public string? Background { get; init; }
    public Guid? RoomId { get; init; }
    public ChildStatus Status { get; init; }
    public DateTime AdmissionDate { get; init; }
    public double? Weight { get; init; }
    public double? Height { get; init; }
    public string? AvatarUrl { get; init; }
}

public class CreateChildCommandValidator : AbstractValidator<CreateChildCommand>
{
    public CreateChildCommandValidator()
    {
        RuleFor(v => v.FullName)
            .MaximumLength(200)
            .NotEmpty();
    }
}

public class CreateChildCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateChildCommand, Guid>
{
    public async Task<Guid> Handle(CreateChildCommand request, CancellationToken cancellationToken)
    {
        var entity = new Child
        {
            FullName = request.FullName,
            DOB = request.DOB,
            Gender = request.Gender,
            HealthStatus = request.HealthStatus,
            Background = request.Background,
            RoomId = request.RoomId,
            Status = ChildStatus.PendingApproval, // Mặc định là Chờ phê duyệt (PendingApproval)
            AdmissionDate = request.AdmissionDate,
            Weight = request.Weight,
            Height = request.Height
        };

        context.Children.Add(entity);

        await context.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrEmpty(request.AvatarUrl))
        {
            var attachment = new Attachment
            {
                TargetId = entity.Id,
                TargetType = AttachmentTargetType.Child,
                FileName = $"Avatar_{entity.FullName.Replace(" ", "_")}.jpg",
                FilePath = request.AvatarUrl,
                FileType = "image/jpeg",
                FileSize = 1024,
                UploadedAt = DateTime.UtcNow
            };
            context.Attachments.Add(attachment);
            await context.SaveChangesAsync(cancellationToken);
        }

        return entity.Id;
    }
}

