using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace backend.Infrastructure.Data;

public static class InitialiserExtensions
{
    // Thay WebApplication thành IHost
    public static async Task InitialiseDatabaseAsync(this IHost app)
    {
        using var scope = app.Services.CreateScope();

        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();

        await initialiser.InitialiseAsync();
        await initialiser.SeedAsync();
    }
}