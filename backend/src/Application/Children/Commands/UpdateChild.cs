using backend.Application.Common.Interfaces;
using backend.Application.Common.Exceptions;

namespace backend.Application.Children.Commands;

public record UpdateChildCommand : IRequest
{
    public Guid Id { get; init; }
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

public class UpdateChildCommandValidator : AbstractValidator<UpdateChildCommand>
{
    public UpdateChildCommandValidator()
    {
        RuleFor(v => v.FullName)
            .MaximumLength(200)
            .NotEmpty();
    }
}

public class UpdateChildCommandHandler(IApplicationDbContext context, IUser user) : IRequestHandler<UpdateChildCommand>
{
    public async Task Handle(UpdateChildCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Children
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        // Chỉ cho phép Director phê duyệt từ Chờ phê duyệt (PendingApproval) sang Đang bảo trợ (Active)
        if (entity.Status == ChildStatus.PendingApproval && request.Status == ChildStatus.Active)
        {
            var isDirector = user.Roles?.Contains("Director") ?? false;
            if (!isDirector)
            {
                throw new ForbiddenAccessException();
            }
        }

        entity.FullName = request.FullName;
        entity.DOB = request.DOB;
        entity.Gender = request.Gender;
        entity.HealthStatus = request.HealthStatus;
        entity.Background = request.Background;
        entity.RoomId = request.RoomId;
        entity.Status = request.Status;
        entity.AdmissionDate = request.AdmissionDate;
        entity.Weight = request.Weight;
        entity.Height = request.Height;

        if (!string.IsNullOrEmpty(request.AvatarUrl))
        {
            var existingAvatar = await context.Attachments
                .FirstOrDefaultAsync(a => a.TargetId == entity.Id && a.TargetType == AttachmentTargetType.Child && a.FileType != null && a.FileType.StartsWith("image/"), cancellationToken);

            if (existingAvatar != null)
            {
                existingAvatar.FilePath = request.AvatarUrl;
            }
            else
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
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}

