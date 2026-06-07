using backend.Application.Common.Interfaces;
using backend.Application.Common.Security;

namespace backend.Application.MedicalRecords.Commands.UpdateMedicalRecord;

[Authorize(Roles = "CareGiver,Director,Manager")]
public record UpdateMedicalRecordCommand : IRequest
{
    public Guid Id { get; init; }
    public DateTime CheckupDate { get; init; }
    public string Diagnosis { get; init; } = null!;
    public string? Treatment { get; init; }
    public string? DoctorName { get; init; }
    public string? Notes { get; init; }
}

public class UpdateMedicalRecordCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateMedicalRecordCommand>
{
    public async Task Handle(UpdateMedicalRecordCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.MedicalRecords
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.CheckupDate = request.CheckupDate;
        entity.Diagnosis = request.Diagnosis;
        entity.Treatment = request.Treatment;
        entity.DoctorName = request.DoctorName;
        entity.Notes = request.Notes;

        await context.SaveChangesAsync(cancellationToken);
    }
}
