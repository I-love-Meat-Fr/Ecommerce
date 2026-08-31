using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.DTOs;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

public class ProductService
{
    private readonly IMongoCollection<Product> _products;
    private readonly CategoryService _categoryService;

    public ProductService(MongoDbContext context, CategoryService categoryService)
    {
        _products = context.Products;
        _categoryService = categoryService;
    }

    public async Task<List<Product>> GetAllAsync()
    {
        return await _products.Find(_ => true).ToListAsync();
    }

    public async Task<Product?> GetByIdAsync(string id)
    {
        return await _products.Find(p => p.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Product>> GetByCategoryAsync(string category)
    {
        return await _products.Find(p => p.Category == category).ToListAsync();
    }

    // Search by product name (case-insensitive contains) or by any variant SKU/name.
    // Single pass, capped at 500 docs to keep admin queries snappy.
    public async Task<List<Product>> SearchAsync(string query)
    {
        var filter = Builders<Product>.Filter.Or(
            Builders<Product>.Filter.Regex(p => p.Name, new BsonRegularExpression(query, "i")),
            Builders<Product>.Filter.ElemMatch(
                p => p.Variants,
                Builders<ProductVariant>.Filter.Or(
                    Builders<ProductVariant>.Filter.Regex(v => v.Sku, new BsonRegularExpression(query, "i")),
                    Builders<ProductVariant>.Filter.Regex(v => v.Name, new BsonRegularExpression(query, "i"))
                )
            )
        );
        return await _products.Find(filter).Limit(500).ToListAsync();
    }

    public async Task<Product> CreateAsync(Product product)
    {
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        await _products.InsertOneAsync(product);
        return product;
    }

    public async Task<bool> UpdateAsync(string id, ProductUpdateDto dto)
    {
        var updates = new List<UpdateDefinition<Product>>();

        if (dto.Name != null) updates.Add(Builders<Product>.Update.Set(p => p.Name, dto.Name));
        if (dto.Description != null) updates.Add(Builders<Product>.Update.Set(p => p.Description, dto.Description));
        if (dto.Category != null) updates.Add(Builders<Product>.Update.Set(p => p.Category, dto.Category));
        if (dto.ImageUrl != null) updates.Add(Builders<Product>.Update.Set(p => p.ImageUrl, dto.ImageUrl));
        if (dto.Variants != null) updates.Add(Builders<Product>.Update.Set(p => p.Variants, dto.Variants));

        updates.Add(Builders<Product>.Update.Set(p => p.UpdatedAt, DateTime.UtcNow));

        var update = Builders<Product>.Update.Combine(updates);
        var result = await _products.UpdateOneAsync(p => p.Id == id, update);
        return result.MatchedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _products.DeleteOneAsync(p => p.Id == id);
        return result.DeletedCount > 0;
    }

    /// <summary>
    /// Server-side paginated listing used by <c>GET /api/products</c>.
    /// </summary>
    /// <remarks>
    /// Filters compose with AND. The category slug is expanded to its leaf
    /// descendants before being applied (see
    /// <see cref="CategoryService.GetDescendantSlugsAsync"/>). Price and care
    /// level ranges are evaluated against the first matching active variant;
    /// MongoDB's <c>$elemMatch</c> handles this without server-side joins.
    /// </remarks>
    public async Task<(List<Product> Items, long Total)> GetFilteredAsync(
        ProductQueryParams p, System.Threading.CancellationToken ct = default)
    {
        // Defensive bounds — prevents runaway pagination if a client passes
        // page=0, negative numbers, or pageSize=10_000.
        if (p.Page < 1) p.Page = 1;
        if (p.PageSize < 1) p.PageSize = 12;
        if (p.PageSize > 100) p.PageSize = 100;

        var fb = Builders<Product>.Filter;
        var filters = new List<FilterDefinition<Product>>();

        // Category: expand slug → leaf descendants, then IN-clause match.
        // This is what makes a parent filter feel "natural" in the storefront
        // (selecting "Monstera" should include every Monstera variety).
        if (!string.IsNullOrEmpty(p.Category))
        {
            var leafSlugs = await _categoryService.GetDescendantSlugsAsync(p.Category, ct);
            if (leafSlugs.Count == 1)
            {
                // Cheap equality path — uses the (category, name) index.
                var onlySlug = leafSlugs[0];
                filters.Add(fb.Eq(x => x.Category, onlySlug));
            }
            else
            {
                filters.Add(fb.In(x => x.Category, leafSlugs));
            }
        }

        // Free-text search across name + variant fields.
        if (!string.IsNullOrEmpty(p.Search))
        {
            filters.Add(fb.Or(
                fb.Regex(x => x.Name, new BsonRegularExpression(p.Search, "i")),
                fb.ElemMatch(
                    x => x.Variants,
                    Builders<ProductVariant>.Filter.Or(
                        Builders<ProductVariant>.Filter.Regex(v => v.Sku, new BsonRegularExpression(p.Search, "i")),
                        Builders<ProductVariant>.Filter.Regex(v => v.Name, new BsonRegularExpression(p.Search, "i"))
                    )
                )
            ));
        }

        // Price range — applied to any active variant. $elemMatch matches the
        // first variant that satisfies the predicate; the parent product is
        // included if at least one variant qualifies.
        if (p.MinPrice.HasValue || p.MaxPrice.HasValue)
        {
            var variantFilter = Builders<ProductVariant>.Filter.Eq(v => v.IsActive, true);
            if (p.MinPrice.HasValue)
                variantFilter &= Builders<ProductVariant>.Filter.Gte(v => v.Price, p.MinPrice.Value);
            if (p.MaxPrice.HasValue)
                variantFilter &= Builders<ProductVariant>.Filter.Lte(v => v.Price, p.MaxPrice.Value);
            filters.Add(fb.ElemMatch(x => x.Variants, variantFilter));
        }

        // Exact plant size (1–5).
        if (p.Size.HasValue)
        {
            filters.Add(fb.ElemMatch(
                x => x.Variants,
                Builders<ProductVariant>.Filter.Eq(v => v.PlantAttributes!.Size, p.Size.Value)
            ));
        }

        // Care level range. We use Untyped field access here because
        // PlantAttributes.CareLevel is nullable — if the parent predicate
        // doesn't include "PlantAttributes exists" we still want null
        // variants excluded from the range match.
        if (p.MinCareLevel.HasValue || p.MaxCareLevel.HasValue)
        {
            var clFilter = Builders<ProductVariant>.Filter.Empty;
            if (p.MinCareLevel.HasValue)
                clFilter &= Builders<ProductVariant>.Filter.Gte(v => v.PlantAttributes!.CareLevel, p.MinCareLevel.Value);
            if (p.MaxCareLevel.HasValue)
                clFilter &= Builders<ProductVariant>.Filter.Lte(v => v.PlantAttributes!.CareLevel, p.MaxCareLevel.Value);
            filters.Add(fb.ElemMatch(x => x.Variants, clFilter));
        }

        var combined = filters.Count > 0 ? fb.And(filters) : fb.Empty;

        var total = await _products.CountDocumentsAsync(combined, cancellationToken: ct);

        // Sort. "popular" is intentionally a tie-breaker on CreatedAt so
        // brand-new products with zero sales still surface in a deterministic
        // order instead of being scattered by insertion order.
        //
        // Every sort MUST end with `_id` (ascending) as a final tie-breaker.
        // Without it, when multiple products share identical secondary-sort
        // values (e.g. all 8 newly-seeded botanical products have
        // totalSoldCount=0 and identical CreatedAt timestamps), MongoDB does
        // NOT guarantee a stable order across queries — skip+limit pagination
        // can then return the same document on consecutive pages or skip it
        // entirely.
        SortDefinition<Product> sort = p.SortBy switch
        {
            "newest"     => Builders<Product>.Sort
                .Descending(x => x.CreatedAt)
                .Ascending(x => x.Id),
            "price-asc"  => Builders<Product>.Sort
                .Ascending("variants.price")
                .Ascending(x => x.Id),
            "price-desc" => Builders<Product>.Sort
                .Descending("variants.price")
                .Ascending(x => x.Id),
            "name-asc"   => Builders<Product>.Sort
                .Ascending(x => x.Name)
                .Ascending(x => x.Id),
            "popular" or _ => Builders<Product>.Sort
                .Descending(x => x.TotalSoldCount)
                .Descending(x => x.CreatedAt)
                .Ascending(x => x.Id),
        };

        var skip = (p.Page - 1) * p.PageSize;
        if (skip < 0) skip = 0;

        var items = await _products
            .Find(combined)
            .Sort(sort)
            .Skip(skip)
            .Limit(p.PageSize)
            .ToListAsync(ct);

        return (items, total);
    }
}
