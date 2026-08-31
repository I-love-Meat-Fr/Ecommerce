using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

/// <summary>
/// Flat-list operations on the <c>categories</c> collection. Categories are
/// intentionally a single-tier taxonomy: each product references exactly one
/// category slug, and every category document is a peer of every other.
/// </summary>
public class CategoryService
{
    private readonly IMongoCollection<Category> _categories;

    public CategoryService(MongoDbContext context)
    {
        _categories = context.Categories;
    }

    /// <summary>
    /// Returns every category sorted by <c>(SortOrder ASC, Name ASC)</c>.
    /// The storefront uses this for the category filter bar; admin uses it
    /// for the CRUD table.
    /// </summary>
    public async Task<List<Category>> GetAllAsync()
    {
        return await _categories.Find(_ => true)
            .SortBy(c => c.SortOrder).ThenBy(c => c.Name)
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

    /// <summary>
    /// Returns the slugs a product-filter query should match. In the flat
    /// taxonomy model this is always a single-element list containing the
    /// incoming slug — there is no subtree expansion. Unknown slugs are
    /// returned verbatim so an unknown filter returns zero products (not a 500).
    /// </summary>
    public Task<List<string>> ResolveFilterSlugsAsync(
        string slug, System.Threading.CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(slug)) return Task.FromResult(new List<string>());
        // Return the slug regardless of whether it exists in the DB so that
        // an unknown filter naturally matches zero products rather than
        // accidentally matching everything.
        return Task.FromResult(new List<string> { slug });
    }

    private static string GenerateSlug(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return string.Empty;
        var slug = name.Trim().ToLowerInvariant();
        slug = slug.Replace("đ", "d");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"[^a-z0-9-]", "");
        slug = Regex.Replace(slug, @"-+", "-");
        slug = slug.Trim('-');
        return slug;
    }
}