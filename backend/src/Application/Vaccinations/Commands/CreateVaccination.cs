using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Vaccinations.Commands;

public record CreateVaccinationCommand : IRequest<Guid>
{
    public Guid ChildId { get; init; }
    public string VaccineName { get; init; } = null!;
    public string Dose { get; init; } = "Mũi 1";
    public DateTime VaccinationDate { get; init; }
    public string Status { get; init; } = "Chờ tiêm";
}

public class CreateVaccinationCommandHandler(IApplicationDbContext context) 
    : IRequestHandler<CreateVaccinationCommand, Guid>
{
    public async Task<Guid> Handle(CreateVaccinationCommand request, CancellationToken cancellationToken)
    {
        var entity = new Vaccination
        {
            ChildId = request.ChildId,
            VaccineName = request.VaccineName,
            Dose = request.Dose,
            VaccinationDate = request.VaccinationDate,
            Status = request.Status
        };

        context.Vaccinations.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
