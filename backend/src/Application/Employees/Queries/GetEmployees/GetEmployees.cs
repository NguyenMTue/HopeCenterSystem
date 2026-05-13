using backend.Application.Common.Interfaces;
using backend.Application.Common.Mappings;
using backend.Application.Common.Models;

namespace backend.Application.Employees.Queries.GetEmployees;

public record GetEmployeesQuery : IRequest<PaginatedList<EmployeeDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? Position { get; init; }
}

public class GetEmployeesQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetEmployeesQuery, PaginatedList<EmployeeDto>>
{
    public async Task<PaginatedList<EmployeeDto>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        var query = context.Employees
            .AsNoTracking()
            .Where(e => !e.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(x => x.FullName.Contains(request.SearchTerm) || (x.Phone != null && x.Phone.Contains(request.SearchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(request.Position))
        {
            query = query.Where(x => x.Position != null && x.Position.Contains(request.Position));
        }

        return await query
            .OrderBy(e => e.FullName)
            .ProjectTo<EmployeeDto>(mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
    }
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
