using MongoDB.Driver;
using Ecommer.Api.Models;

namespace Ecommer.Api.Data.Seed;

/// <summary>
/// Inserts a curated set of products only when the products collection is empty.
/// Idempotent: safe to run on every startup.
/// </summary>
public static class ProductsSeeder
{
    public static async Task SeedAsync(MongoDbContext context, ILogger logger, CancellationToken ct = default)
    {
        var products = context.Products;

        var existing = await products.CountDocumentsAsync(FilterDefinition<Product>.Empty, cancellationToken: ct);
        if (existing > 0)
        {
            logger.LogInformation("Products collection already has {Count} documents. Skipping seed.", existing);
            return;
        }

        var now = DateTime.UtcNow;
        var sample = new List<Product>
        {
            new()
            {
                Name = "iPhone 15 Pro",
                Description = "Titanium design, A17 Pro chip, ProMotion display.",
                Category = "phones",
                ImageUrl = "https://example.com/img/iphone-15-pro.jpg",
                CreatedAt = now,
                UpdatedAt = now,
                Variants = new List<ProductVariant>
                {
                    new() { Sku = "IP15P-NAT-256", Name = "Natural Titanium 256GB", Color = "Natural", Storage = "256GB", Price = 1199m, Stock = 25, ImageUrl = "https://example.com/img/iphone-15-pro-natural.jpg", IsActive = true },
                    new() { Sku = "IP15P-BLU-512", Name = "Blue Titanium 512GB",     Color = "Blue",    Storage = "512GB", Price = 1399m, Stock = 12, ImageUrl = "https://example.com/img/iphone-15-pro-blue.jpg",    IsActive = true },
                    new() { Sku = "IP15P-BLK-1TB", Name = "Black Titanium 1TB",       Color = "Black",   Storage = "1TB",   Price = 1599m, Stock =  8, ImageUrl = "https://example.com/img/iphone-15-pro-black.jpg",   IsActive = true },
                }
            },
            new()
            {
                Name = "Samsung Galaxy S24 Ultra",
                Description = "Snapdragon 8 Gen 3, 200MP camera, S Pen built-in.",
                Category = "phones",
                ImageUrl = "https://example.com/img/galaxy-s24-ultra.jpg",
                CreatedAt = now,
                UpdatedAt = now,
                Variants = new List<ProductVariant>
                {
                    new() { Sku = "S24U-TIT-256", Name = "Titanium Gray 256GB", Color = "Titanium Gray", Storage = "256GB", Price = 1299m, Stock = 20, ImageUrl = null, IsActive = true },
                    new() { Sku = "S24U-BLK-512", Name = "Titanium Black 512GB", Color = "Titanium Black", Storage = "512GB", Price = 1419m, Stock = 15, ImageUrl = null, IsActive = true },
                }
            },
            new()
            {
                Name = "MacBook Air M3",
                Description = "13-inch, fanless, up to 18h battery.",
                Category = "laptops",
                ImageUrl = "https://example.com/img/macbook-air-m3.jpg",
                CreatedAt = now,
                UpdatedAt = now,
                Variants = new List<ProductVariant>
                {
                    new() { Sku = "MBA-M3-MID-256", Name = "Midnight 8GB / 256GB", Color = "Midnight", Storage = "256GB", Price = 1099m, Stock = 30, ImageUrl = null, IsActive = true },
                    new() { Sku = "MBA-M3-SLV-512", Name = "Silver 16GB / 512GB",  Color = "Silver",   Storage = "512GB", Price = 1499m, Stock = 18, ImageUrl = null, IsActive = true },
                }
            },
            new()
            {
                Name = "Sony WH-1000XM5",
                Description = "Industry-leading noise cancelling over-ear headphones.",
                Category = "audio",
                ImageUrl = "https://example.com/img/sony-xm5.jpg",
                CreatedAt = now,
                UpdatedAt = now,
                Variants = new List<ProductVariant>
                {
                    new() { Sku = "WH5-BLK", Name = "Black",  Color = "Black",  Storage = null, Price = 399m, Stock = 50, ImageUrl = null, IsActive = true },
                    new() { Sku = "WH5-SLV", Name = "Silver", Color = "Silver", Storage = null, Price = 399m, Stock = 22, ImageUrl = null, IsActive = true },
                }
            },
            new()
            {
                Name = "Logitech MX Master 3S",
                Description = "Wireless ergonomic productivity mouse.",
                Category = "accessories",
                ImageUrl = "https://example.com/img/mx-master-3s.jpg",
                CreatedAt = now,
                UpdatedAt = now,
                Variants = new List<ProductVariant>
                {
                    new() { Sku = "MX3S-GRY", Name = "Graphite", Color = "Graphite", Storage = null, Price = 99m, Stock = 80, ImageUrl = null, IsActive = true },
                    new() { Sku = "MX3S-PAL", Name = "Pale Gray", Color = "Pale Gray", Storage = null, Price = 99m, Stock = 40, ImageUrl = null, IsActive = true },
                }
            },
            new()
            {
                Name = "Apple Watch Series 9",
                Description = "S9 chip, brighter Always-On display, Double Tap.",
                Category = "wearables",
                ImageUrl = "https://example.com/img/apple-watch-s9.jpg",
                CreatedAt = now,
                UpdatedAt = now,
                Variants = new List<ProductVariant>
                {
                    new() { Sku = "AW9-41-MID-ALU", Name = "41mm Midnight Aluminum / Sport Band", Color = "Midnight", Storage = "41mm", Price = 399m, Stock = 35, ImageUrl = null, IsActive = true },
                    new() { Sku = "AW9-45-PNK-ALU", Name = "45mm Pink Aluminum / Sport Band",     Color = "Pink",    Storage = "45mm", Price = 429m, Stock = 28, ImageUrl = null, IsActive = true },
                }
            },
        };

        await products.InsertManyAsync(sample, cancellationToken: ct);
        logger.LogInformation("Seeded {Count} sample products.", sample.Count);
    }
}
