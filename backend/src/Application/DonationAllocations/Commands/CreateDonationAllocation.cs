using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.DonationAllocations.Commands.CreateDonationAllocation;

public record CreateDonationAllocationCommand : IRequest<Guid>
{
    public Guid? DonationId { get; init; }
    public string Purpose { get; init; } = null!;
    public decimal AllocatedAmount { get; init; }
    public Guid? ManagerId { get; init; }
    public string? Notes { get; init; }
}

public class CreateDonationAllocationCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateDonationAllocationCommand, Guid>
{
    public async Task<Guid> Handle(CreateDonationAllocationCommand request, CancellationToken cancellationToken)
    {
        var donation = await context.Donations
            .FindAsync(new object[] { request.DonationId! }, cancellationToken);

        Guard.Against.NotFound(request.DonationId!, donation);

        var entity = new DonationAllocation
        {
            DonationId = request.DonationId,
            Purpose = request.Purpose,
            AllocatedAmount = request.AllocatedAmount,
            ManagerId = request.ManagerId,
            Notes = request.Notes,
            AllocationDate = DateTime.UtcNow
        };

        donation!.TotalAllocatedAmount += request.AllocatedAmount;

        context.DonationAllocations.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
