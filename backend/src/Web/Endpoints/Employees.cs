using backend.Application.Employees.Commands.CreateEmployee;
using backend.Application.Employees.Commands.DeleteEmployee;
using backend.Application.Employees.Commands.UpdateEmployee;
using backend.Application.Employees.Queries.GetEmployeeById;
using backend.Application.Employees.Queries.GetEmployees;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Employees : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetEmployees);
        groupBuilder.MapGet(GetEmployeeById, "{id}");
        groupBuilder.MapPost(CreateEmployee);
        groupBuilder.MapPut(UpdateEmployee, "{id}");
        groupBuilder.MapDelete(DeleteEmployee, "{id}");
    }

    public static async Task<Ok<EmployeesVm>> GetEmployees(ISender sender)
    {
        var result = await sender.Send(new GetEmployeesQuery());
        return TypedResults.Ok(result);
    }

    public static async Task<Ok<EmployeeDto>> GetEmployeeById(ISender sender, Guid id)
    {
        var result = await sender.Send(new GetEmployeeByIdQuery(id));
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateEmployee(ISender sender, CreateEmployeeCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Employees/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateEmployee(ISender sender, Guid id, UpdateEmployeeCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteEmployee(ISender sender, Guid id)
    {
        await sender.Send(new DeleteEmployeeCommand(id));
        return TypedResults.NoContent();
    }
}
