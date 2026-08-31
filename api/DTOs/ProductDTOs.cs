using Ecommer.Api.Models;
using Ecommer.Api.Services;

namespace Ecommer.Api.DTOs;

/// <summary>
/// Response envelope for product list/detail endpoints. Carries the original
/// <see cref="Product"/> document plus pre-aggregated stats so the storefront
/// can render SKU cards in a single roundtrip.
/// </summary>
public class ProductWithStats
{
    /// <summary>The product document. Aliases are <c>id</c>, <c>name</c>, <c>category</c>, <c>imageUrl</c>, <c>variants</c>, <c>createdAt</c>, <c>updatedAt</c>.</summary>
    public Product Product { get; set; } = new();

    /// <summary>Per-variant sold count, keyed by <c>variant.sku</c>. Missing keys mean "0 sold".</summary>
    public Dictionary<string, int> SoldCounts { get; set; } = new();

    /// <summary>Aggregate rating (avg + count) for the whole product. Per-SKU ratings are available via <c>/api/reviews</c>.</summary>
    public RatingSummary Rating { get; set; } = new();
}
