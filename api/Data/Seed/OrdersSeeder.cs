using MongoDB.Driver;
using Ecommer.Api.Models;

namespace Ecommer.Api.Data.Seed;

/// <summary>
/// Inserts a small set of orders only when the orders collection is empty.
/// Idempotent: safe to run on every startup.
///
/// Each order references real users and real product variants that were
/// inserted by <see cref="UsersSeeder"/> and <see cref="ProductsSeeder"/>.
/// <c>TotalAmount</c> is recomputed from items as the controller does
/// (<c>Σ Quantity * UnitPrice</c>) and the current <c>CreatedAt</c> spans the
/// past 30 days so the userId+createdAt index exercises a non-trivial range.
/// </summary>
public static class OrdersSeeder
{
    public static async Task SeedAsync(MongoDbContext context, ILogger logger, CancellationToken ct = default)
    {
        var orders = context.Orders;

        var existing = await orders.CountDocumentsAsync(FilterDefinition<Order>.Empty, cancellationToken: ct);
        if (existing > 0)
        {
            logger.LogInformation("Orders collection already has {Count} documents. Skipping seed.", existing);
            return;
        }

        var users = await context.Users.Find(_ => true).ToListAsync(ct);
        var products = await context.Products.Find(_ => true).ToListAsync(ct);
        if (users.Count == 0 || products.Count == 0)
        {
            logger.LogWarning("Skipping orders seed: need users ({Users}) and products ({Products}).",
                users.Count, products.Count);
            return;
        }

        var alice = users.First(u => u.Email == "alice@example.com");
        var bob = users.First(u => u.Email == "bob@example.com");
        var carol = users.First(u => u.Email == "carol@example.com");

        var iphone = products.First(p => p.Name == "iPhone 15 Pro");
        var galaxy = products.First(p => p.Name == "Samsung Galaxy S24 Ultra");
        var macbook = products.First(p => p.Name == "MacBook Air M3");
        var sony = products.First(p => p.Name == "Sony WH-1000XM5");
        var mx = products.First(p => p.Name == "Logitech MX Master 3S");
        var watch = products.First(p => p.Name == "Apple Watch Series 9");

        var variantBySku = products
            .SelectMany(p => p.Variants.Select(v => (Product: p, Variant: v)))
            .ToDictionary(t => t.Variant.Sku, t => t);

        var now = DateTime.UtcNow;
        var rng = new Random(20260816); // deterministic seed so re-runs are reproducible

        var sample = new List<Order>
        {
            BuildOrder(
                alice.Id!,
                alice.Address!,
                new[]
                {
                    Line(iphone, "IP15P-NAT-256", 1),
                    Line(sony, "WH5-BLK", 2),
                },
                "Delivered",
                now.AddDays(-28),
                variantBySku, rng),

            BuildOrder(
                bob.Id!,
                bob.Address!,
                new[]
                {
                    Line(macbook, "MBA-M3-MID-256", 1),
                    Line(mx, "MX3S-GRY", 1),
                },
                "Shipped",
                now.AddDays(-21),
                variantBySku, rng),

            BuildOrder(
                carol.Id!,
                carol.Address!,
                new[]
                {
                    Line(watch, "AW9-45-PNK-ALU", 1),
                    Line(iphone, "IP15P-BLU-512", 1),
                },
                "Processing",
                now.AddDays(-14),
                variantBySku, rng),

            BuildOrder(
                alice.Id!,
                alice.Address!,
                new[]
                {
                    Line(galaxy, "S24U-TIT-256", 1),
                    Line(sony, "WH5-SLV", 1),
                },
                "Pending",
                now.AddDays(-7),
                variantBySku, rng),

            BuildOrder(
                bob.Id!,
                bob.Address!,
                new[]
                {
                    Line(mx, "MX3S-PAL", 3),
                    Line(watch, "AW9-41-MID-ALU", 1),
                },
                "Delivered",
                now.AddDays(-2),
                variantBySku, rng),
        };

        await orders.InsertManyAsync(sample, cancellationToken: ct);
        logger.LogInformation("Seeded {Count} sample orders.", sample.Count);
    }

    private static (Product product, ProductVariant variant, int quantity) Line(Product product, string sku, int quantity)
        => (product, product.Variants.First(v => v.Sku == sku), quantity);

    private static Order BuildOrder(
        string userId,
        string shippingAddress,
        IEnumerable<(Product product, ProductVariant variant, int quantity)> lines,
        string status,
        DateTime createdAt,
        Dictionary<string, (Product product, ProductVariant variant)> variantBySku,
        Random rng)
    {
        var items = lines.Select(t =>
        {
            var (product, variant, quantity) = t;
            return new OrderItem
            {
                ProductId = product.Id!,
                VariantId = variant.Sku,
                ProductName = product.Name,
                VariantName = variant.Name,
                Sku = variant.Sku,
                Quantity = quantity,
                UnitPrice = variant.Price,
            };
        }).ToList();

        return new Order
        {
            UserId = userId,
            Items = items,
            TotalAmount = items.Sum(i => i.Quantity * i.UnitPrice),
            Status = status,
            ShippingAddress = shippingAddress,
            CreatedAt = createdAt,
        };
    }
}