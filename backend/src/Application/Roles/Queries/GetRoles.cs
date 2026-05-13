using backend.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace backend.Application.Roles.Queries;

public record RoleDto
{
    public Guid Id { get; init; }
    public string? Name { get; init; }
}

public record GetRolesQuery : IRequest<List<RoleDto>>;

public class GetRolesQueryHandler(RoleManager<Role> roleManager) : IRequestHandler<GetRolesQuery, List<RoleDto>>
{
    public async Task<List<RoleDto>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        return await roleManager.Roles
            .Select(r => new RoleDto { Id = r.Id, Name = r.Name })
            .ToListAsync(cancellationToken);
    }
}
