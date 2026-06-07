using backend.Application.Common.Interfaces;
using backend.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace backend.Application.AdoptionApplications.Queries.GetAdoptionApplications;

public record GetAdoptionApplicationsQuery : IRequest<AdoptionApplicationsVm>;

public class GetAdoptionApplicationsQueryHandler(IApplicationDbContext context, IMapper mapper) : IRequestHandler<GetAdoptionApplicationsQuery, AdoptionApplicationsVm>
{
    public async Task<AdoptionApplicationsVm> Handle(GetAdoptionApplicationsQuery request, CancellationToken cancellationToken)
    {
        var lists = await context.AdoptionApplications
            .AsNoTracking()
            .ProjectTo<AdoptionApplicationDto>(mapper.ConfigurationProvider)
            .OrderByDescending(t => t.SubmitDate)
            .ToListAsync(cancellationToken);

        var childIds = lists.Where(a => a.ChildId.HasValue).Select(a => a.ChildId!.Value).Distinct().ToList();
        var avatars = await context.Attachments
            .Where(a => childIds.Contains(a.TargetId) && a.TargetType == AttachmentTargetType.Child && a.FileType != null && a.FileType.StartsWith("image/"))
            .ToDictionaryAsync(a => a.TargetId, a => a.FilePath, cancellationToken);

        foreach (var item in lists)
        {
            if (item.ChildId.HasValue)
            {
                item.ChildAvatarUrl = avatars.GetValueOrDefault(item.ChildId.Value);
            }
        }

        return new AdoptionApplicationsVm
        {
            Lists = lists
        };
    }
}

public class AdoptionApplicationsVm
{
    public IReadOnlyCollection<AdoptionApplicationDto> Lists { get; init; } = Array.Empty<AdoptionApplicationDto>();
}

public class AdoptionApplicationDto
{
    public Guid Id { get; init; }
    public Guid? AdopterId { get; init; }
    public string? AdopterName { get; init; }
    public string? Phone { get; init; }
    public string? Address { get; init; }
    public Guid? ChildId { get; init; }
    public string? ChildName { get; init; }
    public DateTime SubmitDate { get; init; }
    public ApplicationStatus Status { get; init; }
    public Guid? ApproverId { get; init; }
    public string? RejectionReason { get; init; }
    public string? Reason { get; init; }
    public string? Notes { get; init; }
    public string? DesiredCriteria { get; init; }
    public string? ChildAvatarUrl { get; set; }
    public Gender? ChildGender { get; init; }
    public string? ChildHealthStatus { get; init; }
    public string? ChildBackground { get; init; }
    public DateTime? ChildDOB { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<backend.Domain.Entities.AdoptionApplication, AdoptionApplicationDto>()
                .ForMember(d => d.AdopterName, opt => opt.MapFrom(s => s.Adopter != null ? s.Adopter.FullName : null))
                .ForMember(d => d.Phone, opt => opt.MapFrom(s => s.Adopter != null && s.Adopter.Account != null ? s.Adopter.Account.PhoneNumber : null))
                .ForMember(d => d.Address, opt => opt.MapFrom(s => s.Adopter != null ? s.Adopter.Address : null))
                .ForMember(d => d.ChildName, opt => opt.MapFrom(s => s.Child != null ? s.Child.FullName : null))
                .ForMember(d => d.ChildGender, opt => opt.MapFrom(s => s.Child != null ? s.Child.Gender : null))
                .ForMember(d => d.ChildHealthStatus, opt => opt.MapFrom(s => s.Child != null ? s.Child.HealthStatus : null))
                .ForMember(d => d.ChildBackground, opt => opt.MapFrom(s => s.Child != null ? s.Child.Background : null))
                .ForMember(d => d.ChildDOB, opt => opt.MapFrom(s => s.Child != null ? s.Child.DOB : null));
        }
    }
}
