using MongoDB.Bson;
using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

/// <summary>
/// Cung cấp các thao tác atomic trên tồn kho variant theo mô hình Soft Booking.
/// Ba trạng thái kho:
///
///   stock_quantity     — tổng số hàng vật lý trong kho
///   locked_quantity   — hàng đang bị tạm giữ trong giỏ hàng (Pending/Processing/Shipped)
///   available         — stock_quantity − locked_quantity  (số hiển thị trên website)
///
/// Vòng đời một đơn hàng:
///
///   Place order  →  TryLockStock  (tăng locked_quantity)
///   Admin cancel →  UnlockStock   (giảm locked_quantity, hoàn kho)
///   Admin deliver / COD confirm → CommitStock  (giảm cả stock và locked_quantity)
///
/// Tất cả thao tác đều dùng MongoDB atomic update với array-filter để đảm bảo
/// không oversell kể cả khi có race condition.
/// </summary>
public class InventoryService
{
    private readonly IMongoCollection<Product> _products;
    private readonly ILogger<InventoryService> _logger;

    public InventoryService(MongoDbContext context, ILogger<InventoryService> logger)
    {
        _products = context.Products;
        _logger = logger;
    }

    /// <summary>
    /// Tạm giữ <paramref name="qty"/> sản phẩm variant <paramref name="sku"/>.
    /// Atomic: chỉ tăng lockedQuantity khi (stock − lockedQuantity) ≥ qty.
    /// Trả về true nếu lock thành công.
    /// </summary>
    public async Task<bool> TryLockStockAsync(string productId, string sku, int qty)
    {
        if (qty <= 0) return false;

        // CAS-style retry loop. We re-read the variant on each iteration so
        // that concurrent locks don't all see the same `lockedQuantity` and
        // then all but one fail. Bounded retries keep this from spinning
        // forever under heavy contention.
        const int maxAttempts = 5;
        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            var current = await _products.Find(p => p.Id == productId).FirstOrDefaultAsync();
            if (current == null) return false;
            var v = current.Variants.FirstOrDefault(x => x.Sku == sku);
            if (v == null) return false;

            if (v.Stock - v.LockedQuantity < qty)
            {
                _logger.LogWarning(
                    "Failed to lock {Qty} units of SKU {Sku} on product {ProductId} — insufficient available stock",
                    qty, sku, productId);
                return false;
            }

            var arrayFilters = new List<ArrayFilterDefinition>
            {
                new BsonDocumentArrayFilterDefinition<ProductVariant>(
                    new BsonDocument
                    {
                        { "v.sku", sku },
                        { "v.lockedQuantity", v.LockedQuantity },
                        { "v.stock", new BsonDocument("$gte", v.LockedQuantity + qty) }
                    }
                )
            };

            var update = Builders<Product>.Update
                .Inc("variants.$[v].lockedQuantity", qty);

            var result = await _products.UpdateOneAsync(
                p => p.Id == productId,
                update,
                new UpdateOptions { ArrayFilters = arrayFilters });

            if (result.ModifiedCount > 0)
            {
                _logger.LogInformation(
                    "Locked {Qty} units of SKU {Sku} on product {ProductId} on attempt {Attempt}",
                    qty, sku, productId, attempt + 1);
                return true;
            }
            // CAS failed — another writer changed lockedQuantity. Retry.
        }

        _logger.LogWarning(
            "Failed to lock {Qty} units of SKU {Sku} on product {ProductId} after {Max} attempts",
            qty, sku, productId, maxAttempts);
        return false;
    }

    /// <summary>
    /// Hoàn kho: giảm lockedQuantity và tăng stock (khôi phục hàng sau khi hủy đơn).
    /// Chỉ gọi khi đơn chuyển sang Cancelled.
    /// </summary>
    public async Task<bool> UnlockStockAsync(string productId, string sku, int qty)
    {
        if (qty <= 0) return false;

        var arrayFilters = new List<ArrayFilterDefinition>
        {
            new BsonDocumentArrayFilterDefinition<ProductVariant>(
                new BsonDocument
                {
                    { "v.sku", sku },
                    { "v.lockedQuantity", new BsonDocument("$gte", qty) }
                }
            )
        };

        var update = Builders<Product>.Update
            .Inc("variants.$[v].lockedQuantity", -qty)
            .Inc("variants.$[v].stock", qty);

        var result = await _products.UpdateOneAsync(
            p => p.Id == productId,
            update,
            new UpdateOptions { ArrayFilters = arrayFilters }
        );

        if (result.ModifiedCount > 0)
        {
            _logger.LogInformation(
                "Unlocked and restored {Qty} units of SKU {Sku} on product {ProductId}",
                qty, sku, productId);
            return true;
        }

        _logger.LogWarning(
            "Failed to unlock {Qty} units of SKU {Sku} on product {ProductId} — lockedQuantity may be insufficient",
            qty, sku, productId);
        return false;
    }

    /// <summary>
    /// Xác nhận bán: giảm stock và lockedQuantity để hoàn tất giao dịch.
    /// Chỉ gọi khi đơn chuyển sang trạng thái "hoàn tất" (Delivered hoặc xác nhận COD thành công).
    /// </summary>
    public async Task<bool> CommitStockAsync(string productId, string sku, int qty)
    {
        if (qty <= 0) return false;

        var arrayFilters = new List<ArrayFilterDefinition>
        {
            new BsonDocumentArrayFilterDefinition<ProductVariant>(
                new BsonDocument
                {
                    { "v.sku", sku },
                    { "v.lockedQuantity", new BsonDocument("$gte", qty) }
                }
            )
        };

        var update = Builders<Product>.Update
            .Inc("variants.$[v].stock", -qty)
            .Inc("variants.$[v].lockedQuantity", -qty);

        var result = await _products.UpdateOneAsync(
            p => p.Id == productId,
            update,
            new UpdateOptions { ArrayFilters = arrayFilters }
        );

        if (result.ModifiedCount > 0)
        {
            _logger.LogInformation(
                "Committed {Qty} units of SKU {Sku} on product {ProductId}",
                qty, sku, productId);
            return true;
        }

        _logger.LogWarning(
            "Failed to commit {Qty} units of SKU {Sku} on product {ProductId} — lockedQuantity mismatch",
            qty, sku, productId);
        return false;
    }

    /// <summary>
    /// Trả về số lượng khả dụng (available = stock − lockedQuantity) cho một variant.
    /// </summary>
    public async Task<int> GetAvailableStockAsync(string productId, string sku)
    {
        var product = await _products.Find(p => p.Id == productId).FirstOrDefaultAsync();
        if (product == null) return 0;
        var variant = product.Variants.FirstOrDefault(v => v.Sku == sku);
        if (variant == null) return 0;
        return Math.Max(0, variant.Stock - variant.LockedQuantity);
    }
}
