using backend.Application.Common.Interfaces;

namespace backend.Application.Children.Queries;

public record GetChildrenQuery : IRequest<ChildrenVm>;

public class GetChildrenQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetChildrenQuery, ChildrenVm>
{
    public async Task<ChildrenVm> Handle(GetChildrenQuery request, CancellationToken cancellationToken)
    {
        return new ChildrenVm
        {
            Lists = await context.Children
                .AsNoTracking()
                .ProjectTo<ChildDto>(mapper.ConfigurationProvider)
                .OrderBy(x => x.FullName)
                .ToListAsync(cancellationToken)
        };
    }
}

public class ChildrenVm
{
    public IReadOnlyCollection<ChildDto> Lists { get; init; } = Array.Empty<ChildDto>();
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
