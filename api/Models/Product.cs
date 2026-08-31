using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Ecommer.Api.Models;

public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("category")]
    public string? Category { get; set; }

    [BsonElement("imageUrl")]
    public string? ImageUrl { get; set; }

    [BsonElement("variants")]
    public List<ProductVariant> Variants { get; set; } = new();

    /// <summary>
    /// Denormalized cumulative sold count across all non-cancelled orders.
    /// Used by <c>sortBy=popular</c> to avoid re-aggregating the orders collection
    /// on every list query. Incremented in <c>OrderService.UpdateStatusAsync</c>
    /// when an order transitions to <c>Delivered</c>; back-filled for historical
    /// data by <c>RecomputeTotalSoldCountSeeder</c>.
    /// </summary>
    [BsonElement("totalSoldCount")]
    [BsonIgnoreIfNull]
    public int TotalSoldCount { get; set; } = 0;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Botanical care attributes — all numeric on a 1–5 scale.
/// Null when not yet set.
/// </summary>
public class PlantAttributes
{
    /// <summary>Care difficulty: 1 = very hard → 5 = very easy.</summary>
    [BsonElement("careLevel")]
    [BsonIgnoreIfNull]
    public int? CareLevel { get; set; }

    /// <summary>Size: 1 = tiny / bonsai → 5 = large tree.</summary>
    [BsonElement("size")]
    [BsonIgnoreIfNull]
    public int? Size { get; set; }

    /// <summary>Humidity preference: 1 = very dry → 5 = very humid.</summary>
    [BsonElement("humidity")]
    [BsonIgnoreIfNull]
    public int? Humidity { get; set; }

    /// <summary>Adaptability / ease-of-life: 1 = fussy → 5 = very hardy.</summary>
    [BsonElement("suitability")]
    [BsonIgnoreIfNull]
    public int? Suitability { get; set; }
}

// DTO for PATCH /api/products/{id} — only fields the client may change.
// Every field is nullable so we can distinguish "not provided" from "set to empty".
// PlantAttributes are carried inside each variant — see ProductVariant.
public class ProductUpdateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? ImageUrl { get; set; }
    public List<ProductVariant>? Variants { get; set; }
}

public class ProductVariant
{
    [BsonElement("sku")]
    public string Sku { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("color")]
    public string? Color { get; set; }

    [BsonElement("storage")]
    public string? Storage { get; set; }

    [BsonElement("price")]
    public decimal Price { get; set; }

    [BsonElement("imageUrl")]
    public string? ImageUrl { get; set; }

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Optional compare-at (original) price. When present and greater than
    /// <see cref="Price"/>, the storefront surfaces a discount badge derived
    /// from <c>(OriginalPrice - Price) / OriginalPrice</c>.
    /// </summary>
    [BsonElement("originalPrice")]
    [BsonIgnoreIfNull]
    public decimal? OriginalPrice { get; set; }

    /// <summary>
    /// Per-SKU botanical care attributes (all numeric on a 1–5 scale).
    /// Each variant of a product can have its own care profile since different
    /// cultivars of the same plant (e.g. Monstera Deliciosa vs Thai Constellation)
    /// have very different care needs. Null when not yet set.
    /// </summary>
    [BsonElement("plantAttributes")]
    [BsonIgnoreIfNull]
    public PlantAttributes? PlantAttributes { get; set; }
}
