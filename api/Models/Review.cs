using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Ecommer.Api.Models;

/// <summary>
/// A customer review attached to a product or to a specific variant SKU.
/// Stored in its own collection so reviews can grow without bloating the
/// product document. The storefront aggregates <c>avg</c> + <c>count</c> per
/// (productId, variantSku) for the SKU card rating row.
/// </summary>
public class Review
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("productId")]
    public string ProductId { get; set; } = string.Empty;

    /// <summary>
    /// Optional. When set, the review is scoped to a specific variant.
    /// When null, the review applies to the whole product.
    /// </summary>
    [BsonElement("variantSku")]
    [BsonIgnoreIfNull]
    public string? VariantSku { get; set; }

    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("userName")]
    [BsonIgnoreIfNull]
    public string? UserName { get; set; }

    /// <summary>1..5 inclusive. Validated server-side.</summary>
    [BsonElement("rating")]
    public int Rating { get; set; }

    [BsonElement("comment")]
    [BsonIgnoreIfNull]
    public string? Comment { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
