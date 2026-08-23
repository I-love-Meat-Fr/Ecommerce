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

    public async Task<bool> UpdateAsync(string id, Product product)
    {
        product.UpdatedAt = DateTime.UtcNow;
        var result = await _products.ReplaceOneAsync(p => p.Id == id, product);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _products.DeleteOneAsync(p => p.Id == id);
        return result.DeletedCount > 0;
    }
}
