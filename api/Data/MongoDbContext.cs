using MongoDB.Bson;
using MongoDB.Driver;
using Ecommer.Api.Models;

namespace Ecommer.Api.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MongoDB")
            ?? "mongodb://localhost:27017";
        var databaseName = configuration["DatabaseName"] ?? "ecommer";

        var settings = MongoClientSettings.FromConnectionString(connectionString);
        settings.ServerSelectionTimeout = TimeSpan.FromSeconds(10);
        settings.ConnectTimeout = TimeSpan.FromSeconds(10);
        settings.SocketTimeout = TimeSpan.FromSeconds(10);

        // Force TLS 1.2 for Atlas compatibility
        settings.UseTls = true;
        settings.SslSettings = new SslSettings
        {
            EnabledSslProtocols = System.Security.Authentication.SslProtocols.Tls12
        };

        var client = new MongoClient(settings);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoDatabase GetDatabase() => _database;

    public IMongoCollection<T> GetCollection<T>(string name) =>
        _database.GetCollection<T>(name);

    // Typed accessors so services don't sprinkle collection names everywhere.
    public IMongoCollection<User> Users =>
        _database.GetCollection<User>("users");

    public IMongoCollection<Product> Products =>
        _database.GetCollection<Product>("products");

    public IMongoCollection<Order> Orders =>
        _database.GetCollection<Order>("orders");

    /// <summary>
    /// Creates indexes idempotently. Safe to call on every startup.
    /// </summary>
    public async Task EnsureIndexesAsync(CancellationToken ct = default)
    {
        // users: unique email
        var userEmailIdx = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Email),
            new CreateIndexOptions { Unique = true, Name = "ux_users_email" });
        await Users.Indexes.CreateOneAsync(userEmailIdx, cancellationToken: ct);

        // products: category + name
        var productCategoryIdx = new CreateIndexModel<Product>(
            Builders<Product>.IndexKeys.Ascending(p => p.Category).Ascending(p => p.Name),
            new CreateIndexOptions { Name = "ix_products_category_name" });
        var productSkuIdx = new CreateIndexModel<Product>(
            Builders<Product>.IndexKeys.Ascending("variants.sku"),
            new CreateIndexOptions { Name = "ix_products_sku", Sparse = true });
        await Products.Indexes.CreateManyAsync(
            new[] { productCategoryIdx, productSkuIdx }, ct);

        // orders: userId + createdAt desc
        var orderUserIdx = new CreateIndexModel<Order>(
            Builders<Order>.IndexKeys.Ascending(o => o.UserId).Descending(o => o.CreatedAt),
            new CreateIndexOptions { Name = "ix_orders_user_createdAt" });
        var orderStatusIdx = new CreateIndexModel<Order>(
            Builders<Order>.IndexKeys.Ascending(o => o.Status),
            new CreateIndexOptions { Name = "ix_orders_status" });
        await Orders.Indexes.CreateManyAsync(new[] { orderUserIdx, orderStatusIdx }, ct);
    }

    /// <summary>
    /// Quick connectivity probe used by the health check.
    /// </summary>
    public async Task<bool> PingAsync(CancellationToken ct = default)
    {
        try
        {
            var cmd = new BsonDocument("ping", 1);
            var result = await _database.RunCommandAsync<BsonDocument>(cmd, cancellationToken: ct);
            return result.GetValue("ok", 0).ToDouble() == 1.0;
        }
        catch
        {
            return false;
        }
    }
}
