using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

public class OrderService
{
    private readonly IMongoCollection<Order> _orders;
    /// <summary>
    /// Direct collection handle — we update <see cref="Product.TotalSoldCount"/>
    /// directly to avoid depending on <see cref="ProductService"/>, which would
    /// create a circular DI scope (ProductService currently depends on
    /// CategoryService; OrderService would depend on ProductService; if
    /// ProductService ever grows to depend on OrderService this would deadlock
    /// under ASP.NET Core's scoped factory).
    /// </summary>
    private readonly IMongoCollection<Product> _products;
    private readonly OrderStatusLogService _logService;
    private readonly ILogger<OrderService> _logger;

    public OrderService(
        MongoDbContext context,
        OrderStatusLogService logService,
        ILogger<OrderService> logger)
    {
        _orders = context.Orders;
        _products = context.Products;
        _logService = logService;
        _logger = logger;
    }

    public async Task<List<Order>> GetAllAsync()
    {
        return await _orders.Find(_ => true)
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Order?> GetByIdAsync(string id)
    {
        return await _orders.Find(o => o.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Order>> GetByUserIdAsync(string userId)
    {
        return await _orders.Find(o => o.UserId == userId).ToListAsync();
    }

    public async Task<Order> CreateAsync(Order order)
    {
        order.CreatedAt = DateTime.UtcNow;
        await _orders.InsertOneAsync(order);
        return order;
    }

    /// <summary>
    /// Updates an order's status and (when transitioning into
    /// <c>"Delivered"</c>) bumps the per-product <c>TotalSoldCount</c>.
    /// </summary>
    /// <remarks>
    /// Idempotency contract: callers may invoke this multiple times with the
    /// same target status. We only increment <c>TotalSoldCount</c> on the
    /// transition <c>(anything != Delivered) → Delivered</c>. A no-op call
    /// (status already Delivered) leaves the counter untouched.
    /// </remarks>
    public async Task<bool> UpdateStatusAsync(string id, string status, string? fromStatus, string changedBy, string? note = null)
    {
        // Read the current state first so we can compare without a fragile
        // FindAndModify pipeline. Two distinct writes are fine: the status
        // log captures the transition regardless of whether the counter is
        // incremented.
        var previous = await _orders.Find(o => o.Id == id).FirstOrDefaultAsync();
        var update = Builders<Order>.Update.Set(o => o.Status, status);
        var result = await _orders.UpdateOneAsync(o => o.Id == id, update);

        if (result.ModifiedCount > 0)
        {
            await _logService.CreateLogAsync(id, fromStatus, status, changedBy, note);

            // Only bump the counter on a fresh transition into Delivered.
            // Guarded against:
            //   - previous == null (defensive — shouldn't happen post-update)
            //   - fromStatus == "Delivered" (replay / idempotent admin retry)
            var transitioned = previous != null
                && !string.Equals(previous.Status, "Delivered", StringComparison.OrdinalIgnoreCase)
                && string.Equals(status, "Delivered", StringComparison.OrdinalIgnoreCase);

            if (transitioned)
            {
                try
                {
                    await IncrementSoldCountAsync(id, previous!);
                }
                catch (Exception ex)
                {
                    // Don't fail the status transition if the counter fails —
                    // the log is the source of truth and the seeder can be
                    // re-run to repair drift.
                    _logger.LogError(ex, "Failed to increment TotalSoldCount for order {OrderId}.", id);
                }
            }
        }
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _orders.DeleteOneAsync(o => o.Id == id);
        return result.DeletedCount > 0;
    }

    private async Task IncrementSoldCountAsync(string orderId, Order order)
    {
        var pb = Builders<Product>.Update;
        foreach (var item in order.Items)
        {
            if (string.IsNullOrEmpty(item.ProductId) || item.Quantity <= 0) continue;
            await _products.UpdateOneAsync(
                p => p.Id == item.ProductId,
                pb.Inc(p => p.TotalSoldCount, item.Quantity));
        }
    }
}
