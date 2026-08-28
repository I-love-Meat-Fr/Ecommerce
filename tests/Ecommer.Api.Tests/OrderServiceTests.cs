using FluentAssertions;
using MongoDB.Driver;
using Xunit;
using Ecommer.Api.Data;
using Ecommer.Api.Models;
using Ecommer.Api.Services;

namespace Ecommer.Api.Tests;

/// <summary>
/// End-to-end tests for OrderService.CreateOrderWithLockAsync — verifies that
/// stock is correctly locked, that failure of any item rolls back the rest, and
/// that cancel/deliver release/commit the lock as expected.
/// </summary>
public class OrderServiceTests : MongoIntegrationTestBase
{
    private (OrderService svc, InventoryService inv, MongoDbContext ctx) CreateServices()
    {
        var connStr = Environment.GetEnvironmentVariable("TEST_MONGO_CONNECTION_STRING")
            ?? "mongodb+srv://nguyenquocanh170205_db_user:FJGAwn7TMMPkcslN@cluster0.2pu37z6.mongodb.net/?retryWrites=true&w=majority";
        var ctx = new MongoDbContext(connStr, DatabaseName);
        var inv = new InventoryService(ctx, NullLogger<InventoryService>());
        var log = new OrderStatusLogService(ctx);
        var svc = new OrderService(ctx, log, inv, NullLogger<OrderService>());
        return (svc, inv, ctx);
    }

