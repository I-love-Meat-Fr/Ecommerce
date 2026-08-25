using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Ecommer.Api.Models;

public class OrderStatusLog
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("orderId")]
    public string OrderId { get; set; } = string.Empty;

    [BsonElement("fromStatus")]
    public string? FromStatus { get; set; }

    [BsonElement("toStatus")]
    public string ToStatus { get; set; } = string.Empty;

    [BsonElement("changedBy")]
    public string ChangedBy { get; set; } = string.Empty;

    [BsonElement("changedAt")]
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("note")]
    public string? Note { get; set; }
}
