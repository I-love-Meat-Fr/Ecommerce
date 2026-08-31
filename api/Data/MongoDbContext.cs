using MongoDB.Bson;
using MongoDB.Driver;
using Ecommer.Api.Models;

namespace Ecommer.Api.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    // Overload so tests can inject a custom connection string + database name.
    public MongoDbContext(string connectionString, string databaseName)
    {
        var settings = MongoClientSettings.FromConnectionString(connectionString);
        settings.ServerSelectionTimeout = TimeSpan.FromSeconds(10);
        settings.ConnectTimeout = TimeSpan.FromSeconds(10);
        settings.SocketTimeout = TimeSpan.FromSeconds(10);

        var wantsTls =
            connectionString.StartsWith("mongodb+srv://", StringComparison.OrdinalIgnoreCase) ||
            connectionString.Contains("tls=true", StringComparison.OrdinalIgnoreCase) ||
            connectionString.Contains("ssl=true", StringComparison.OrdinalIgnoreCase);

        if (wantsTls)
        {
            settings.UseTls = true;
            settings.SslSettings = new SslSettings
            {
                EnabledSslProtocols = System.Security.Authentication.SslProtocols.Tls12
            };
        }

        var client = new MongoClient(settings);
        _database = client.GetDatabase(databaseName);
    }

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING")
            ?? configuration.GetConnectionString("MongoDB")
            ?? "mongodb://localhost:27017";
        var databaseName = configuration["DatabaseName"] ?? "ecommer";

        var settings = MongoClientSettings.FromConnectionString(connectionString);
        settings.ServerSelectionTimeout = TimeSpan.FromSeconds(10);
        settings.ConnectTimeout = TimeSpan.FromSeconds(10);
        settings.SocketTimeout = TimeSpan.FromSeconds(10);

        // TLS handshake only when the connection string requires it (SRV / explicit flag).
        // Local mongod on `mongodb://localhost:27017` does NOT serve TLS, so we must not
        // force it. Atlas (`mongodb+srv://...`) and `mongodb://...?tls=true` opt-in via
        // the connection string itself; we additionally honour an explicit env override.
        var wantsTls =
            connectionString.StartsWith("mongodb+srv://", StringComparison.OrdinalIgnoreCase) ||
            connectionString.Contains("tls=true", StringComparison.OrdinalIgnoreCase) ||
            connectionString.Contains("ssl=true", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(
                Environment.GetEnvironmentVariable("MONGO_USE_TLS"),
                "true",
                StringComparison.OrdinalIgnoreCase);

        if (wantsTls)
        {
            settings.UseTls = true;
            settings.SslSettings = new SslSettings
            {
                EnabledSslProtocols = System.Security.Authentication.SslProtocols.Tls12
            };
        }

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

    public IMongoCollection<Category> Categories =>
        _database.GetCollection<Category>("categories");

    public IMongoCollection<OrderStatusLog> OrderStatusLogs =>
        _database.GetCollection<OrderStatusLog>("order_status_logs");

    public IMongoCollection<Review> Reviews =>
        _database.GetCollection<Review>("reviews");

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

        // order_status_logs: orderId + changedAt
        var logOrderIdx = new CreateIndexModel<OrderStatusLog>(
            Builders<OrderStatusLog>.IndexKeys.Ascending(l => l.OrderId).Descending(l => l.ChangedAt),
            new CreateIndexOptions { Name = "ix_orderstatuslogs_orderId_changedAt" });
        await OrderStatusLogs.Indexes.CreateManyAsync(new[] { logOrderIdx }, ct);

        // categories: unique name
        var categoryNameIdx = new CreateIndexModel<Category>(
            Builders<Category>.IndexKeys.Ascending(c => c.Name),
            new CreateIndexOptions { Unique = true, Name = "ux_categories_name" });
        await Categories.Indexes.CreateOneAsync(categoryNameIdx, cancellationToken: ct);

        // reviews: (productId, variantSku) + createdAt desc
        var reviewProductIdx = new CreateIndexModel<Review>(
            Builders<Review>.IndexKeys
                .Ascending(r => r.ProductId)
                .Ascending(r => r.VariantSku)
                .Descending(r => r.CreatedAt),
            new CreateIndexOptions { Name = "ix_reviews_product_variant_createdAt" });
        await Reviews.Indexes.CreateOneAsync(reviewProductIdx, cancellationToken: ct);
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