    private async Task<Product> SeedProductAsync(string sku, int stock)
    {
        var products = Database.GetCollection<Product>("products");
        var product = new Product
        {
            Name = "P",
            Category = "test",
            Variants = new List<ProductVariant>
            {
                new() { Sku = sku, Name = "V", Price = 50m, Stock = stock, LockedQuantity = 0, IsActive = true }
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

    [Fact]
    public async Task CreateOrder_LocksStockOnEveryItem()
    {
        var (svc, _, _) = CreateServices();
        var p1 = await SeedProductAsync("SKU-A", 10);
        var p2 = await SeedProductAsync("SKU-B", 5);

        var order = new Order
        {
            UserId = "user-1",
            Items = new List<OrderItem>
            {
                new() { ProductId = p1.Id!, Sku = "SKU-A", Quantity = 2, UnitPrice = 50m },
                new() { ProductId = p2.Id!, Sku = "SKU-B", Quantity = 1, UnitPrice = 50m },
            },
            TotalAmount = 150m,
            Status = "Pending",
        };

        var created = await svc.CreateOrderWithLockAsync(order);

        created.Id.Should().NotBeNullOrEmpty();
        (await GetVariantAsync(p1.Id!, "SKU-A")).LockedQuantity.Should().Be(2);
        (await GetVariantAsync(p2.Id!, "SKU-B")).LockedQuantity.Should().Be(1);
    }

    [Fact]
    public async Task CreateOrder_InsufficientStock_RollsBackAlreadyLockedItems()
    {
        var (svc, _, _) = CreateServices();
        var p1 = await SeedProductAsync("SKU-A", 10);
        var p2 = await SeedProductAsync("SKU-B", 2); // only 2 in stock

        var order = new Order
        {
            UserId = "user-1",
            Items = new List<OrderItem>
            {
                new() { ProductId = p1.Id!, Sku = "SKU-A", Quantity = 3, UnitPrice = 50m }, // OK
                new() { ProductId = p2.Id!, Sku = "SKU-B", Quantity = 5, UnitPrice = 50m }, // FAIL
            },
            TotalAmount = 150m,
            Status = "Pending",
        };

        var act = async () => await svc.CreateOrderWithLockAsync(order);
        await act.Should().ThrowAsync<InvalidOperationException>();

        // The first item was locked then rolled back — both should be back to 0.
        (await GetVariantAsync(p1.Id!, "SKU-A")).LockedQuantity.Should().Be(0);
        (await GetVariantAsync(p2.Id!, "SKU-B")).LockedQuantity.Should().Be(0);
    }

    [Fact]
    public async Task CreateOrder_DuplicateItems_DoesNotDoubleLock()
    {
        // Two items with the same SKU are fine — each lock is independent.
        var (svc, _, _) = CreateServices();
        var p = await SeedProductAsync("SKU-A", 10);

        var order = new Order
        {
            UserId = "u",
            Items = new List<OrderItem>
            {
                new() { ProductId = p.Id!, Sku = "SKU-A", Quantity = 2, UnitPrice = 50m },
                new() { ProductId = p.Id!, Sku = "SKU-A", Quantity = 3, UnitPrice = 50m },
            },
            TotalAmount = 250m,
            Status = "Pending",
        };

        await svc.CreateOrderWithLockAsync(order);

        var v = await GetVariantAsync(p.Id!, "SKU-A");
        v.LockedQuantity.Should().Be(5); // 2 + 3
    }

    [Fact]
    public async Task FullLifecycle_Delivered_CommitsStock()
    {
        var (svc, inv, _) = CreateServices();
        var p = await SeedProductAsync("SKU-A", 10);

        var order = new Order
        {
            UserId = "u",
            Items = new List<OrderItem> { new() { ProductId = p.Id!, Sku = "SKU-A", Quantity = 3, UnitPrice = 50m } },
            TotalAmount = 150m,
            Status = "Pending",
        };
        var created = await svc.CreateOrderWithLockAsync(order);

        // Pending: stock=10, locked=3, available=7
        var pending = await GetVariantAsync(p.Id!, "SKU-A");
        pending.Stock.Should().Be(10);
        pending.LockedQuantity.Should().Be(3);

        // Admin marks Delivered → stock commits
        await svc.UpdateStatusAsync(created.Id!, "Delivered", "Pending", "admin");
        foreach (var item in created.Items)
            await inv.CommitStockAsync(item.ProductId, item.Sku!, item.Quantity);

        var v = await GetVariantAsync(p.Id!, "SKU-A");
        v.Stock.Should().Be(7);             // 10 - 3
        v.LockedQuantity.Should().Be(0);    // 3 - 3
    }

    [Fact]
    public async Task FullLifecycle_Cancelled_UnlocksAndRestoresStock()
    {
        var (svc, inv, _) = CreateServices();
        var p = await SeedProductAsync("SKU-A", 10);

        var order = new Order
        {
            UserId = "u",
            Items = new List<OrderItem> { new() { ProductId = p.Id!, Sku = "SKU-A", Quantity = 3, UnitPrice = 50m } },
            TotalAmount = 150m,
            Status = "Pending",
        };
        var created = await svc.CreateOrderWithLockAsync(order);

        // Admin cancels → unlock restores stock
        await svc.UpdateStatusAsync(created.Id!, "Cancelled", "Pending", "admin");
        foreach (var item in created.Items)
            await inv.UnlockStockAsync(item.ProductId, item.Sku!, item.Quantity);

        var v = await GetVariantAsync(p.Id!, "SKU-A");
        v.Stock.Should().Be(13);            // 10 + 3 restored
        v.LockedQuantity.Should().Be(0);    // 3 - 3
    }

    [Fact]
    public async Task OversellPrevention_SecondOrderRejectedWhenFirstDrainsStock()
    {
        var (svc, _, _) = CreateServices();
        var p = await SeedProductAsync("SKU-A", 5); // 5 in stock

        var order1 = new Order
        {
            UserId = "u1",
            Items = new List<OrderItem> { new() { ProductId = p.Id!, Sku = "SKU-A", Quantity = 5, UnitPrice = 50m } },
            TotalAmount = 250m,
            Status = "Pending",
        };
        await svc.CreateOrderWithLockAsync(order1);

        // Stock now: 5 in stock, 5 locked, 0 available
        var order2 = new Order
        {
            UserId = "u2",
            Items = new List<OrderItem> { new() { ProductId = p.Id!, Sku = "SKU-A", Quantity = 1, UnitPrice = 50m } },
            TotalAmount = 50m,
            Status = "Pending",
        };
        var act = async () => await svc.CreateOrderWithLockAsync(order2);
        await act.Should().ThrowAsync<InvalidOperationException>();

        var v = await GetVariantAsync(p.Id!, "SKU-A");
        v.Stock.Should().Be(5);
        v.LockedQuantity.Should().Be(5); // unchanged
    }
}
