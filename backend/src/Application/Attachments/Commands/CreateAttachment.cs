using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.Attachments.Commands;

public record CreateAttachmentCommand : IRequest<Guid>
{
    public Guid TargetId { get; init; }
    public AttachmentTargetType TargetType { get; init; }
    public string FileName { get; init; } = null!;
    public string FilePath { get; init; } = null!;
    public string? FileType { get; init; }
    public long FileSize { get; init; }
}

public class CreateAttachmentCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateAttachmentCommand, Guid>
{
    public async Task<Guid> Handle(CreateAttachmentCommand request, CancellationToken cancellationToken)
    {
        var entity = new Attachment
        {
            TargetId = request.TargetId,
            TargetType = request.TargetType,
            FileName = request.FileName,
            FilePath = request.FilePath,
            FileType = request.FileType,
            FileSize = request.FileSize,
            UploadedAt = DateTime.UtcNow
        };

        context.Attachments.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
