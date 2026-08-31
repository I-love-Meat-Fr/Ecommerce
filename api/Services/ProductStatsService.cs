using MongoDB.Bson;
using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

/// <summary>
/// Aggregates per-product stats (sold counts, review summaries) from the
/// <c>orders</c> and <c>reviews</c> collections. Used by
/// <c>ProductsController</c> to embed stats in every list/detail response so
/// the storefront never needs a second roundtrip per card.
/// </summary>
public class ProductStatsService
{
    private readonly IMongoCollection<Order> _orders;
    private readonly IMongoCollection<Review> _reviews;

    // Cancelled order statuses are excluded from the sold count. Anything
    // else (Pending, Processing, Shipped, Delivered) is treated as sold —
    // tighten this list if the team decides only delivered orders should
    // count.
    private static readonly HashSet<string> ExcludedStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "Cancelled", "Canceled",
    };

    public ProductStatsService(MongoDbContext context)
    {
        _orders = context.Orders;
        _reviews = context.Reviews;
    }

    /// <summary>
    /// Returns a map keyed by <c>productId</c>, whose value is a per-SKU sold
    /// count. Sold count = sum of <c>item.Quantity</c> for every non-cancelled
    /// order that referenced that SKU.
    /// </summary>
    public async Task<Dictionary<string, Dictionary<string, int>>> GetSoldCountsAsync(
        IEnumerable<string> productIds, CancellationToken ct = default)
    {
        var ids = productIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToList();
        if (ids.Count == 0) return new();

        // $unwind items → $match productIds + status ∉ excluded → $group by
        // (productId, sku) summing quantity.
        var pipeline = new BsonDocument[]
        {
            new("$unwind", "$items"),
            new("$match", new BsonDocument
            {
                { "items.productId", new BsonDocument("$in", new BsonArray(ids)) },
                { "status", new BsonDocument("$nin", new BsonArray(ExcludedStatuses)) },
            }),
            new("$group", new BsonDocument
            {
                { "_id", new BsonDocument
                    {
                        { "productId", "$items.productId" },
                        { "sku", new BsonDocument
                            {
                                { "$ifNull", new BsonArray { "$items.sku", "$items.variantId" } }
                            }
                        },
                    }
                },
                { "total", new BsonDocument("$sum", "$items.quantity") },
            }),
        };

        var raw = await _orders
            .Aggregate<BsonDocument>(pipeline, cancellationToken: ct)
            .ToListAsync(ct);

        var result = new Dictionary<string, Dictionary<string, int>>();
        foreach (var doc in raw)
        {
            var key = doc["_id"].AsBsonDocument;
            var productId = key.GetValue("productId", "").AsString;
            var sku = key.GetValue("sku", "").AsString;
            var total = doc.GetValue("total", 0).ToInt32();
            if (string.IsNullOrEmpty(productId) || string.IsNullOrEmpty(sku)) continue;
            if (!result.TryGetValue(productId, out var inner))
            {
                inner = new Dictionary<string, int>();
                result[productId] = inner;
            }
            inner[sku] = total;
        }
        return result;
    }

    /// <summary>
    /// Returns a per-product rating summary (avg + count). When at least one
    /// review has <c>variantSku = null</c> for a product, that review counts
    /// toward the product-level summary; reviews with a specific SKU also
    /// count. To keep the SKU card cheap, we collapse to product-level only.
    /// </summary>
    public async Task<Dictionary<string, RatingSummary>> GetRatingsAsync(
        IEnumerable<string> productIds, CancellationToken ct = default)
    {
        var ids = productIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToList();
        if (ids.Count == 0) return new();

        var pipeline = new BsonDocument[]
        {
            new("$match", new BsonDocument("productId", new BsonDocument("$in", new BsonArray(ids)))),
            new("$group", new BsonDocument
            {
                { "_id", "$productId" },
                { "avg", new BsonDocument("$avg", "$rating") },
                { "count", new BsonDocument("$sum", 1) },
            }),
        };

        var raw = await _reviews
            .Aggregate<BsonDocument>(pipeline, cancellationToken: ct)
            .ToListAsync(ct);

        var result = new Dictionary<string, RatingSummary>();
        foreach (var doc in raw)
        {
            var productId = doc["_id"].AsString;
            var avg = doc.GetValue("avg", 0.0).ToDouble();
            var count = doc.GetValue("count", 0).ToInt32();
            result[productId] = new RatingSummary { Avg = Math.Round(avg, 2), Count = count };
        }
        return result;
    }
}
