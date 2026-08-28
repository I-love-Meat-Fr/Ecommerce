using Ecommer.Api.Data.Seed;

namespace Ecommer.Api.Data;

/// <summary>
/// Centralized startup tasks: indexes + sample data. Failures are logged but
/// never block app startup so the API stays responsive even when Mongo is down.
/// </summary>
public static class MongoStartup
{
    public static async Task InitializeAsync(
        IServiceProvider services,
        ILogger logger,
        CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<MongoDbContext>();

        try
        {
            await context.EnsureIndexesAsync(ct);
            logger.LogInformation("MongoDB indexes ensured.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to ensure MongoDB indexes. The API will still start.");
            return;
        }

        try
        {
            await ProductsSeeder.SeedAsync(context, logger, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to seed sample products. The API will still start.");
        }

        try
        {
            await LockedQuantityMigrator.MigrateAsync(context, logger, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to run LockedQuantityMigrator. The API will still start.");
        }

        try
        {
            await UsersSeeder.SeedAsync(context, logger, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to seed sample users. The API will still start.");
        }

        try
        {
            await OrdersSeeder.SeedAsync(context, logger, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to seed sample orders. The API will still start.");
        }
    }
}
