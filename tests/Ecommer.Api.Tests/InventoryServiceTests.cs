using FluentAssertions;
using MongoDB.Driver;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;
using Ecommer.Api.Data;
using Ecommer.Api.Models;
using Ecommer.Api.Services;

namespace Ecommer.Api.Tests;

/// <summary>
/// Verifies the atomic stock operations in InventoryService. Each test seeds a
/// fresh product document so we can assert exact stock / lockedQuantity values.
/// </summary>
public class InventoryServiceTests : MongoIntegrationTestBase
{
    private InventoryService CreateService()
    {
        // MongoDbContext(string, string) constructor — no IConfiguration needed.
        var connStr = Environment.GetEnvironmentVariable("TEST_MONGO_CONNECTION_STRING")
            ?? "mongodb+srv://nguyenquocanh170205_db_user:FJGAwn7TMMPkcslN@cluster0.2pu37z6.mongodb.net/?retryWrites=true&w=majority";
        var ctx = new MongoDbContext(connStr, DatabaseName);
        return new InventoryService(ctx, NullLogger<InventoryService>());
    }

    private async Task<Product> SeedProductAsync(string sku = "TEST-SKU-1", int stock = 10, int locked = 0)
    {
        var products = Database.GetCollection<Product>("products");
        var product = new Product
        {
            Name = "Test Product",
            Category = "test",
            Variants = new List<ProductVariant>
            {
                new() { Sku = sku, Name = "Variant 1", Price = 100m, Stock = stock, LockedQuantity = locked, IsActive = true }
            }
        };
        await products.InsertOneAsync(product);
        return product;
    }

    private async Task<ProductVariant> GetVariantAsync(string productId, string sku)
    {
        var product = await Database.GetCollection<Product>("products")
            .Find(p => p.Id == productId)
            .FirstAsync();
        return product.Variants.First(v => v.Sku == sku);
    }

    // ---------- TryLockStockAsync ----------

    [Fact]
    public async Task TryLockStock_HappyPath_IncreasesLockedQuantity()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 10, locked: 0);

        var ok = await svc.TryLockStockAsync(product.Id!, "TEST-SKU-1", 3);

        ok.Should().BeTrue();
        var v = await GetVariantAsync(product.Id!, "TEST-SKU-1");
        v.Stock.Should().Be(10);                 // stock unchanged
        v.LockedQuantity.Should().Be(3);         // lockedQuantity increased
    }

    [Fact]
    public async Task TryLockStock_ExactAvailableBoundary_Succeeds()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 5, locked: 2); // available = 3

        var ok = await svc.TryLockStockAsync(product.Id!, "TEST-SKU-1", 3);

        ok.Should().BeTrue();
        var v = await GetVariantAsync(product.Id!, "TEST-SKU-1");
        v.LockedQuantity.Should().Be(5);
    }

    [Fact]
    public async Task TryLockStock_InsufficientStock_Fails()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 5, locked: 2); // available = 3

        var ok = await svc.TryLockStockAsync(product.Id!, "TEST-SKU-1", 4);

        ok.Should().BeFalse();
        var v = await GetVariantAsync(product.Id!, "TEST-SKU-1");
        v.Stock.Should().Be(5);                  // unchanged
        v.LockedQuantity.Should().Be(2);         // unchanged
    }

    [Fact]
    public async Task TryLockStock_WrongSku_Fails()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 10);

        var ok = await svc.TryLockStockAsync(product.Id!, "DOES-NOT-EXIST", 1);

        ok.Should().BeFalse();
        var v = await GetVariantAsync(product.Id!, "TEST-SKU-1");
        v.LockedQuantity.Should().Be(0);
    }

    [Fact]
    public async Task TryLockStock_ZeroOrNegative_ReturnsFalse()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 10);

        (await svc.TryLockStockAsync(product.Id!, "TEST-SKU-1", 0)).Should().BeFalse();
        (await svc.TryLockStockAsync(product.Id!, "TEST-SKU-1", -1)).Should().BeFalse();
    }

    // ---------- UnlockStockAsync (Cancelled order) ----------

    [Fact]
    public async Task UnlockStock_RestoresBothStockAndLocked()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 10, locked: 4);

        var ok = await svc.UnlockStockAsync(product.Id!, "TEST-SKU-1", 4);

        ok.Should().BeTrue();
        var v = await GetVariantAsync(product.Id!, "TEST-SKU-1");
        v.Stock.Should().Be(14);                 // 10 + 4 restored
        v.LockedQuantity.Should().Be(0);         // 4 - 4
    }

    [Fact]
    public async Task UnlockStock_LockedInsufficient_Fails()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 10, locked: 1);

        var ok = await svc.UnlockStockAsync(product.Id!, "TEST-SKU-1", 2);

        ok.Should().BeFalse();
        var v = await GetVariantAsync(product.Id!, "TEST-SKU-1");
        v.Stock.Should().Be(10);                 // unchanged
        v.LockedQuantity.Should().Be(1);         // unchanged
    }

    // ---------- CommitStockAsync (Delivered order) ----------

    [Fact]
    public async Task CommitStock_DecrementsBothStockAndLocked()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 10, locked: 4);

        var ok = await svc.CommitStockAsync(product.Id!, "TEST-SKU-1", 4);

        ok.Should().BeTrue();
        var v = await GetVariantAsync(product.Id!, "TEST-SKU-1");
        v.Stock.Should().Be(6);                  // 10 - 4
        v.LockedQuantity.Should().Be(0);         // 4 - 4
    }

    [Fact]
    public async Task CommitStock_LockedInsufficient_Fails()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 10, locked: 1);

        var ok = await svc.CommitStockAsync(product.Id!, "TEST-SKU-1", 4);

        ok.Should().BeFalse();
        var v = await GetVariantAsync(product.Id!, "TEST-SKU-1");
        v.Stock.Should().Be(10);
        v.LockedQuantity.Should().Be(1);
    }

    // ---------- GetAvailableStockAsync ----------

    [Fact]
    public async Task GetAvailableStock_ReturnsStockMinusLocked()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 10, locked: 3);

        var available = await svc.GetAvailableStockAsync(product.Id!, "TEST-SKU-1");

        available.Should().Be(7);
    }

    [Fact]
    public async Task GetAvailableStock_NeverNegative()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 5, locked: 10); // invalid state

        var available = await svc.GetAvailableStockAsync(product.Id!, "TEST-SKU-1");

        available.Should().Be(0);
    }

    // ---------- Concurrency ----------

    [Fact]
    public async Task TryLockStock_ConcurrentRequests_NoOversell()
    {
        var svc = CreateService();
        var product = await SeedProductAsync(stock: 5, locked: 0); // 5 available

        // Fire 10 concurrent locks of qty=1 — only 5 should succeed.
        var tasks = Enumerable.Range(0, 10)
            .Select(_ => svc.TryLockStockAsync(product.Id!, "TEST-SKU-1", 1))
            .ToArray();
        var results = await Task.WhenAll(tasks);

        results.Count(r => r).Should().Be(5);
        var v = await GetVariantAsync(product.Id!, "TEST-SKU-1");
        v.LockedQuantity.Should().Be(5);
    }
}
