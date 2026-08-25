using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

public class OrderService
{
    private readonly IMongoCollection<Order> _orders;
    private readonly OrderStatusLogService _logService;

    public OrderService(MongoDbContext context, OrderStatusLogService logService)
    {
        _orders = context.Orders;
        _logService = logService;
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
