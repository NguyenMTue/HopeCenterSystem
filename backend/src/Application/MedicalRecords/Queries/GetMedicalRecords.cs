using backend.Application.Common.Interfaces;

namespace backend.Application.MedicalRecords.Queries.GetMedicalRecords;

public record GetMedicalRecordsQuery : IRequest<MedicalRecordsVm>;

public class GetMedicalRecordsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetMedicalRecordsQuery, MedicalRecordsVm>
{
    public async Task<MedicalRecordsVm> Handle(GetMedicalRecordsQuery request, CancellationToken cancellationToken)
    {
        return new MedicalRecordsVm
        {
            Lists = await context.MedicalRecords
                .AsNoTracking()
                .ProjectTo<MedicalRecordDto>(mapper.ConfigurationProvider)
                .OrderByDescending(t => t.CheckupDate)
                .ToListAsync(cancellationToken)
        };
    }
}

public class MedicalRecordsVm
{
    public IReadOnlyCollection<MedicalRecordDto> Lists { get; init; } = Array.Empty<MedicalRecordDto>();
}

public class MedicalRecordDto
{
    public Guid Id { get; init; }
    public Guid? ChildId { get; init; }
    public DateTime CheckupDate { get; init; }
    public string Diagnosis { get; init; } = null!;
    public string? Treatment { get; init; }
    public string? DoctorName { get; init; }
    public string? Notes { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.MedicalRecord, MedicalRecordDto>();
        }
    }
}
