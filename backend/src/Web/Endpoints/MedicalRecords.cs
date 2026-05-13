using backend.Application.MedicalRecords.Commands.CreateMedicalRecord;
using backend.Application.MedicalRecords.Commands.DeleteMedicalRecord;
using backend.Application.MedicalRecords.Commands.UpdateMedicalRecord;
using backend.Application.MedicalRecords.Queries.GetMedicalRecords;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Http;

namespace backend.Web.Endpoints;

public class MedicalRecords : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetMedicalRecords, "");
        groupBuilder.MapPost(CreateMedicalRecord, "");
        groupBuilder.MapPut(UpdateMedicalRecord, "{id}");
        groupBuilder.MapDelete(DeleteMedicalRecord, "{id}");
    }

    public static async Task<Ok<MedicalRecordsVm>> GetMedicalRecords(ISender sender)
    {
        var result = await sender.Send(new GetMedicalRecordsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateMedicalRecord(ISender sender, CreateMedicalRecordCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/MedicalRecords/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateMedicalRecord(ISender sender, Guid id, UpdateMedicalRecordCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteMedicalRecord(ISender sender, Guid id)
    {
        await sender.Send(new DeleteMedicalRecordCommand(id));
        return TypedResults.NoContent();
    }
}
