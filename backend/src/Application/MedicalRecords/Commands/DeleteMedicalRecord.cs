using backend.Application.Common.Interfaces;

namespace backend.Application.MedicalRecords.Commands.DeleteMedicalRecord;

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
