using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Ecommer.Api.Models;

/// <summary>
/// Flat taxonomy: every document is a standalone category. There is no
/// parent/child relationship — each product's <c>category</c> field is a
/// single slug pointing at exactly one of these documents. Storing the list
/// flat keeps admin CRUD trivial and removes any ambiguity when a product's
/// category is deleted.
/// </summary>
public class Category
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("slug")]
    public string Slug { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Manual sort order (lower numbers first). Used by storefront filters
    /// and the admin list. Ties broken alphabetically by name.
    /// </summary>
    [BsonElement("sortOrder")]
    public int SortOrder { get; set; } = 0;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}