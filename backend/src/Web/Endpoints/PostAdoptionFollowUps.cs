using backend.Application.PostAdoptionFollowUps.Commands.CreatePostAdoptionFollowUp;
using backend.Application.PostAdoptionFollowUps.Queries.GetPostAdoptionFollowUps;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class PostAdoptionFollowUps : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetPostAdoptionFollowUps, "");
        groupBuilder.MapPost(CreatePostAdoptionFollowUp, "");
    }

    public static async Task<Ok<PostAdoptionFollowUpsVm>> GetPostAdoptionFollowUps(ISender sender)
    {
        var result = await sender.Send(new GetPostAdoptionFollowUpsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreatePostAdoptionFollowUp(ISender sender, CreatePostAdoptionFollowUpCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/PostAdoptionFollowUps/{id}", id);
    }
}
