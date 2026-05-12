using backend.Application.Notifications.Commands.CreateNotification;
using backend.Application.Notifications.Commands.DeleteNotification;
using backend.Application.Notifications.Commands.UpdateNotification;
using backend.Application.Notifications.Queries.GetNotifications;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Notifications : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetNotifications, "");
        groupBuilder.MapPost(CreateNotification, "");
        groupBuilder.MapPut(MarkAsRead, "{id}/mark-as-read");
        groupBuilder.MapDelete(DeleteNotification, "{id}");
    }

    public static async Task<Ok<NotificationsVm>> GetNotifications(ISender sender)
    {
        var result = await sender.Send(new GetNotificationsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateNotification(ISender sender, CreateNotificationCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Notifications/{id}", id);
    }

    public static async Task<NoContent> MarkAsRead(ISender sender, Guid id)
    {
        await sender.Send(new MarkNotificationAsReadCommand(id));
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteNotification(ISender sender, Guid id)
    {
        await sender.Send(new DeleteNotificationCommand(id));
        return TypedResults.NoContent();
    }
}
