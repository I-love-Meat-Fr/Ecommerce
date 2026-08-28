using MongoDB.Bson;
using MongoDB.Driver;
using Ecommer.Api.Models;

namespace Ecommer.Api.Data.Seed;

/// <summary>
/// Migration: adds lockedQuantity = 0 to every variant that is missing it.
/// Safe to run on every startup — uses bulk update so it is idempotent and fast.
/// </summary>
public static class LockedQuantityMigrator
{
    public static async Task MigrateAsync(MongoDbContext context, ILogger logger, CancellationToken ct = default)
    {
        var collection = context.GetCollection<BsonDocument>("products");

        // Bulk-update: set lockedQuantity = 0 on every variant sub-document
        // that does not already have the field.
        // We use a pipeline update ($merge) to avoid touching documents that are
        // already migrated.
        var filter = new BsonDocument("variants.lockedQuantity", new BsonDocument("$exists", false));
        var countMissing = await collection.CountDocumentsAsync(filter, cancellationToken: ct);

        if (countMissing == 0)
        {
            logger.LogInformation("LockedQuantityMigrator: all variants already have lockedQuantity. Nothing to do.");
            return;
        }

        logger.LogInformation("LockedQuantityMigrator: found {Count} products with variants missing lockedQuantity. Migrating...", countMissing);

        // Walk every product and patch its variants array.
        using var cursor = await collection.FindAsync(FilterDefinition<BsonDocument>.Empty, cancellationToken: ct);
        var updated = 0;

        while (await cursor.MoveNextAsync(ct))
        {
            foreach (var doc in cursor.Current)
            {
                var objectId = doc["_id"].AsObjectId;
                var variants = doc.GetValue("variants", new BsonArray()).AsBsonArray;
                var needsUpdate = false;

                foreach (var variant in variants)
                {
                    var v = variant.AsBsonDocument;
                    if (!v.Contains("lockedQuantity"))
                    {
                        v.Add("lockedQuantity", 0);
                        needsUpdate = true;
                    }
                }

                if (needsUpdate)
                {
                    var update = Builders<BsonDocument>.Update.Set("variants", new BsonArray(variants));
                    await collection.UpdateOneAsync(
                        Builders<BsonDocument>.Filter.Eq("_id", objectId),
                        update,
                        cancellationToken: ct);
                    updated++;
                }
            }
        }

        logger.LogInformation("LockedQuantityMigrator: migrated {Updated} products.", updated);
    }
}
