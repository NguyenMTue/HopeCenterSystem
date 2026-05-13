using backend.Application.Common.Interfaces;

namespace backend.Application.Adopters.Commands.UpdateAdopter;

public record UpdateAdopterCommand : IRequest
{
    public Guid Id { get; init; }
    public string FullName { get; init; } = null!;
    public string IDCard { get; init; } = null!;
    public string? FinancialStatus { get; init; }
    public string? MaritalStatus { get; init; }
    public string? Address { get; init; }
}

public class UpdateAdopterCommandValidator : AbstractValidator<UpdateAdopterCommand>
{
    public UpdateAdopterCommandValidator()
    {
        RuleFor(v => v.FullName).NotEmpty().MaximumLength(200);
        RuleFor(v => v.IDCard).NotEmpty().MaximumLength(20);
    }
}

public class UpdateAdopterCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateAdopterCommand>
{
    public async Task Handle(UpdateAdopterCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Adopters
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.FullName = request.FullName;
        entity.IDCard = request.IDCard;
        entity.FinancialStatus = request.FinancialStatus;
        entity.MaritalStatus = request.MaritalStatus;
        entity.Address = request.Address;

        await context.SaveChangesAsync(cancellationToken);
    }
}
