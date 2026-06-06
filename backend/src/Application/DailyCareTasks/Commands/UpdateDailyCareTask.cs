using backend.Application.Common.Interfaces;
using backend.Application.Common.Exceptions;

namespace backend.Application.DailyCareTasks.Commands;

public record UpdateDailyCareTaskCommand : IRequest
{
    public Guid Id { get; init; }
    public bool IsCompleted { get; init; }
    public string? Note { get; init; }
}

public class UpdateDailyCareTaskCommandHandler(IApplicationDbContext context) 
    : IRequestHandler<UpdateDailyCareTaskCommand>
{
    public async Task Handle(UpdateDailyCareTaskCommand request, CancellationToken cancellationToken)
    {
        var entity = await context.DailyCareTasks
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new backend.Application.Common.Exceptions.NotFoundException("DailyCareTask", request.Id);
        }

        entity.IsCompleted = request.IsCompleted;
        entity.Note = request.Note;

        await context.SaveChangesAsync(cancellationToken);
    }
}
