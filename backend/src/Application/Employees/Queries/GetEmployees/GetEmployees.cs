using backend.Application.Common.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Employees.Queries.GetEmployees;

public record GetEmployeesQuery : IRequest<EmployeesVm>;

public class GetEmployeesQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetEmployeesQuery, EmployeesVm>
{
    public async Task<EmployeesVm> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        return new EmployeesVm
        {
            Lists = await context.Employees
                .AsNoTracking()
                .Where(e => !e.IsDeleted)
                .ProjectTo<EmployeeDto>(mapper.ConfigurationProvider)
                .OrderBy(e => e.FullName)
                .ToListAsync(cancellationToken)
        };
    }
}

public class EmployeesVm
{
    public IReadOnlyCollection<EmployeeDto> Lists { get; init; } = Array.Empty<EmployeeDto>();
}

public class EmployeeDto
{
    public Guid Id { get; init; }
    public Guid AccountId { get; init; }
    public string FullName { get; init; } = null!;
    public DateTime? DOB { get; init; }
    public string? Phone { get; init; }
    public string? Position { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.Employee, EmployeeDto>();
        }
    }
}
