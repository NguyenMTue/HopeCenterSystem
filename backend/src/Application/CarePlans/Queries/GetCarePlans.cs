using backend.Application.Common.Interfaces;
using backend.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;

namespace backend.Application.CarePlans.Queries.GetCarePlans;

public record GetCarePlansQuery : IRequest<CarePlansVm>;

public class GetCarePlansQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetCarePlansQuery, CarePlansVm>
{
    public async Task<CarePlansVm> Handle(GetCarePlansQuery request, CancellationToken cancellationToken)
    {
        // Tự động cập nhật các kế hoạch quá hạn sang trạng thái Overdue (Trễ)
        var now = DateTime.UtcNow;
        var overduePlans = await context.CarePlans
            .Where(p => p.Status == ApplicationStatus.Approved && p.EndDate < now)
            .ToListAsync(cancellationToken);

        if (overduePlans.Any())
        {
            foreach (var plan in overduePlans)
            {
                plan.Status = ApplicationStatus.Overdue;
            }
            await context.SaveChangesAsync(cancellationToken);
        }

        return new CarePlansVm
        {
            Lists = await context.CarePlans
                .AsNoTracking()
                .Include(t => t.CarePlanSupplies)
                .ThenInclude(t => t.InventoryItem)
                .OrderByDescending(t => t.Created)
                .ProjectTo<CarePlanDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken)
        };
    }
}

public class CarePlansVm
{
    public IReadOnlyCollection<CarePlanDto> Lists { get; init; } = Array.Empty<CarePlanDto>();
}

public class CarePlanSupplyDto
{
    public Guid InventoryItemId { get; init; }
    public string? ItemName { get; init; }
    public int Quantity { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.CarePlanSupply, CarePlanSupplyDto>()
                .ForMember(d => d.ItemName, opt => opt.MapFrom(s => s.InventoryItem != null ? s.InventoryItem.ItemName : null));
        }
    }
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
    public List<CarePlanSupplyDto> Supplies { get; init; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.CarePlan, CarePlanDto>()
                .ForMember(d => d.ChildName, opt => opt.MapFrom(s => s.Child.FullName))
                .ForMember(d => d.EmployeeName, opt => opt.MapFrom(s => s.Employee != null ? s.Employee.FullName : null))
                .ForMember(d => d.Supplies, opt => opt.MapFrom(s => s.CarePlanSupplies));
        }
    }
}
