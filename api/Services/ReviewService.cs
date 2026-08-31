using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

/// <summary>
/// CRUD + aggregation for customer reviews. The storefront uses the
/// aggregate call to render the SKU card rating row; the list call powers
/// a future "Xem đánh giá" block on the detail page.
/// </summary>
public class ReviewService
{
    private readonly IMongoCollection<Review> _reviews;

    public ReviewService(MongoDbContext context)
    {
        _reviews = context.Reviews;
    }

    public async Task<RatingSummary> GetAggregateAsync(
        string productId, string? variantSku, CancellationToken ct = default)
    {
        var filter = Builders<Review>.Filter.Eq(r => r.ProductId, productId);
        if (variantSku != null)
        {
            // Aggregate across product-level + this-SKU reviews so a product
            // with only "any variant" reviews still shows a real number on a
            // specific SKU card.
            filter = Builders<Review>.Filter.And(
                Builders<Review>.Filter.Eq(r => r.ProductId, productId),
                Builders<Review>.Filter.Or(
                    Builders<Review>.Filter.Eq(r => r.VariantSku, variantSku),
                    Builders<Review>.Filter.Eq(r => r.VariantSku, null)));
        }

        var pipeline = await _reviews.Aggregate()
            .Match(filter)
            .Group(r => 1, g => new
            {
                Avg = g.Average(x => x.Rating),
                Count = g.Count(),
            })
            .FirstOrDefaultAsync(ct);

        if (pipeline == null) return new RatingSummary();
        return new RatingSummary
        {
            Avg = Math.Round(pipeline.Avg, 2),
            Count = (int)pipeline.Count,
        };
    }

    public async Task<List<Review>> ListByProductAsync(
        string productId, string? variantSku, int limit, CancellationToken ct = default)
    {
        var filterBuilder = Builders<Review>.Filter;
        var filter = filterBuilder.Eq(r => r.ProductId, productId);
        if (variantSku != null)
        {
            filter = filterBuilder.And(filter,
                filterBuilder.Or(
                    filterBuilder.Eq(r => r.VariantSku, variantSku),
                    filterBuilder.Eq(r => r.VariantSku, null)));
        }
        return await _reviews.Find(filter)
            .SortByDescending(r => r.CreatedAt)
            .Limit(limit)
            .ToListAsync(ct);
    }

    public async Task<Review> CreateAsync(Review review, CancellationToken ct = default)
    {
        if (review.Rating < 1 || review.Rating > 5)
            throw new ArgumentOutOfRangeException(nameof(review.Rating), "Rating must be between 1 and 5.");
        if (string.IsNullOrWhiteSpace(review.ProductId))
            throw new ArgumentException("productId is required.", nameof(review));
        if (string.IsNullOrWhiteSpace(review.UserId))
            throw new ArgumentException("userId is required.", nameof(review));

        review.CreatedAt = DateTime.UtcNow;
        await _reviews.InsertOneAsync(review, cancellationToken: ct);
        return review;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var result = await _reviews.DeleteOneAsync(r => r.Id == id, ct);
        return result.DeletedCount > 0;
    }
}
