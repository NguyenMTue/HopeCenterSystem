using backend.Application.Common.Interfaces;

namespace backend.Application.Donations.Commands.DeleteDonation;

public record DeleteDonationCommand(Guid Id) : IRequest;

public class DeleteDonationCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteDonationCommand>
{
    public async Task Handle(DeleteDonationCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Donations
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        if (entity.TotalAllocatedAmount > 0)
        {
            throw new Exception("Cannot delete a donation that has already been allocated.");
        }

        context.Donations.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }
}
