using backend.Application.Common.Interfaces;
using backend.Application.Common.Security;

namespace backend.Application.MedicalRecords.Commands.DeleteMedicalRecord;

[Authorize(Roles = "CareGiver,Director,Manager")]
public record DeleteMedicalRecordCommand(Guid Id) : IRequest;

public class DeleteMedicalRecordCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteMedicalRecordCommand>
{
    public async Task Handle(DeleteMedicalRecordCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.MedicalRecords
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        context.MedicalRecords.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }
}
