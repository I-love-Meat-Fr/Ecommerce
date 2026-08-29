using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

public class ProductService
{
    private readonly IMongoCollection<Product> _products;

    public ProductService(MongoDbContext context)
    {
        _products = context.Products;
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
            Builders<Product>.Filter.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(query, "i")),
            Builders<Product>.Filter.ElemMatch(
                p => p.Variants,
                Builders<ProductVariant>.Filter.Or(
                    Builders<ProductVariant>.Filter.Regex(v => v.Sku, new MongoDB.Bson.BsonRegularExpression(query, "i")),
                    Builders<ProductVariant>.Filter.Regex(v => v.Name, new MongoDB.Bson.BsonRegularExpression(query, "i"))
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
}
