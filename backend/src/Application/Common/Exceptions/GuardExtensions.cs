using backend.Application.Common.Exceptions;
using System.Runtime.CompilerServices;

namespace Ardalis.GuardClauses;

public static class GuardExtensions
{
    public static void NotFound(this IGuardClause guardClause, object key, object? entity, [CallerArgumentExpression("entity")] string? name = null)
    {
        if (entity is null)
        {
            throw new backend.Application.Common.Exceptions.NotFoundException(name ?? "Entity", key);
        }
    }
}
