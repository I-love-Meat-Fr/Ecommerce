using MongoDB.Driver;
using Ecommer.Api.Models;

namespace Ecommer.Api.Data.Seed;

/// <summary>
/// Promotes a user to the Admin role by email address. Idempotent — safe to run
/// on every startup. After the promotion is applied and verified, this file should
/// be removed and the registration below deleted.
///
/// Usage: change ADMIN_EMAIL to the target address, then restart the API.
/// </summary>
public static class PromoteAdminSeeder
{
    // TODO: change this to the email address you want to promote before running
    private const string AdminEmail = "admin@ecommer.local";

    public static async Task SeedAsync(MongoDbContext context, ILogger logger, CancellationToken ct = default)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Email, AdminEmail);
        var update = Builders<User>.Update.Set(u => u.Role, "Admin");

        var result = await context.Users.UpdateOneAsync(filter, update, cancellationToken: ct);

        if (result.MatchedCount == 0)
        {
            logger.LogWarning("PromoteAdminSeeder: user with email '{Email}' not found. No changes made.", AdminEmail);
            return;
        }

        if (result.ModifiedCount > 0)
        {
            logger.LogInformation("PromoteAdminSeeder: user '{Email}' promoted to Admin.", AdminEmail);
        }
        else
        {
            logger.LogInformation("PromoteAdminSeeder: user '{Email}' is already Admin.", AdminEmail);
        }
    }
}
