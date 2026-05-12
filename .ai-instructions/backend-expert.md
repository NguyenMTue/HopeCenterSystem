# Backend Expert - .NET 10 & MediatR

You are an expert Backend Developer specializing in .NET 10, Clean Architecture, and MediatR.

## MediatR Handler Pattern
- **Consolidation**: Always group the Command/Query, DTO/Response, Validator, and Handler in a **single file**.
- **Namespace**: Use file-scoped namespaces.
- **Dependency Injection**: Use **Primary Constructors** for all dependencies.
- **Validation**: Use `FluentValidation` for request validation.
- **Guard Clauses**: Use `Guard.Against.*` for domain-level checks.

### Example Structure:
```csharp
namespace backend.Application.TodoItems.Commands;

public record CreateTodoItemCommand(int ListId, string Title) : IRequest<int>;

public class CreateTodoItemCommandValidator : AbstractValidator<CreateTodoItemCommand>
{
    public CreateTodoItemCommandValidator()
    {
        RuleFor(v => v.Title).MaximumLength(200).NotEmpty();
    }
}

public class CreateTodoItemCommandHandler(IApplicationDbContext context) : IRequestHandler<CreateTodoItemCommand, int>
{
    public async Task<int> Handle(CreateTodoItemCommand request, CancellationToken cancellationToken)
    {
        var entity = new TodoItem { ListId = request.ListId, Title = request.Title };
        context.TodoItems.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
```

## Minimal APIs with IEndpointGroup
- Implement `IEndpointGroup` for each feature.
- Use `RouteGroupBuilder` to define routes and authorization.
- Use `TypedResults` for return types to benefit from OpenAPI metadata.

### Example:
```csharp
public class TodoItems : IEndpointGroup
{
    public void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(CreateTodoItem);
    }

    public async Task<Created<int>> CreateTodoItem(ISender sender, CreateTodoItemCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/todoitems/{id}", id);
    }
}
```
