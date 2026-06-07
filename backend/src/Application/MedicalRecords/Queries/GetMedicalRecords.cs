using backend.Application.Common.Interfaces;
using backend.Application.Common.Security;

namespace backend.Application.MedicalRecords.Queries.GetMedicalRecords;

[Authorize(Roles = "CareGiver,Director,Manager")]
public record GetMedicalRecordsQuery : IRequest<MedicalRecordsVm>;

public class GetMedicalRecordsQueryHandler(IApplicationDbContext context, IMapper mapper, IUser user) : IRequestHandler<GetMedicalRecordsQuery, MedicalRecordsVm>
{
    public async Task<MedicalRecordsVm> Handle(GetMedicalRecordsQuery request, CancellationToken cancellationToken)
    {
        var query = context.MedicalRecords.AsNoTracking();

        var isCaregiver = user.Roles?.Contains("CareGiver") ?? false;
        if (isCaregiver && Guid.TryParse(user.Id, out var accountId))
        {
            var employee = await context.Employees
                .FirstOrDefaultAsync(e => e.AccountId == accountId, cancellationToken);

            if (employee != null)
            {
                var pos = employee.Position ?? "";
                string targetLocation = "";
                if (pos.Contains("Mầm non", StringComparison.OrdinalIgnoreCase))
                    targetLocation = "Khu Mầm Non";
                else if (pos.Contains("Nhi đồng", StringComparison.OrdinalIgnoreCase))
                    targetLocation = "Khu Nhi Đồng";
                else if (pos.Contains("Thiếu niên", StringComparison.OrdinalIgnoreCase))
                    targetLocation = "Khu Thiếu Niên";

                if (!string.IsNullOrEmpty(targetLocation))
                {
                    query = query.Where(mr => mr.Child != null && mr.Child.Room != null && mr.Child.Room.Location == targetLocation);
                }
            }
        }

        return new MedicalRecordsVm
        {
            Lists = await query
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
