using backend.Application.Rooms.Commands;
using backend.Application.Rooms.Queries;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Rooms : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetRooms);
        groupBuilder.MapGet(GetRoomById, "{id}");
        groupBuilder.MapPost(CreateRoom);
        groupBuilder.MapPut(UpdateRoom, "{id}");
        groupBuilder.MapDelete(DeleteRoom, "{id}");
    }

    public static async Task<Ok<RoomsVm>> GetRooms(ISender sender)
    {
        var result = await sender.Send(new GetRoomsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Ok<RoomDto>> GetRoomById(ISender sender, Guid id)
    {
        var result = await sender.Send(new GetRoomByIdQuery(id));
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateRoom(ISender sender, CreateRoomCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Rooms/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateRoom(ISender sender, Guid id, UpdateRoomCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteRoom(ISender sender, Guid id)
    {
        await sender.Send(new DeleteRoomCommand(id));
        return TypedResults.NoContent();
    }
}
