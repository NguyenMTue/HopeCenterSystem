using backend.Application.Common.Interfaces;
using backend.Application.Common.Exceptions;

namespace backend.Application.Vaccinations.Commands;

public record DeleteVaccinationCommand(Guid Id) : IRequest;

public class DeleteVaccinationCommandHandler(IApplicationDbContext context) 
    : IRequestHandler<DeleteVaccinationCommand>
{
    public async Task Handle(DeleteVaccinationCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Vaccinations
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new backend.Application.Common.Exceptions.NotFoundException("Vaccination", request.Id);
        }

        context.Vaccinations.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }
}
