using backend.Application.TaskAssignments.Commands.CreateTaskAssignment;
using backend.Application.TaskAssignments.Commands.DeleteTaskAssignment;
using backend.Application.TaskAssignments.Commands.UpdateTaskAssignment;
using backend.Application.TaskAssignments.Queries.GetTaskAssignments;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Http;

namespace backend.Web.Endpoints;

public class TaskAssignments : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetTaskAssignments, "");
        groupBuilder.MapPost(CreateTaskAssignment, "");
        groupBuilder.MapPut(UpdateTaskAssignment, "{id}");
        groupBuilder.MapDelete(DeleteTaskAssignment, "{id}");
    }

    public static async Task<Ok<TaskAssignmentsVm>> GetTaskAssignments(ISender sender)
    {
        var result = await sender.Send(new GetTaskAssignmentsQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateTaskAssignment(ISender sender, CreateTaskAssignmentCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/TaskAssignments/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateTaskAssignment(ISender sender, Guid id, UpdateTaskAssignmentCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteTaskAssignment(ISender sender, Guid id)
    {
        await sender.Send(new DeleteTaskAssignmentCommand(id));
        return TypedResults.NoContent();
    }
}
