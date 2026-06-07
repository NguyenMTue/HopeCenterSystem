using backend.Application.Common.Interfaces;
using backend.Application.Common.Exceptions;
using backend.Domain.Enums;

namespace backend.Application.Children.Queries;

public record GetChildByIdQuery(Guid Id) : IRequest<ChildDto>;

public class GetChildByIdQueryHandler(IApplicationDbContext context, IMapper mapper, IUser user) : IRequestHandler<GetChildByIdQuery, ChildDto>
{
    public async Task<ChildDto> Handle(GetChildByIdQuery request, CancellationToken cancellationToken)
    {
        var isAdopter = user.Roles?.Contains("Adopter") ?? false;
        var isAdmin = user.Roles?.Contains("Administrator") ?? false;

        if (isAdmin)
        {
            throw new ForbiddenAccessException();
        }

        var entity = await context.Children
            .AsNoTracking()
            .ProjectTo<ChildDto>(mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        if (isAdopter)
        {
            if (entity.Status != ChildStatus.Active)
            {
                throw new ForbiddenAccessException();
            }

            return new ChildDto
            {
                Id = entity.Id,
                FullName = $"Trẻ em ẩn danh {entity.Id.ToString()[..8].ToUpper()}",
                DOB = entity.DOB,
                Gender = entity.Gender,
                HealthStatus = "Khỏe mạnh",
                Background = "Thông tin bảo mật",
                RoomId = null,
                Status = entity.Status,
                AdmissionDate = entity.AdmissionDate,
                Weight = entity.Weight,
                Height = entity.Height
            };
        }

        return entity!;
    }
}
