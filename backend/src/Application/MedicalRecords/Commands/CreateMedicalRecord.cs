using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.MedicalRecords.Commands.CreateMedicalRecord;

public record CreateMedicalRecordCommand : IRequest<Guid>
{
    public Guid? ChildId { get; init; }
    public DateTime CheckupDate { get; init; }
    public string Diagnosis { get; init; } = null!;
    public string? Treatment { get; init; }
    public string? DoctorName { get; init; }
    public string? Notes { get; init; }
}

public class CreateMedicalRecordCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateMedicalRecordCommand, Guid>
{
    public async Task<Guid> Handle(CreateMedicalRecordCommand request, CancellationToken cancellationToken)
    {
        var entity = new MedicalRecord
        {
            ChildId = request.ChildId,
            CheckupDate = request.CheckupDate,
            Diagnosis = request.Diagnosis,
            Treatment = request.Treatment,
            DoctorName = request.DoctorName,
            Notes = request.Notes
        };

        context.MedicalRecords.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
