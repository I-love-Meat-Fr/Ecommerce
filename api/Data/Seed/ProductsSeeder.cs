using MongoDB.Driver;
using Ecommer.Api.Models;

namespace Ecommer.Api.Data.Seed;

/// <summary>
/// Seeds the botanical product catalog used by the storefront. Each SKU
/// carries the full <see cref="PlantAttributes"/> profile so that size and
/// care-level filters work out of the box.
/// </summary>
/// <remarks>
/// <para>Idempotent and additive: only inserts products whose <c>Name</c> is
/// not already present. Existing rows are NEVER touched — admins may have
/// hand-curated the catalog (variant names, images, prices) and we must not
/// clobber that work.</para>
/// <para>Re-running the app on a fresh DB still produces the full canonical
/// catalog; re-running on a partially-seeded DB only adds the missing rows.</para>
/// </remarks>
public static class ProductsSeeder
{
    public static async Task SeedAsync(MongoDbContext context, ILogger logger, CancellationToken ct = default)
    {
        var products = context.Products;

        // Load just the names — we don't need the full documents to dedupe.
        var existingNames = await products
            .Find(_ => true)
            .Project(p => p.Name)
            .ToListAsync(ct);
        var takenNames = new HashSet<string>(existingNames, StringComparer.OrdinalIgnoreCase);

        var catalog = BuildCatalog(DateTime.UtcNow);
        var toInsert = catalog.Where(p => !takenNames.Contains(p.Name)).ToList();

        if (toInsert.Count == 0)
        {
            logger.LogInformation(
                "All {Total} catalog products already present. Skipping seed.",
                catalog.Count);
            return;
        }

        if (takenNames.Count > 0)
        {
            logger.LogInformation(
                "Catalog has {Catalog} products, {Existing} already present, inserting {Insert} new.",
                catalog.Count, catalog.Count - toInsert.Count, toInsert.Count);
        }

        await products.InsertManyAsync(toInsert, cancellationToken: ct);
        logger.LogInformation("Seeded {Count} new botanical products.", toInsert.Count);
    }

