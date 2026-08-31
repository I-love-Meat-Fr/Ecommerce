using MongoDB.Driver;
using Ecommer.Api.Models;

namespace Ecommer.Api.Data.Seed;

/// <summary>
/// Seeds the 3-level botanical category tree:
///   Cây Cảnh
///     ├── Monstera (Deliciosa, Thai Constellation, Adansonii, Burle Flame)
///     ├── Lan Ý (Mini, Standard)
///     └── Sen Đá
///   Hoa
///     └── Hoa Đồng Tiền
///
/// Idempotent: if <c>parentIds</c> for the canonical structure already
/// exist on every expected slug, the seeder no-ops. Otherwise any missing
/// nodes are inserted and parent links are normalized.
/// </summary>
public static class CategorySeeder
{
    private record NodeSpec(
        string Name,
        string Slug,
        string? ParentSlug,
        int SortOrder,
        string? Description = null);

    public static async Task SeedAsync(MongoDbContext context, ILogger logger, CancellationToken ct = default)
    {
        var categories = context.Categories;

        var spec = new[]
        {
            // Level 1 — root categories
            new NodeSpec("Cây Cảnh",        "cay-canh",        null, 10, "Các loại cây cảnh trang trí nội thất và văn phòng."),
            new NodeSpec("Hoa",             "hoa",             null, 20, "Hoa tươi, hoa chậu và phụ kiện cắm hoa."),

            // Level 2 — under Cây Cảnh
            new NodeSpec("Monstera",        "monstera",        "cay-canh", 10, "Chi Monstera — lá to, độc đáo, dễ chăm sóc."),
            new NodeSpec("Lan Ý",           "lan-y",           "cay-canh", 20, "Lan Ý (Peace Lily) — lọc không khí, hợp người bận rộn."),
            new NodeSpec("Sen Đá",          "sen-da",          "cay-canh", 30, "Sen đá để bàn — nhỏ gọn, ít cần tưới."),

            // Level 3 — under Monstera
            new NodeSpec("Monstera Deliciosa",        "monstera-deliciosa",         "monstera", 10),
            new NodeSpec("Monstera Thai Constellation","monstera-thai-constellation","monstera", 20),
            new NodeSpec("Monstera Adansonii",        "monstera-adansonii",         "monstera", 30),
            new NodeSpec("Monstera Burle Flame",      "monstera-burle-flame",       "monstera", 40),

            // Level 3 — under Lan Ý
            new NodeSpec("Lan Ý Mini",      "lan-y-mini",      "lan-y", 10),
            new NodeSpec("Lan Ý Standard",  "lan-y-standard",  "lan-y", 20),

            // Level 3 — under Hoa
            new NodeSpec("Hoa Đồng Tiền",   "hoa-dong-tien",   "hoa",  10),
        };

        // Load once so we can do id-by-slug lookups cheaply.
        var existing = await categories.Find(_ => true).ToListAsync(ct);
        var bySlug = existing.ToDictionary(c => c.Slug, c => c, StringComparer.Ordinal);
        // Track categories we're about to insert this pass so children whose
        // parent is also being inserted can still resolve their parentId.
        // Without this, processing order would force children to be inserted
        // before parents (or rejected), giving an orphan tree.
        var pendingBySlug = new Dictionary<string, string>(StringComparer.Ordinal);

        var now = DateTime.UtcNow;
        var inserts = new List<Category>();
        var updates = new List<WriteModel<Category>>();

        foreach (var node in spec)
        {
            string? parentId = null;
            if (!string.IsNullOrEmpty(node.ParentSlug))
            {
                if (bySlug.TryGetValue(node.ParentSlug, out var parent))
                {
                    parentId = parent.Id;
                }
                else if (pendingBySlug.TryGetValue(node.ParentSlug, out var pendingId))
                {
                    parentId = pendingId;
                }
                else
                {
                    logger.LogWarning(
                        "Category {Slug} references missing parent {Parent}. Skipping.",
                        node.Slug, node.ParentSlug);
                    continue;
                }
            }

            if (bySlug.TryGetValue(node.Slug, out var existingNode))
            {
                // Normalize parent/sort if drift has occurred (manual edits,
                // legacy single-level data, etc.).
                var needsParentUpdate =
                    existingNode.ParentId != parentId ||
                    existingNode.SortOrder != node.SortOrder;

                if (needsParentUpdate)
                {
                    var update = Builders<Category>.Update
                        .Set(c => c.ParentId, parentId)
                        .Set(c => c.SortOrder, node.SortOrder)
                        .Set(c => c.Description, node.Description);
                    updates.Add(new UpdateOneModel<Category>(
                        Builders<Category>.Filter.Eq(c => c.Id, existingNode.Id),
                        update));
                }
            }
            else
            {
                // Eagerly mint a placeholder ObjectId (hex) so children processed
                // later can reference it. MongoDB will keep this id when we
                // insert — we don't rely on it being readable, just stable for
                // the duration of this seeding pass.
                var pendingId = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
                pendingBySlug[node.Slug] = pendingId;

                inserts.Add(new Category
                {
                    Id = pendingId,
                    Name = node.Name,
                    Slug = node.Slug,
                    Description = node.Description,
                    ParentId = parentId,
                    SortOrder = node.SortOrder,
                    CreatedAt = now,
                });
            }
        }

        if (inserts.Count > 0)
        {
            await categories.InsertManyAsync(inserts, cancellationToken: ct);
            logger.LogInformation("Inserted {Count} new categories.", inserts.Count);
        }
        if (updates.Count > 0)
        {
            await categories.BulkWriteAsync(updates, cancellationToken: ct);
            logger.LogInformation("Normalized parent/sort on {Count} categories.", updates.Count);
        }
        if (inserts.Count == 0 && updates.Count == 0)
        {
            logger.LogInformation("Categories already seeded.");
        }
    }
}
