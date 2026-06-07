using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;
using MediatR;

namespace backend.Application.CarePlans.Commands.CreateCarePlan;

public record CarePlanSupplyInput
{
    public Guid InventoryItemId { get; init; }
    public int Quantity { get; init; }
}

public record CreateCarePlanCommand : IRequest<Guid>
{
    public Guid ChildId { get; init; }
    public string Title { get; init; } = null!;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public Guid? EmployeeId { get; init; }
    public List<CarePlanSupplyInput>? Supplies { get; init; }
}

public class CreateCarePlanCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateCarePlanCommand, Guid>
{
    public async Task<Guid> Handle(CreateCarePlanCommand request, CancellationToken cancellationToken)
    {
        if (request.EmployeeId.HasValue)
        {
            var employee = await context.Employees.FindAsync(new object[] { request.EmployeeId.Value }, cancellationToken);
            Guard.Against.NotFound(request.EmployeeId.Value, employee);

            var pos = (employee.Position ?? "").ToLower();
            if (pos.Contains("quản lý") || pos.Contains("giám đốc") || pos.Contains("quản trị"))
            {
                throw new InvalidOperationException("Chỉ được giao nhiệm vụ cho nhân viên chăm sóc (Caregiver).");
            }
        }

        var entity = new CarePlan
        {
            ChildId = request.ChildId,
            Title = request.Title,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            EmployeeId = request.EmployeeId,
            Status = ApplicationStatus.Pending
        };

        if (request.Supplies != null && request.Supplies.Any())
        {
            foreach (var item in request.Supplies)
            {
                entity.CarePlanSupplies.Add(new CarePlanSupply
                {
                    InventoryItemId = item.InventoryItemId,
                    Quantity = item.Quantity
                });
            }
        }

        context.CarePlans.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
