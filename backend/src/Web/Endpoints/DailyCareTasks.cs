using backend.Application.DailyCareTasks.Queries;
using backend.Application.DailyCareTasks.Commands;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Web.Endpoints;

public class DailyCareTasks : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetDailyCareTasks, "");
        groupBuilder.MapPut(UpdateDailyCareTask, "{id}");
    }

    public static async Task<Ok<DailyCareTasksVm>> GetDailyCareTasks(
        ISender sender, 
        [FromQuery] Guid? employeeId,
        [FromQuery] DateTime? taskDate)
    {
        var result = await sender.Send(new GetDailyCareTasksQuery 
        { 
            EmployeeId = employeeId, 
            TaskDate = taskDate 
        });
        return TypedResults.Ok(result);
    }

    public static async Task<IResult> UpdateDailyCareTask(
        ISender sender, 
        Guid id, 
        [FromBody] UpdateDailyCareTaskRequest request)
    {
        await sender.Send(new UpdateDailyCareTaskCommand
        {
            Id = id,
            IsCompleted = request.IsCompleted,
            Note = request.Note
        });
        return TypedResults.NoContent();
    }
}

public class UpdateDailyCareTaskRequest
{
    public bool IsCompleted { get; set; }
    public string? Note { get; set; }
}
