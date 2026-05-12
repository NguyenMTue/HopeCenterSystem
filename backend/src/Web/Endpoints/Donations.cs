using backend.Application.Donations.Commands.CreateDonation;
using backend.Application.Donations.Commands.DeleteDonation;
using backend.Application.Donations.Commands.UpdateDonation;
using backend.Application.Donations.Queries.GetDonations;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Http;

namespace backend.Web.Endpoints;

public class Donations : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetDonations, "");
        groupBuilder.MapPost(CreateDonation, "");
        groupBuilder.MapPut(UpdateDonation, "{id}");
        groupBuilder.MapDelete(DeleteDonation, "{id}");
    }

    public static async Task<Ok<DonationsVm>> GetDonations(ISender sender)
    {
        var result = await sender.Send(new GetDonationsQuery());
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
