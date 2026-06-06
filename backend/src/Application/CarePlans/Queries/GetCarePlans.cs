using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.CarePlans.Queries.GetCarePlans;

public record GetCarePlansQuery : IRequest<CarePlansVm>;

public class GetCarePlansQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetCarePlansQuery, CarePlansVm>
{
    public async Task<CarePlansVm> Handle(GetCarePlansQuery request, CancellationToken cancellationToken)
    {
        return new CarePlansVm
        {
            Lists = await context.CarePlans
                .AsNoTracking()
                .ProjectTo<CarePlanDto>(mapper.ConfigurationProvider)
                .OrderByDescending(t => t.StartDate)
                .ToListAsync(cancellationToken)
        };
    }
}

public class CarePlansVm
{
    public IReadOnlyCollection<CarePlanDto> Lists { get; init; } = Array.Empty<CarePlanDto>();
}

public class CarePlanDto
{
    public Guid Id { get; init; }
    public Guid ChildId { get; init; }
    public string? ChildName { get; init; }
    public string Title { get; init; } = null!;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public Guid? ApproverId { get; init; }
    public Guid? EmployeeId { get; init; }
    public string? EmployeeName { get; init; }
    public ApplicationStatus Status { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.CarePlan, CarePlanDto>()
                .ForMember(d => d.ChildName, opt => opt.MapFrom(s => s.Child.FullName))
                .ForMember(d => d.EmployeeName, opt => opt.MapFrom(s => s.Employee != null ? s.Employee.FullName : null));
        }
    }
}
