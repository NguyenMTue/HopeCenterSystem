using backend.Application.AdoptionApplications.Commands.CreateAdoptionApplication;
using backend.Application.AdoptionApplications.Commands.DeleteAdoptionApplication;
using backend.Application.AdoptionApplications.Commands.UpdateAdoptionApplication;
using backend.Application.AdoptionApplications.Queries.GetAdoptionApplicationById;
using backend.Application.AdoptionApplications.Queries.GetAdoptionApplications;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class AdoptionApplications : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetAdoptionApplications);
        groupBuilder.MapGet(GetAdoptionApplicationById, "{id}");
        groupBuilder.MapPost(CreateAdoptionApplication);
        groupBuilder.MapPut(UpdateAdoptionApplication, "{id}");
        groupBuilder.MapDelete(DeleteAdoptionApplication, "{id}");
    }

    public static async Task<Ok<AdoptionApplicationsVm>> GetAdoptionApplications(ISender sender)
    {
        var result = await sender.Send(new GetAdoptionApplicationsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Ok<AdoptionApplicationDto>> GetAdoptionApplicationById(ISender sender, Guid id)
    {
        var result = await sender.Send(new GetAdoptionApplicationByIdQuery(id));
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateAdoptionApplication(ISender sender, CreateAdoptionApplicationCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/AdoptionApplications/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateAdoptionApplication(ISender sender, Guid id, UpdateAdoptionApplicationCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteAdoptionApplication(ISender sender, Guid id)
    {
        await sender.Send(new DeleteAdoptionApplicationCommand(id));
        return TypedResults.NoContent();
    }
}
