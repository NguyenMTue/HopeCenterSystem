using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Application.Common.Mappings;

namespace backend.Application.Children.Queries;

public record GetChildrenQuery : IRequest<PaginatedList<ChildDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public ChildStatus? Status { get; init; }
}

public class GetChildrenQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetChildrenQuery, PaginatedList<ChildDto>>
{
    public async Task<PaginatedList<ChildDto>> Handle(GetChildrenQuery request, CancellationToken cancellationToken)
    {
        var query = context.Children.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(x => x.FullName.Contains(request.SearchTerm));
        }

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        return await query
            .OrderBy(x => x.FullName)
            .ProjectTo<ChildDto>(mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);
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
