using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Application.Donations.Commands.CreateDonation;

public record CreateDonationCommand : IRequest<Guid>
{
    public string DonorName { get; init; } = null!;
    public DonationType? DonationType { get; init; }
    public decimal TotalAmount { get; init; }
}

public class CreateDonationCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateDonationCommand, Guid>
{
    public async Task<Guid> Handle(CreateDonationCommand request, CancellationToken cancellationToken)
    {
        var entity = new Donation
        {
            DonorName = request.DonorName,
            DonationType = request.DonationType,
            TotalAmount = request.TotalAmount,
            TotalAllocatedAmount = 0,
            ReceiveDate = DateTime.UtcNow,
            Status = "Đã tiếp nhận"
        };

        context.Donations.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
