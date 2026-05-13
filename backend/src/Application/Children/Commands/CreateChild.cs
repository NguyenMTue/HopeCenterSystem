using backend.Application.Common.Interfaces;

namespace backend.Application.Children.Commands;

public record CreateChildCommand : IRequest<Guid>
{
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
}

public class CreateChildCommandValidator : AbstractValidator<CreateChildCommand>
{
    public CreateChildCommandValidator()
    {
        RuleFor(v => v.FullName)
            .MaximumLength(200)
            .NotEmpty();
    }
}

public class CreateChildCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateChildCommand, Guid>
{
    public async Task<Guid> Handle(CreateChildCommand request, CancellationToken cancellationToken)
    {
        var entity = new Child
        {
            FullName = request.FullName,
            DOB = request.DOB,
            Gender = request.Gender,
            HealthStatus = request.HealthStatus,
            Background = request.Background,
            RoomId = request.RoomId,
            Status = request.Status,
            AdmissionDate = request.AdmissionDate,
            Weight = request.Weight,
            Height = request.Height
        };

        context.Children.Add(entity);

        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
