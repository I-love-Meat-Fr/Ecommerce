using MongoDB.Driver;
using Ecommer.Api.Models;

namespace Ecommer.Api.Data.Seed;

/// <summary>
/// Seeds the flat botanical category list. Every entry is a standalone
/// category (no parent/child relationship) — products reference one of
/// these slugs directly via <c>Product.category</c>.
///
/// Idempotent: for each <c>NodeSpec</c> slug, if a document already exists
/// its <c>name</c>, <c>description</c>, and <c>sortOrder</c> are normalized;
/// otherwise a new document is inserted.
/// </summary>
public static class CategorySeeder
{
    private record NodeSpec(
        string Name,
        string Slug,
        int SortOrder,
        string? Description = null);

    public static async Task SeedAsync(MongoDbContext context, ILogger logger, CancellationToken ct = default)
    {
        var categories = context.Categories;

        // Flat list — all categories are peers. SortOrder controls display
        // order in the storefront filter bar (lower first).
        var spec = new[]
        {
            new NodeSpec("Cây Cảnh",               "cay-canh",                   10, "Các loại cây cảnh trang trí nội thất và văn phòng."),
            new NodeSpec("Monstera",               "monstera",                   20, "Chi Monstera — lá to, độc đáo, dễ chăm sóc."),
            new NodeSpec("Monstera Deliciosa",     "monstera-deliciosa",         21),
            new NodeSpec("Monstera Thai Constellation","monstera-thai-constellation",22),
            new NodeSpec("Monstera Adansonii",     "monstera-adansonii",         23),
            new NodeSpec("Monstera Burle Flame",   "monstera-burle-flame",       24),
            new NodeSpec("Lan Ý",                  "lan-y",                      30, "Lan Ý (Peace Lily) — lọc không khí, hợp người bận rộn."),
            new NodeSpec("Lan Ý Mini",             "lan-y-mini",                 31),
            new NodeSpec("Lan Ý Standard",         "lan-y-standard",             32),
            new NodeSpec("Sen Đá",                 "sen-da",                     40, "Sen đá để bàn — nhỏ gọn, ít cần tưới."),
            new NodeSpec("Hoa",                    "hoa",                        50, "Hoa tươi, hoa chậu và phụ kiện cắm hoa."),
            new NodeSpec("Hoa Đồng Tiền",          "hoa-dong-tien",              51),
            // Orphan categories carried over from earlier data. The slug
            // `anthirium` (no 'h' after the 't') is preserved on purpose —
            // it matches the existing document so the seeder normalizes in
            // place instead of inserting a duplicate under the correct
            // spelling. Rename through the admin UI if the typo bothers you.
            new NodeSpec("Aglaonema",              "aglaonema",                  60, "Aglaonema — cây may mắn, lá đa dạng màu sắc."),
            new NodeSpec("Alocasia",               "alocasia",                   61, "Alocasia — lá mũi tên, độc đáo, ưa ẩm."),
            new NodeSpec("Anthurium",              "anthirium",                  62, "Anthurium — hoa hồng môn, lá bóng, nở quanh năm."),
            new NodeSpec("Philodendron",           "philodendron",               63, "Philodendron — đa dạng giống, lá hình tim kinh điển."),
        };

        var existing = await categories.Find(_ => true).ToListAsync(ct);
        var bySlug = existing.ToDictionary(c => c.Slug, c => c, StringComparer.Ordinal);

        var now = DateTime.UtcNow;
        var inserts = new List<Category>();
        var updates = new List<WriteModel<Category>>();

        foreach (var node in spec)
        {
            if (bySlug.TryGetValue(node.Slug, out var existingNode))
            {
                // Normalize name/description/sort if drift has occurred (manual
                // edits, legacy single-level data, etc.). ParentId is no longer
                // a field on Category in the flat model, so there's nothing to
                // back-fill here.
                var needsUpdate =
                    existingNode.Name != node.Name ||
                    existingNode.SortOrder != node.SortOrder ||
                    existingNode.Description != node.Description;

                if (needsUpdate)
                {
                    var update = Builders<Category>.Update
                        .Set(c => c.Name, node.Name)
                        .Set(c => c.SortOrder, node.SortOrder)
                        .Set(c => c.Description, node.Description);
                    updates.Add(new UpdateOneModel<Category>(
                        Builders<Category>.Filter.Eq(c => c.Id, existingNode.Id),
                        update));
                }
            }
            else
            {
                inserts.Add(new Category
                {
                    Name = node.Name,
                    Slug = node.Slug,
                    Description = node.Description,
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
            logger.LogInformation("Normalized name/sort/description on {Count} categories.", updates.Count);
        }
        if (inserts.Count == 0 && updates.Count == 0)
        {
            logger.LogInformation("Categories already seeded.");
        }
    }
}