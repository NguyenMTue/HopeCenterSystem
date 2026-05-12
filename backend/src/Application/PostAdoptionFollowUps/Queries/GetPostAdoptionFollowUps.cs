using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.PostAdoptionFollowUps.Queries.GetPostAdoptionFollowUps;

public record GetPostAdoptionFollowUpsQuery : IRequest<PostAdoptionFollowUpsVm>;

public class GetPostAdoptionFollowUpsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetPostAdoptionFollowUpsQuery, PostAdoptionFollowUpsVm>
{
    public async Task<PostAdoptionFollowUpsVm> Handle(GetPostAdoptionFollowUpsQuery request, CancellationToken cancellationToken)
    {
        return new PostAdoptionFollowUpsVm
        {
            Lists = await context.PostAdoptionFollowUps
                .AsNoTracking()
                .ProjectTo<PostAdoptionFollowUpDto>(mapper.ConfigurationProvider)
                .OrderByDescending(t => t.FollowUpDate)
                .ToListAsync(cancellationToken)
        };
    }
}

public class PostAdoptionFollowUpsVm
{
    public IReadOnlyCollection<PostAdoptionFollowUpDto> Lists { get; init; } = Array.Empty<PostAdoptionFollowUpDto>();
}

public class PostAdoptionFollowUpDto
{
    public Guid Id { get; init; }
    public Guid? ApplicationId { get; init; }
    public Guid? EvaluatorId { get; init; }
    public DateTime FollowUpDate { get; init; }
    public string? HealthNotes { get; init; }
    public string? LivingEnvironmentNotes { get; init; }
    public string? EducationNotes { get; init; }
    public AssessmentRating? OverallAssessment { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.PostAdoptionFollowUp, PostAdoptionFollowUpDto>();
        }
    }
}
