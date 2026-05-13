using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Employees.Commands.CreateEmployee;

public record CreateEmployeeCommand : IRequest<Guid>
{
    public Guid AccountId { get; init; }
    public string FullName { get; init; } = null!;
    public DateTime? DOB { get; init; }
    public string? Phone { get; init; }
    public string? Position { get; init; }
}

public class CreateEmployeeCommandValidator : AbstractValidator<CreateEmployeeCommand>
{
    public CreateEmployeeCommandValidator()
    {
        RuleFor(v => v.FullName)
            .MaximumLength(200)
            .NotEmpty();
        
        RuleFor(v => v.AccountId)
            .NotEmpty();
    }
}

public class CreateEmployeeCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateEmployeeCommand, Guid>
{
    public async Task<Guid> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var entity = new Employee
        {
            AccountId = request.AccountId,
            FullName = request.FullName,
            DOB = request.DOB,
            Phone = request.Phone,
            Position = request.Position
        };

        context.Employees.Add(entity);

        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
