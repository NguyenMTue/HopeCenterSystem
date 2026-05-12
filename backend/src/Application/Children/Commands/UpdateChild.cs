using backend.Application.Common.Interfaces;

namespace backend.Application.Children.Commands;

public record UpdateChildCommand : IRequest
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
}

public class UpdateChildCommandValidator : AbstractValidator<UpdateChildCommand>
{
    public UpdateChildCommandValidator()
    {
        RuleFor(v => v.FullName)
            .MaximumLength(200)
            .NotEmpty();
    }
}

public class UpdateChildCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateChildCommand>
{
    public async Task Handle(UpdateChildCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Children
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.FullName = request.FullName;
        entity.DOB = request.DOB;
        entity.Gender = request.Gender;
        entity.HealthStatus = request.HealthStatus;
        entity.Background = request.Background;
        entity.RoomId = request.RoomId;
        entity.Status = request.Status;
        entity.AdmissionDate = request.AdmissionDate;
        entity.Weight = request.Weight;
        entity.Height = request.Height;

        await context.SaveChangesAsync(cancellationToken);
    }
}
