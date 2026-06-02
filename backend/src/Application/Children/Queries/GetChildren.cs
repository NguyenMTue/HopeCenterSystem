using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Application.Common.Mappings;
using backend.Application.Common.Exceptions;
using backend.Domain.Enums;

namespace backend.Application.Children.Queries;

public record GetChildrenQuery : IRequest<PaginatedList<ChildDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public ChildStatus? Status { get; init; }
}

public class GetChildrenQueryHandler(IApplicationDbContext context, IMapper mapper, IUser user) : IRequestHandler<GetChildrenQuery, PaginatedList<ChildDto>>
{
    public async Task<PaginatedList<ChildDto>> Handle(GetChildrenQuery request, CancellationToken cancellationToken)
    {
        var isAdopter = user.Roles?.Contains("Adopter") ?? false;
        var isAdmin = user.Roles?.Contains("Administrator") ?? false;

        if (isAdmin)
        {
            throw new ForbiddenAccessException();
        }

        var query = context.Children.AsNoTracking();

        if (isAdopter)
        {
            // Adopters can only query Active children
            query = query.Where(x => x.Status == ChildStatus.Active);
        }
        else if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            // If adopter, searching by full name is disabled/restricted, but they can search by code (which is prefix of ID)
            if (isAdopter)
            {
                query = query.Where(x => x.Id.ToString().Contains(request.SearchTerm));
            }
            else
            {
                query = query.Where(x => x.FullName.Contains(request.SearchTerm));
            }
        }

        var list = await query
            .OrderBy(x => x.FullName)
            .ProjectTo<ChildDto>(mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        if (isAdopter)
        {
            var maskedItems = list.Items.Select(item => new ChildDto
            {
                Id = item.Id,
                FullName = $"Trẻ em ẩn danh {item.Id.ToString()[..8].ToUpper()}",
                DOB = item.DOB,
                Gender = item.Gender,
                HealthStatus = "Khỏe mạnh",
                Background = "Thông tin bảo mật",
                RoomId = null,
                Status = item.Status,
                AdmissionDate = item.AdmissionDate,
                Weight = item.Weight,
                Height = item.Height
            }).ToList();

            return new PaginatedList<ChildDto>(maskedItems, list.TotalCount, list.PageNumber, list.TotalPages);
        }

        return list;
    }
}

public class ChildDto
{
    public Guid Id { get; init; }
    public string FullName { get; init; } = null!;
    public DateTime? DOB { get; init; }
    public Gender? Gender { get; init; }
    public string? HealthStatus { get; init; }
    public string? Background { get; init; }
    public Guid? RoomId { get; init; }
    public ChildStatus Status { get; init; }
    public DateTime AdmissionDate { get; init; }
    public double? Weight { get; init; }
    public double? Height { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Child, ChildDto>();
        }
    }
}
