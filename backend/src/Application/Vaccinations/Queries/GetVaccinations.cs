using backend.Application.Common.Interfaces;

namespace backend.Application.Vaccinations.Queries;

public record GetVaccinationsQuery : IRequest<VaccinationsVm>;

public class GetVaccinationsQueryHandler(IApplicationDbContext context, IMapper mapper) 
    : IRequestHandler<GetVaccinationsQuery, VaccinationsVm>
{
    public async Task<VaccinationsVm> Handle(GetVaccinationsQuery request, CancellationToken cancellationToken)
    {
        var list = await context.Vaccinations
            .AsNoTracking()
            .ProjectTo<VaccinationDto>(mapper.ConfigurationProvider)
            .OrderByDescending(t => t.VaccinationDate)
            .ToListAsync(cancellationToken);

        return new VaccinationsVm { Lists = list };
    }
}

public class VaccinationsVm
{
    public IReadOnlyCollection<VaccinationDto> Lists { get; init; } = Array.Empty<VaccinationDto>();
}

public class VaccinationDto
{
    public Guid Id { get; init; }
    public Guid ChildId { get; init; }
    public string? ChildName { get; init; }
    public string VaccineName { get; init; } = null!;
    public string Dose { get; init; } = "Mũi 1";
    public DateTime VaccinationDate { get; init; }
    public string Status { get; init; } = "Chờ tiêm";

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.Vaccination, VaccinationDto>()
                .ForMember(d => d.ChildName, opt => opt.MapFrom(s => s.Child.FullName));
        }
    }
}
