using FluentAssertions;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using Xunit;

namespace Ecommer.Api.Tests;

/// <summary>
/// Integration tests against a real MongoDB instance.
///
/// We use the Atlas cluster from .env, but on a separate database (`ecommer_test_*`)
/// and a unique product per test so the production data is untouched and tests can
/// run in parallel.
///
/// Set TEST_MONGO_CONNECTION_STRING to override; otherwise falls back to the same
/// connection string as the API.
/// </summary>
public abstract class MongoIntegrationTestBase : IAsyncLifetime
{
    protected MongoClient Client { get; private set; } = null!;
    protected IMongoDatabase Database { get; private set; } = null!;
    protected string DatabaseName { get; private set; } = null!;

    public virtual Task InitializeAsync()
    {
        var connStr = Environment.GetEnvironmentVariable("TEST_MONGO_CONNECTION_STRING")
            ?? "mongodb+srv://nguyenquocanh170205_db_user:FJGAwn7TMMPkcslN@cluster0.2pu37z6.mongodb.net/?retryWrites=true&w=majority";

        var settings = MongoClientSettings.FromConnectionString(connStr);
        settings.ServerSelectionTimeout = TimeSpan.FromSeconds(10);

        Client = new MongoClient(settings);
        // Mongo limits database names to 38 bytes. Create a fresh database for
        // *every test* so each test sees an empty collection and can re-use
        // canonical SKU values.
        DatabaseName = $"t_{Guid.NewGuid():N}"[..^24]; // 2 + 8 hex = 10 chars
        Database = Client.GetDatabase(DatabaseName);
        return Task.CompletedTask;
    }

    public virtual async Task DisposeAsync()
    {
        // Drop the test database after each test so Atlas doesn't accumulate junk.
        await Client.DropDatabaseAsync(DatabaseName);
    }

    protected ILogger<T> NullLogger<T>() => new LoggerStub<T>();
}

internal class LoggerStub<T> : ILogger<T>
{
    public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
    public bool IsEnabled(LogLevel logLevel) => false;
    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter) { }
}
