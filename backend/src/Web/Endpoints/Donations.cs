using backend.Application.Donations.Commands.CreateDonation;
using backend.Application.Donations.Commands.DeleteDonation;
using backend.Application.Donations.Commands.UpdateDonation;
using backend.Application.Donations.Queries.GetDonations;
using backend.Application.Common.Models;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Donations : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetDonations, "");
        groupBuilder.MapPost(CreateDonation, "");
        groupBuilder.MapPut(UpdateDonation, "{id}");
        groupBuilder.MapDelete(DeleteDonation, "{id}");
    }

    public static async Task<Ok<PaginatedList<DonationDto>>> GetDonations(ISender sender, [AsParameters] GetDonationsQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateDonation(ISender sender, CreateDonationCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Donations/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateDonation(ISender sender, Guid id, UpdateDonationCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteDonation(ISender sender, Guid id)
    {
        await sender.Send(new DeleteDonationCommand(id));
        return TypedResults.NoContent();
    }
}
