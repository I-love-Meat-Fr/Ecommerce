using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

public class CategoryService
{
    private readonly IMongoCollection<Category> _categories;

    public CategoryService(MongoDbContext context)
    {
        _categories = context.Categories;
    }

    public async Task<List<Category>> GetAllAsync()
    {
        return await _categories.Find(_ => true)
            .SortBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(string id)
    {
        return await _categories.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Category?> GetBySlugAsync(string slug)
    {
        return await _categories.Find(c => c.Slug == slug).FirstOrDefaultAsync();
    }

    public async Task<Category> CreateAsync(Category category)
    {
        category.Slug = GenerateSlug(category.Name);
        category.CreatedAt = DateTime.UtcNow;
        await _categories.InsertOneAsync(category);
        return category;
    }

    public async Task<bool> UpdateAsync(string id, string name, string? description)
    {
        var slug = GenerateSlug(name);
        var update = Builders<Category>.Update
            .Set(c => c.Name, name)
            .Set(c => c.Slug, slug);
        if (description != null)
            update = update.Set(c => c.Description, description);

        var result = await _categories.UpdateOneAsync(c => c.Id == id, update);
        return result.MatchedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _categories.DeleteOneAsync(c => c.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<List<string>> GetDistinctNamesAsync()
    {
        return await _categories.Distinct(c => c.Name, _ => true).ToListAsync();
    }

    private static string GenerateSlug(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return string.Empty;
        var slug = name.Trim().ToLowerInvariant();
        slug = slug.Replace("đ", "d");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");
        slug = slug.Trim('-');
        return slug;
    }
}