    /// <summary>
    /// Builds the canonical botanical catalog. Returned as a fresh list on
    /// every call so callers can filter without mutating the source.
    /// </summary>
    private static List<Product> BuildCatalog(DateTime now) => new()
    {
        // ── Monstera Deliciosa (3 variants) ────────────────────────────
        new()
        {
            Name = "Monstera Deliciosa",
            Description = "Lá xẻ đặc trưng, dễ chăm, hợp không gian sáng gián tiếp. Cây trưởng thành có lá cắt sâu hình cánh — điểm nhấn botanical cho phòng khách, ban công hoặc văn phòng.",
            Category = "monstera-deliciosa",
            ImageUrl = "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800",
            CreatedAt = now,
            UpdatedAt = now,
            Variants = new List<ProductVariant>
            {
                new() { Sku = "MOND-S", Name = "Monstera Deliciosa – Small (Chậu 12cm)",  Price = 450_000m, OriginalPrice = 520_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 4, Size = 1, Humidity = 3, Suitability = 5 } },
                new() { Sku = "MOND-M", Name = "Monstera Deliciosa – Medium (Chậu 17cm)", Price = 750_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1602491453631-e2a5ad10a8a0?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 4, Size = 3, Humidity = 3, Suitability = 5 } },
                new() { Sku = "MOND-L", Name = "Monstera Deliciosa – Large (Chậu 25cm)",   Price = 1_200_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1620503374956-c942862f0372?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 4, Size = 5, Humidity = 3, Suitability = 5 } },
            },
        },

        // ── Monstera Thai Constellation (3 variants) ───────────────────
        new()
        {
            Name = "Monstera Thai Constellation",
            Description = "Phiên bản đột biến với lá variegated trắng – xanh. Mỗi chiếc lá là một bức tranh không trùng lặp — sống động như dải ngân hà. Đây là dòng 'collector' được yêu thích nhất hiện nay.",
            Category = "monstera-thai-constellation",
            ImageUrl = "https://images.unsplash.com/photo-1632207691143-643c0bc1f5a5?w=800",
            CreatedAt = now,
            UpdatedAt = now,
            Variants = new List<ProductVariant>
            {
                new() { Sku = "MONTC-S", Name = "Monstera Thai Constellation – Small (Chậu 12cm)", Price = 850_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1632207691143-643c0bc1f5a5?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 3, Size = 1, Humidity = 4, Suitability = 3 } },
                new() { Sku = "MONTC-M", Name = "Monstera Thai Constellation – Medium (Chậu 17cm)", Price = 1_500_000m, OriginalPrice = 1_800_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 3, Size = 3, Humidity = 4, Suitability = 3 } },
                new() { Sku = "MONTC-L", Name = "Monstera Thai Constellation – Large (Chậu 25cm)", Price = 2_400_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 3, Size = 5, Humidity = 4, Suitability = 3 } },
            },
        },

        // ── Monstera Adansonii (2 variants) ───────────────────────────
        new()
        {
            Name = "Monstera Adansonii",
            Description = "Còn gọi là 'Swiss Cheese Vine' — lá nhỏ xẻ lỗ, thích hợp treo ban công hoặc để bàn. Tốc độ phát triển nhanh, dễ nhân giống bằng cắt cành.",
            Category = "monstera-adansonii",
            ImageUrl = "https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=800",
            CreatedAt = now,
            UpdatedAt = now,
            Variants = new List<ProductVariant>
            {
                new() { Sku = "MONA-M", Name = "Monstera Adansonii – Medium (Chậu 14cm, dây leo 30cm)", Price = 320_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 5, Size = 2, Humidity = 3, Suitability = 5 } },
                new() { Sku = "MONA-L", Name = "Monstera Adansonii – Large (Chậu 18cm, dây leo 60cm)", Price = 580_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 5, Size = 3, Humidity = 3, Suitability = 5 } },
            },
        },

        // ── Monstera Burle Flame (2 variants) ─────────────────────────
        new()
        {
            Name = "Monstera Burle Flame",
            Description = "Lá dài thon, viền gợn sóng mềm mại — điểm nhấn tối giản cho không gian hiện đại. Hiếm, được yêu thích trong giới sưu tầm.",
            Category = "monstera-burle-flame",
            ImageUrl = "https://images.unsplash.com/photo-1620503374956-c942862f0372?w=800",
            CreatedAt = now,
            UpdatedAt = now,
            Variants = new List<ProductVariant>
            {
                new() { Sku = "MONBF-M", Name = "Monstera Burle Flame – Medium (Chậu 14cm)", Price = 950_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1620503374956-c942862f0372?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 3, Size = 2, Humidity = 4, Suitability = 4 } },
                new() { Sku = "MONBF-L", Name = "Monstera Burle Flame – Large (Chậu 20cm)", Price = 1_650_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1632207691143-643c0bc1f5a5?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 3, Size = 4, Humidity = 4, Suitability = 4 } },
            },
        },

        // ── Lan Ý Mini (1 variant) ─────────────────────────────────────
        new()
        {
            Name = "Lan Ý Mini",
            Description = "Lan Ý size mini để bàn — NASA Clean Air Study xếp vào nhóm cây lọc formaldehyde và benzene hiệu quả nhất. Hoa trắng nở vài lần trong năm.",
            Category = "lan-y-mini",
            ImageUrl = "https://images.unsplash.com/photo-1593691509545-c55fb32d1d7e?w=800",
            CreatedAt = now,
            UpdatedAt = now,
            Variants = new List<ProductVariant>
            {
                new() { Sku = "LYM-S", Name = "Lan Ý Mini (Chậu 9cm, cao 18cm)", Price = 180_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1593691509545-c55fb32d1d7e?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 5, Size = 1, Humidity = 3, Suitability = 5 } },
            },
        },

        // ── Lan Ý Standard (3 variants) ────────────────────────────────
        new()
        {
            Name = "Lan Ý Standard",
            Description = "Lan size tiêu chuẩn, lá xanh bóng đậm, hoa trắng mo (spathe) nổi bật. Sống tốt trong ánh sáng yếu — lựa chọn hàng đầu cho văn phòng và phòng ngủ.",
            Category = "lan-y-standard",
            ImageUrl = "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=800",
            CreatedAt = now,
            UpdatedAt = now,
            Variants = new List<ProductVariant>
            {
                new() { Sku = "LYS-S", Name = "Lan Ý Standard – Small (Chậu 12cm)",  Price = 280_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 5, Size = 2, Humidity = 3, Suitability = 5 } },
                new() { Sku = "LYS-M", Name = "Lan Ý Standard – Medium (Chậu 17cm)", Price = 380_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1593691509545-c55fb32d1d7e?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 5, Size = 3, Humidity = 3, Suitability = 5 } },
                new() { Sku = "LYS-L", Name = "Lan Ý Standard – Large (Chậu 22cm)",  Price = 480_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1545241047-6083a3684587?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 5, Size = 4, Humidity = 3, Suitability = 5 } },
            },
        },

        // ── Sen Đá (1 variant) ─────────────────────────────────────────
        new()
        {
            Name = "Sen Đá Ngọc",
            Description = "Sen đá để bàn size mini — lá dày mọng nước hình ngọc bích, gần như không cần chăm. Quà tặng đầu tiên lý tưởng cho người mới chơi cây.",
            Category = "sen-da",
            ImageUrl = "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800",
            CreatedAt = now,
            UpdatedAt = now,
            Variants = new List<ProductVariant>
            {
                new() { Sku = "SDN-MINI", Name = "Sen Đá Ngọc (Chậu 6cm, mini)", Price = 90_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 5, Size = 1, Humidity = 1, Suitability = 5 } },
            },
        },

        // ── Hoa Đồng Tiền (1 variant) ──────────────────────────────────
        new()
        {
            Name = "Hoa Đồng Tiền Đỏ",
            Description = "Hoa Đồng Tiền (Gerbera) đỏ rực — tượng trưng cho may mắn và tài lộc. Mỗi cành là một bông hoa lớn, sặc sỡ, nở suốt mùa hè. Thích hợp làm quà tặng, cắm lọ hoặc trồng chậu.",
            Category = "hoa-dong-tien",
            ImageUrl = "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800",
            CreatedAt = now,
            UpdatedAt = now,
            Variants = new List<ProductVariant>
            {
                new() { Sku = "HDT-M", Name = "Hoa Đồng Tiền Đỏ – Medium (Chậu 14cm)", Price = 250_000m,
                    IsActive = true, ImageUrl = "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600",
                    PlantAttributes = new PlantAttributes { CareLevel = 3, Size = 2, Humidity = 2, Suitability = 4 } },
            },
        },
    };
}
