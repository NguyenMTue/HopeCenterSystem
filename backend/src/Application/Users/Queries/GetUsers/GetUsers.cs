using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace backend.Application.Users.Queries.GetUsers;

public record GetUsersQuery : IRequest<List<UserDto>>;

public class GetUsersQueryHandler(
    UserManager<Account> userManager) : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await userManager.Users
            .Include(u => u.Employee)
            .Include(u => u.Adopter)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            
            userDtos.Add(new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                IsActive = user.IsActive,
                Roles = roles.ToList(),
                FullName = user.Employee?.FullName ?? user.Adopter?.FullName,
                Position = user.Employee?.Position,
                Phone = user.Employee?.Phone,
                Address = user.Adopter?.Address,
                UserType = user.Employee != null ? "Employee" : (user.Adopter != null ? "Adopter" : "AccountOnly")
            });
        }

        return userDtos.OrderBy(u => u.FullName).ToList();
    }
}

public class UserDto
{
    public Guid Id { get; init; }
    public string? UserName { get; init; }
    public string? Email { get; init; }
    public bool IsActive { get; init; }
    public List<string> Roles { get; init; } = new();
    public string? FullName { get; init; }
    public string? Position { get; init; }
    public string? Phone { get; init; }
    public string? Address { get; init; }
    public string UserType { get; init; } = null!;
}
