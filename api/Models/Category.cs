using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Ecommer.Api.Models;

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
    /// Parent category ObjectId. <c>null</c> for top-level categories.
    /// Self-referencing — supports an N-level hierarchy (currently 3 levels used:
    /// Cây Cảnh → Monstera → Monstera Deliciosa).
    /// </summary>
    [BsonElement("parentId")]
    [BsonIgnoreIfNull]
    public string? ParentId { get; set; }

    /// <summary>
    /// Manual sort order within siblings (lower numbers first).
    /// </summary>
    [BsonElement("sortOrder")]
    public int SortOrder { get; set; } = 0;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Children populated by <c>CategoryService.GetTreeAsync</c>. Not persisted
    /// (no <c>[BsonElement]</c>) — MongoDB storage stays flat.
    /// </summary>
    [BsonIgnore]
    public List<Category> Children { get; set; } = new();
}
