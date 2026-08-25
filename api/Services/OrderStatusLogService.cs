using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

public class OrderStatusLogService
{
    private readonly IMongoCollection<OrderStatusLog> _logs;

    public OrderStatusLogService(MongoDbContext context)
    {
        _logs = context.OrderStatusLogs;
    }

    public async Task<OrderStatusLog> CreateLogAsync(
        string orderId,
        string? fromStatus,
        string toStatus,
        string changedBy,
        string? note = null)
    {
        var log = new OrderStatusLog
        {
            OrderId = orderId,
            FromStatus = fromStatus,
            ToStatus = toStatus,
            ChangedBy = changedBy,
            ChangedAt = DateTime.UtcNow,
            Note = note
        };

        await _logs.InsertOneAsync(log);
        return log;
    }

    public async Task<List<OrderStatusLog>> GetByOrderIdAsync(string orderId)
    {
        return await _logs
            .Find(l => l.OrderId == orderId)
            .SortBy(l => l.ChangedAt)
            .ToListAsync();
    }
}
