using backend.Application.Common.Interfaces;

namespace backend.Application.Donations.Commands.UpdateDonation;

public record UpdateDonationCommand : IRequest
{
    public Guid Id { get; init; }
    public string Status { get; init; } = null!;
}

public class UpdateDonationCommandHandler(IApplicationDbContext context) : IRequestHandler<UpdateDonationCommand>
{
    public async Task Handle(UpdateDonationCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Donations
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.Status = request.Status;

        await context.SaveChangesAsync(cancellationToken);
    }
}
