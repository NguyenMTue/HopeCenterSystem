using backend.Application.Attachments.Commands;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Attachments : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapPost(CreateAttachment, "");
    }

    public static async Task<Created<Guid>> CreateAttachment(ISender sender, CreateAttachmentCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Attachments/{id}", id);
    }
}
