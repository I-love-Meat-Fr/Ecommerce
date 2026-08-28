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

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// DTO for PATCH /api/products/{id} — only fields the client may change.
// Every field is nullable so we can distinguish "not provided" from "set to empty".
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

    [BsonElement("stock")]
    public int Stock { get; set; }

    /// <summary>
    /// Số lượng đang bị tạm giữ trong các đơn hàng Pending / Processing / Shipped.
    /// Không bao gồm đơn Cancelled (hoàn kho khi hủy).
    /// </summary>
    [BsonElement("lockedQuantity")]
    public int LockedQuantity { get; set; }

    /// <summary>
    /// Số lượng khả dụng = stock − lockedQuantity.
    /// Chỉ dùng khi trả về cho client; không persist vào MongoDB.
    /// </summary>
    [BsonIgnore]
    public int AvailableStock => Math.Max(0, Stock - LockedQuantity);

    [BsonElement("imageUrl")]
    public string? ImageUrl { get; set; }

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;
}
