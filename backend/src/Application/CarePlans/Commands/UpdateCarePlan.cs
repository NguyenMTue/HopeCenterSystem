using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.CarePlans.Commands.UpdateCarePlan;

public record CarePlanSupplyUpdateInput
{
    public Guid InventoryItemId { get; init; }
    public int Quantity { get; init; }
}

public record UpdateCarePlanCommand : IRequest
{
    public Guid Id { get; init; }
    public string Title { get; init; } = null!;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public Guid? ApproverId { get; init; }
    public Guid? EmployeeId { get; init; }
    public ApplicationStatus Status { get; init; }
    public List<CarePlanSupplyUpdateInput>? Supplies { get; init; }
}

public class UpdateCarePlanCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateCarePlanCommand>
{
    public async Task Handle(UpdateCarePlanCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.CarePlans
            .Include(p => p.CarePlanSupplies)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

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

        entity.Title = request.Title;
        entity.StartDate = request.StartDate;
        entity.EndDate = request.EndDate;
        entity.ApproverId = request.ApproverId;
        entity.EmployeeId = request.EmployeeId;

        // Process stock deduction if transitioning to Completed
        if (request.Status == ApplicationStatus.Completed && entity.Status != ApplicationStatus.Completed)
        {
            foreach (var cpSupply in entity.CarePlanSupplies)
            {
                var item = await context.InventoryItems.FindAsync(new object[] { cpSupply.InventoryItemId }, cancellationToken);
                if (item != null)
                {
                    if (item.CurrentQuantity < cpSupply.Quantity)
                    {
                        throw new InvalidOperationException($"Số lượng vật tư '{item.ItemName}' không đủ (Hiện có: {item.CurrentQuantity}, Yêu cầu: {cpSupply.Quantity})");
                    }
                    item.CurrentQuantity -= cpSupply.Quantity;

                    context.InventoryTransactions.Add(new InventoryTransaction
                    {
                        ItemId = cpSupply.InventoryItemId,
                        EmployeeId = request.EmployeeId ?? entity.EmployeeId,
                        Type = TransactionType.Export,
                        Quantity = cpSupply.Quantity,
                        TransactionDate = DateTime.UtcNow,
                        Reason = $"Sử dụng nhanh cho Nhiệm vụ/Kế hoạch: {entity.Title}",
                        Notes = "[ĐÃ DUYỆT] Tự động xuất kho từ nhiệm vụ hoàn thành."
                    });
                }
            }
        }

        entity.Status = request.Status;

        // Update supplies list
        context.CarePlanSupplies.RemoveRange(entity.CarePlanSupplies);
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

        await context.SaveChangesAsync(cancellationToken);
    }
}
