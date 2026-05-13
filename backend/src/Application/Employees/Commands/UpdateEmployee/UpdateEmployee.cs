using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Employees.Commands.UpdateEmployee;

public record UpdateEmployeeCommand : IRequest
{
    public Guid Id { get; init; }
    public string FullName { get; init; } = null!;
    public DateTime? DOB { get; init; }
    public string? Phone { get; init; }
    public string? Position { get; init; }
}

public class UpdateEmployeeCommandValidator : AbstractValidator<UpdateEmployeeCommand>
{
    public UpdateEmployeeCommandValidator()
    {
        RuleFor(v => v.FullName)
            .MaximumLength(200)
            .NotEmpty();
    }
}

public class UpdateEmployeeCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateEmployeeCommand>
{
    public async Task Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Employees
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.FullName = request.FullName;
        entity.DOB = request.DOB;
        entity.Phone = request.Phone;
        entity.Position = request.Position;

        await context.SaveChangesAsync(cancellationToken);
    }
}
