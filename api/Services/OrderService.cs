using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

public class OrderService
{
    private readonly IMongoCollection<Order> _orders;
    private readonly OrderStatusLogService _logService;
    private readonly InventoryService _inventoryService;
    private readonly ILogger<OrderService> _logger;

    public OrderService(
        MongoDbContext context,
        OrderStatusLogService logService,
        InventoryService inventoryService,
        ILogger<OrderService> logger)
    {
        _orders = context.Orders;
        _logService = logService;
        _inventoryService = inventoryService;
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
    /// Tạo đơn hàng kèm Soft Booking: lock tồn kho trước, insert order sau.
    /// Nếu bất kỳ variant nào lock thất bại → rollback toàn bộ lock đã đặt.
    /// </summary>
    public async Task<Order> CreateOrderWithLockAsync(Order order)
    {
        var lockedItems = new List<(string productId, string sku, int qty)>();

        try
        {
            foreach (var item in order.Items)
            {
                var productId = item.ProductId;
                var sku = item.Sku ?? item.VariantId;

                var locked = await _inventoryService.TryLockStockAsync(productId, sku, item.Quantity);
                if (!locked)
                {
                    throw new InvalidOperationException(
                        $"Failed to lock stock for variant '{sku}' on product '{productId}'");
                }
                lockedItems.Add((productId, sku, item.Quantity));
            }

            order.CreatedAt = DateTime.UtcNow;
            await _orders.InsertOneAsync(order);

            _logger.LogInformation(
                "Order {OrderId} created with {ItemCount} locked items",
                order.Id, order.Items.Count);
            return order;
        }
        catch
        {
            // Rollback: unlock everything we managed to lock
            foreach (var (productId, sku, qty) in lockedItems)
            {
                try
                {
                    await _inventoryService.UnlockStockAsync(productId, sku, qty);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Failed to rollback lock for SKU {Sku} on product {ProductId} during error handling",
                        sku, productId);
                }
            }
            throw;
        }
    }

    public async Task<bool> UpdateStatusAsync(string id, string status, string? fromStatus, string changedBy, string? note = null)
    {
        var update = Builders<Order>.Update.Set(o => o.Status, status);
        var result = await _orders.UpdateOneAsync(o => o.Id == id, update);
        if (result.ModifiedCount > 0)
        {
            await _logService.CreateLogAsync(id, fromStatus, status, changedBy, note);
        }
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _orders.DeleteOneAsync(o => o.Id == id);
        return result.DeletedCount > 0;
    }
}
