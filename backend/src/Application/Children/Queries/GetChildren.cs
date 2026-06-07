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
            .OrderByDescending(x => x.Created)
            .ProjectTo<ChildDto>(mapper.ConfigurationProvider)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        // Lấy danh sách ảnh đại diện cho các bé
        var childIds = list.Items.Select(x => x.Id).ToList();
        var avatars = await context.Attachments
            .Where(a => childIds.Contains(a.TargetId) && a.TargetType == AttachmentTargetType.Child && a.FileType != null && a.FileType.StartsWith("image/"))
            .ToDictionaryAsync(a => a.TargetId, a => a.FilePath, cancellationToken);

        foreach (var item in list.Items)
        {
            item.AvatarUrl = avatars.GetValueOrDefault(item.Id);
        }

        if (isAdopter)
        {
            // Kiểm tra xem Adopter hiện tại đã có đơn đăng ký nào được duyệt (Approved) hay chưa
            var isApprovedAdopter = false;
            var userIdStr = user.Id;
            if (Guid.TryParse(userIdStr, out var accountId))
            {
                var adopter = await context.Adopters
                    .FirstOrDefaultAsync(a => a.AccountId == accountId, cancellationToken);
                if (adopter != null)
                {
                    isApprovedAdopter = await context.AdoptionApplications
                        .AnyAsync(a => a.AdopterId == adopter.Id && a.Status == ApplicationStatus.Approved, cancellationToken);
                }
            }

            var processedItems = list.Items.Select(item => new ChildDto
            {
                Id = item.Id,
                // Nếu được duyệt rồi thì hiển thị tên thật và ảnh thật, ngược lại ẩn danh
                FullName = isApprovedAdopter ? item.FullName : $"Trẻ em ẩn danh {item.Id.ToString()[..8].ToUpper()}",
                AvatarUrl = isApprovedAdopter ? item.AvatarUrl : null,
                DOB = isApprovedAdopter ? item.DOB : null,
                Gender = item.Gender,
                HealthStatus = isApprovedAdopter ? item.HealthStatus : "Khỏe mạnh",
                Background = isApprovedAdopter ? item.Background : "Thông tin bảo mật",
                RoomId = isApprovedAdopter ? item.RoomId : null,
                Status = item.Status,
                AdmissionDate = item.AdmissionDate,
                Weight = isApprovedAdopter ? item.Weight : null,
                Height = isApprovedAdopter ? item.Height : null
            }).ToList();

            return new PaginatedList<ChildDto>(processedItems, list.TotalCount, list.PageNumber, list.TotalPages);
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
    public string? AvatarUrl { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Child, ChildDto>();
        }
    }
}
