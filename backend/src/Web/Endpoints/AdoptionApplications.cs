using backend.Application.AdoptionApplications.Commands.CreateAdoptionApplication;
using backend.Application.AdoptionApplications.Commands.DeleteAdoptionApplication;
using backend.Application.AdoptionApplications.Commands.UpdateAdoptionApplication;
using backend.Application.AdoptionApplications.Queries.GetAdoptionApplicationById;
using backend.Application.AdoptionApplications.Queries.GetAdoptionApplications;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using backend.Application.Common.Interfaces;

namespace backend.Web.Endpoints;

public class AdoptionApplications : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetAdoptionApplications);
        groupBuilder.MapGet(GetMyAdoptionApplications, "my");
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

    public static async Task<Ok<List<AdoptionApplicationDto>>> GetMyAdoptionApplications(
        ISender sender, 
        IUser currentUser, 
        IApplicationDbContext context)
    {
        var userIdStr = currentUser.Id;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var accountId))
        {
            return TypedResults.Ok(new List<AdoptionApplicationDto>());
        }

        var adopter = await context.Adopters.FirstOrDefaultAsync(a => a.AccountId == accountId);
        if (adopter == null)
        {
            return TypedResults.Ok(new List<AdoptionApplicationDto>());
        }

        var list = await context.AdoptionApplications
            .Where(a => a.AdopterId == adopter.Id)
            .Include(a => a.Child)
            .Select(a => new AdoptionApplicationDto
            {
                Id = a.Id,
                AdopterId = a.AdopterId,
                AdopterName = adopter.FullName,
                ChildId = a.ChildId,
                ChildName = a.Child != null ? a.Child.FullName : null,
                SubmitDate = a.SubmitDate,
                Status = a.Status,
                Reason = a.Reason,
                Notes = a.Notes
            })
            .OrderByDescending(a => a.SubmitDate)
            .ToListAsync();

        return TypedResults.Ok(list);
    }
}
