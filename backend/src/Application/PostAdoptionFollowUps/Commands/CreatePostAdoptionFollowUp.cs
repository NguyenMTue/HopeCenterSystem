using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Application.PostAdoptionFollowUps.Commands.CreatePostAdoptionFollowUp;

public record CreatePostAdoptionFollowUpCommand : IRequest<Guid>
{
    public Guid? ApplicationId { get; init; }
    public Guid? EvaluatorId { get; init; }
    public string? HealthNotes { get; init; }
    public string? LivingEnvironmentNotes { get; init; }
    public string? EducationNotes { get; init; }
    public AssessmentRating? OverallAssessment { get; init; }
}

public class CreatePostAdoptionFollowUpCommandHandler(IApplicationDbContext context) : IRequestHandler<CreatePostAdoptionFollowUpCommand, Guid>
{
    public async Task<Guid> Handle(CreatePostAdoptionFollowUpCommand request, CancellationToken cancellationToken)
    {
        var entity = new PostAdoptionFollowUp
        {
            ApplicationId = request.ApplicationId,
            EvaluatorId = request.EvaluatorId,
            HealthNotes = request.HealthNotes,
            LivingEnvironmentNotes = request.LivingEnvironmentNotes,
            EducationNotes = request.EducationNotes,
            OverallAssessment = request.OverallAssessment,
            FollowUpDate = DateTime.UtcNow
        };

        context.PostAdoptionFollowUps.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
