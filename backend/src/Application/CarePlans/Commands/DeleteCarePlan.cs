using backend.Application.Common.Interfaces;

namespace backend.Application.CarePlans.Commands.DeleteCarePlan;

public record DeleteCarePlanCommand(Guid Id) : IRequest;

public class DeleteCarePlanCommandHandler(IApplicationDbContext context) : IRequestHandler<DeleteCarePlanCommand>
{
    public async Task Handle(DeleteCarePlanCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.CarePlans
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        context.CarePlans.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }
}
