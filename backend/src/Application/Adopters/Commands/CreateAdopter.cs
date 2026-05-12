using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Adopters.Commands.CreateAdopter;

public record CreateAdopterCommand : IRequest<Guid>
{
    public Guid AccountId { get; init; }
    public string FullName { get; init; } = null!;
    public string IDCard { get; init; } = null!;
    public string? FinancialStatus { get; init; }
    public string? MaritalStatus { get; init; }
    public string? Address { get; init; }
}

public class CreateAdopterCommandValidator : AbstractValidator<CreateAdopterCommand>
{
    public CreateAdopterCommandValidator()
    {
        RuleFor(v => v.FullName).NotEmpty().MaximumLength(200);
        RuleFor(v => v.IDCard).NotEmpty().MaximumLength(20);
    }
}

public class CreateAdopterCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateAdopterCommand, Guid>
{
    public async Task<Guid> Handle(CreateAdopterCommand request, CancellationToken cancellationToken)
    {
        var entity = new Adopter
        {
            AccountId = request.AccountId,
            FullName = request.FullName,
            IDCard = request.IDCard,
            FinancialStatus = request.FinancialStatus,
            MaritalStatus = request.MaritalStatus,
            Address = request.Address
        };

        context.Adopters.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
