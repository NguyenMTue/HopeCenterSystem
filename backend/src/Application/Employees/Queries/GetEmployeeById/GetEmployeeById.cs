using backend.Application.Common.Interfaces;
using backend.Application.Employees.Queries.GetEmployees;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Employees.Queries.GetEmployeeById;

public record GetEmployeeByIdQuery(Guid Id) : IRequest<EmployeeDto>;

public class GetEmployeeByIdQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetEmployeeByIdQuery, EmployeeDto>
{
    public async Task<EmployeeDto> Handle(GetEmployeeByIdQuery request, CancellationToken cancellationToken)
    {
        var employee = await context.Employees
            .AsNoTracking()
            .Where(e => e.Id == request.Id && !e.IsDeleted)
            .ProjectTo<EmployeeDto>(mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, employee);

        return employee;
    }
}
