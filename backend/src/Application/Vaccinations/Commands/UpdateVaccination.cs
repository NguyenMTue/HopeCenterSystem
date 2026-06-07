using backend.Application.Common.Interfaces;
using backend.Application.Common.Exceptions;

namespace backend.Application.Vaccinations.Commands;

public record UpdateVaccinationCommand : IRequest
{
    public Guid Id { get; init; }
    public Guid ChildId { get; init; }
    public string VaccineName { get; init; } = null!;
    public string Dose { get; init; } = "Mũi 1";
    public DateTime VaccinationDate { get; init; }
    public string Status { get; init; } = "Chờ tiêm";
}

public class UpdateVaccinationCommandHandler(IApplicationDbContext context) 
    : IRequestHandler<UpdateVaccinationCommand>
{
    public async Task Handle(UpdateVaccinationCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.Vaccinations
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new backend.Application.Common.Exceptions.NotFoundException("Vaccination", request.Id);
        }

        entity.ChildId = request.ChildId;
        entity.VaccineName = request.VaccineName;
        entity.Dose = request.Dose;
        entity.VaccinationDate = request.VaccinationDate;
        entity.Status = request.Status;

        await context.SaveChangesAsync(cancellationToken);
    }
}
