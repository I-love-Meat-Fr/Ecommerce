using MongoDB.Driver;
using Ecommer.Api.Models;

namespace Ecommer.Api.Data.Seed;

/// <summary>
/// Inserts a small set of users only when the users collection is empty.
/// Idempotent: safe to run on every startup.
///
/// Passwords are stored as opaque placeholder hashes (deterministic, NOT real
/// BCrypt). They are documented in <see cref="Users"/> so the seed round-trips
/// cleanly through the unique email index without a real auth pipeline.
/// </summary>
public static class UsersSeeder
{
    public static async Task SeedAsync(MongoDbContext context, ILogger logger, CancellationToken ct = default)
    {
        var users = context.Users;

        var existing = await users.CountDocumentsAsync(FilterDefinition<User>.Empty, cancellationToken: ct);
        if (existing > 0)
        {
            logger.LogInformation("Users collection already has {Count} documents. Skipping seed.", existing);
            return;
        }

        var now = DateTime.UtcNow;
        var sample = new List<User>(SeedUsers(now));

        await users.InsertManyAsync(sample, cancellationToken: ct);
        logger.LogInformation("Seeded {Count} sample users.", sample.Count);
    }

    /// <summary>
    /// Deterministic placeholder hashes — these are NOT real BCrypt hashes, they
    /// are stable opaque strings so the seeder is idempotent. Replace with real
    /// BCrypt output once an auth pipeline exists.
    /// </summary>
    internal static IEnumerable<User> SeedUsers(DateTime now) => new[]
    {
        new User
        {
            Email = "admin@ecommer.local",
            PasswordHash = "$2a$10$seed.admin.placeholder.hash.00000000000000000000",
            FullName = "Site Admin",
            Phone = "+84-900-000-001",
            Address = "1 Admin Plaza, Ho Chi Minh City, Vietnam",
            CreatedAt = now,
            IsActive = true,
        },
        new User
        {
            Email = "alice@example.com",
            PasswordHash = "$2a$10$seed.alice.placeholder.hash.000000000000000000000",
            FullName = "Alice Nguyen",
            Phone = "+84-901-111-222",
            Address = "12 Le Loi, District 1, Ho Chi Minh City",
            CreatedAt = now,
            IsActive = true,
        },
        new User
        {
            Email = "bob@example.com",
            PasswordHash = "$2a$10$seed.bob.placeholder.hash.000000000000000000000000",
            FullName = "Bob Tran",
            Phone = "+84-902-333-444",
            Address = "45 Tran Hung Dao, Hai Chau, Da Nang",
            CreatedAt = now,
            IsActive = true,
        },
        new User
        {
            Email = "carol@example.com",
            PasswordHash = "$2a$10$seed.carol.placeholder.hash.0000000000000000000000",
            FullName = "Carol Le",
            Phone = "+84-903-555-666",
            Address = "8 Phan Dinh Phung, Ba Dinh, Ha Noi",
            CreatedAt = now,
            IsActive = true,
        },
    };
}