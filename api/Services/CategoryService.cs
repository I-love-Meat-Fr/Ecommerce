using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
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
    /// Loads every category and assembles the full N-level tree in memory.
    /// Sibling order: <c>SortOrder ASC, Name ASC</c>. Returned <c>Category</c>
    /// instances have their <c>Children</c> list populated recursively.
    /// </summary>
    public async Task<List<Category>> GetTreeAsync(System.Threading.CancellationToken ct = default)
    {
        var all = await _categories.Find(_ => true)
            .SortBy(c => c.SortOrder).ThenBy(c => c.Name)
            .ToListAsync(ct);

        // Group by parent key. Root nodes use a sentinel string since
        // Category.ParentId is a nullable string (no ObjectId magic values
        // allowed in Bson for our schema).
        var byParent = all
            .GroupBy(c => c.ParentId ?? "__root__")
            .ToDictionary(g => g.Key, g => g.ToList());

        return BuildTree(byParent, parentId: null);
    }

    private static List<Category> BuildTree(
        Dictionary<string, List<Category>> byParent, string? parentId)
    {
        var key = parentId ?? "__root__";
        if (!byParent.TryGetValue(key, out var nodes))
            return new List<Category>();

        foreach (var node in nodes)
        {
            // Reset in case the same Category was loaded twice via a shared
            // reference (defensive — IMongoCollection.ToListAsync already
            // returns fresh instances).
            node.Children = BuildTree(byParent, node.Id);
        }
        return nodes;
    }

    /// <summary>
    /// Returns the set of leaf-category slugs reachable from
    /// <paramref name="parentSlug"/>. If the parent has no children, it is
    /// treated as a leaf and its own slug is returned. The result is always
    /// distinct (a category could legitimately be referenced from multiple
    /// branches via data inconsistency).
    /// </summary>
    /// <remarks>
    /// Single-pass BFS — O(N) where N is the number of categories.
    /// Acceptable because the categories collection is small (tens of
    /// documents) and this only runs when the user filters by category.
    /// </remarks>
    public async Task<List<string>> GetDescendantSlugsAsync(
        string parentSlug, System.Threading.CancellationToken ct = default)
    {
        var all = await _categories.Find(_ => true).ToListAsync(ct);

        // Find every category with this slug — usually one, but the API
        // does not enforce slug uniqueness at the model level so we tolerate
        // (and merge) duplicates safely.
        var roots = all.Where(c => c.Slug == parentSlug).ToList();
        if (roots.Count == 0)
        {
            // Unknown slug: be permissive and let the caller fall back to an
            // exact match. This matches the previous behavior of
            // ProductService.GetByCategoryAsync so we don't break clients
            // that pass arbitrary strings.
            return new List<string> { parentSlug };
        }

        var leaves = new List<string>();
        var queue = new Queue<Category>(roots);
        var visited = new HashSet<string>(StringComparer.Ordinal);

        while (queue.Count > 0)
        {
            var node = queue.Dequeue();
            var nodeId = node.Id ?? string.Empty;
            if (nodeId.Length > 0 && !visited.Add(nodeId))
                continue;

            var children = all.Where(c => c.ParentId == node.Id).ToList();
            if (children.Count == 0 && !string.IsNullOrEmpty(node.Slug))
            {
                // Leaf (or node with no children in our dataset).
                leaves.Add(node.Slug);
            }
            foreach (var c in children)
                queue.Enqueue(c);
        }

        if (leaves.Count == 0)
            leaves.Add(parentSlug);
        return leaves.Distinct().ToList();
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
