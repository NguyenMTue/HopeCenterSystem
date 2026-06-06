using backend.Application.Vaccinations.Queries;
using backend.Application.Vaccinations.Commands;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Web.Endpoints;

public class Vaccinations : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetVaccinations, "");
        groupBuilder.MapPost(CreateVaccination, "");
        groupBuilder.MapPut(UpdateVaccination, "{id}");
        groupBuilder.MapDelete(DeleteVaccination, "{id}");
    }

    public static async Task<Ok<VaccinationsVm>> GetVaccinations(ISender sender)
    {
        var result = await sender.Send(new GetVaccinationsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateVaccination(ISender sender, CreateVaccinationCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Vaccinations/{id}", id);
    }

    public static async Task<IResult> UpdateVaccination(ISender sender, Guid id, [FromBody] UpdateVaccinationRequest request)
    {
        await sender.Send(new UpdateVaccinationCommand
        {
            Id = id,
            ChildId = request.ChildId,
            VaccineName = request.VaccineName,
            Dose = request.Dose,
            VaccinationDate = request.VaccinationDate,
            Status = request.Status
        });
        return TypedResults.NoContent();
    }

    public static async Task<IResult> DeleteVaccination(ISender sender, Guid id)
    {
        await sender.Send(new DeleteVaccinationCommand(id));
        return TypedResults.NoContent();
    }
}

public class UpdateVaccinationRequest
{
    public Guid ChildId { get; set; }
    public string VaccineName { get; set; } = null!;
    public string Dose { get; set; } = "Mũi 1";
    public DateTime VaccinationDate { get; set; }
    public string Status { get; set; } = "Chờ tiêm";
}
