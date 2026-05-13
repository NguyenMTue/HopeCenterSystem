using backend.Application.DonationAllocations.Commands.CreateDonationAllocation;
using backend.Application.DonationAllocations.Queries.GetDonationAllocations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class DonationAllocations : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetDonationAllocations, "");
        groupBuilder.MapPost(CreateDonationAllocation, "");
    }

    public static async Task<Ok<DonationAllocationsVm>> GetDonationAllocations(ISender sender)
    {
        var result = await sender.Send(new GetDonationAllocationsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateDonationAllocation(ISender sender, CreateDonationAllocationCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/DonationAllocations/{id}", id);
    }
}
