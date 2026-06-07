using backend.Application.AdoptionApplications.Commands.CreateAdoptionApplication;
using backend.Application.AdoptionApplications.Commands.DeleteAdoptionApplication;
using backend.Application.AdoptionApplications.Commands.UpdateAdoptionApplication;
using backend.Application.AdoptionApplications.Queries.GetAdoptionApplicationById;
using backend.Application.AdoptionApplications.Queries.GetAdoptionApplications;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

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

        var adopter = await context.Adopters
            .Include(a => a.Account)
            .FirstOrDefaultAsync(a => a.AccountId == accountId);
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
                Phone = adopter.Account != null ? adopter.Account.PhoneNumber : null,
                Address = adopter.Address,
                ChildId = a.ChildId,
                ChildName = a.Child != null ? a.Child.FullName : null,
                SubmitDate = a.SubmitDate,
                Status = a.Status,
                Reason = a.Reason,
                Notes = a.Notes,
                DesiredCriteria = a.DesiredCriteria,
                RejectionReason = a.RejectionReason,
                ChildGender = a.Child != null ? a.Child.Gender : null,
                ChildHealthStatus = a.Child != null ? a.Child.HealthStatus : null,
                ChildBackground = a.Child != null ? a.Child.Background : null,
                ChildDOB = a.Child != null ? a.Child.DOB : null
            })
            .OrderByDescending(a => a.SubmitDate)
            .ToListAsync();

        var childIds = list.Where(a => a.ChildId.HasValue).Select(a => a.ChildId!.Value).Distinct().ToList();
        var avatars = await context.Attachments
            .Where(a => childIds.Contains(a.TargetId) && a.TargetType == AttachmentTargetType.Child && a.FileType != null && a.FileType.StartsWith("image/"))
            .ToDictionaryAsync(a => a.TargetId, a => a.FilePath);

        foreach (var item in list)
        {
            if (item.ChildId.HasValue)
            {
                item.ChildAvatarUrl = avatars.GetValueOrDefault(item.ChildId.Value);
            }
        }

        return TypedResults.Ok(list);
    }
}
