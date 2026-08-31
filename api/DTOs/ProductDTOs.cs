using System;
using System.Collections.Generic;
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

/// <summary>
/// Query string for <c>GET /api/products</c>. Bound from the URL via
/// <c>[FromQuery]</c>. All fields are optional — missing fields mean
/// "no filter on this axis".
/// </summary>
public class ProductQueryParams
{
    /// <summary>Category slug. Treated as the root of a sub-tree: the server
    /// expands it to all leaf descendants and matches products whose
    /// <c>category</c> is in that set.</summary>
    public string? Category { get; set; }

    /// <summary>Free-text search across product names and variant names/SKUs (case-insensitive contains).</summary>
    public string? Search { get; set; }

    /// <summary>Inclusive minimum variant price (VND).</summary>
    public decimal? MinPrice { get; set; }

    /// <summary>Inclusive maximum variant price (VND).</summary>
    public decimal? MaxPrice { get; set; }

    /// <summary>Plant size on the 1–5 scale (1 = tiny / bonsai, 5 = large tree).</summary>
    public int? Size { get; set; }

    /// <summary>Inclusive minimum care level (1 = very hard, 5 = very easy).</summary>
    public int? MinCareLevel { get; set; }

    /// <summary>Inclusive maximum care level.</summary>
    public int? MaxCareLevel { get; set; }

    /// <summary>1-based page number. Defaults to 1. Capped to >=1.</summary>
    public int Page { get; set; } = 1;

    /// <summary>Page size. Defaults to 12. Capped at 100.</summary>
    public int PageSize { get; set; } = 12;

    /// <summary>One of <c>popular</c> (default), <c>newest</c>, <c>price-asc</c>, <c>price-desc</c>, <c>name-asc</c>.</summary>
    public string SortBy { get; set; } = "popular";
}

/// <summary>
/// Paginated product list payload returned by <c>GET /api/products</c>.
/// </summary>
public class ProductListResponse
{
    /// <summary>Products for the current page, each enriched with per-SKU stats and ratings.</summary>
    public List<ProductWithStats> Items { get; set; } = new();

    /// <summary>Total matching products across all pages (after filters, before pagination).</summary>
    public int Total { get; set; }

    /// <summary>Echo of the page number that produced this slice.</summary>
    public int Page { get; set; }

    /// <summary>Echo of the page size used to produce this slice.</summary>
    public int PageSize { get; set; }

    /// <summary>Computed: <c>ceil(Total / PageSize)</c>. 0 when <c>PageSize &lt;= 0</c>.</summary>
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)Total / PageSize) : 0;

    /// <summary>True when there is at least one more page after this one.</summary>
    public bool HasNextPage => Page < TotalPages;

    /// <summary>True when there is at least one page before this one.</summary>
    public bool HasPrevPage => Page > 1;
}

/// <summary>
/// Lightweight projection of <see cref="Category"/> for the
/// <c>GET /api/categories/tree</c> endpoint. Excludes description and
/// timestamps to keep the payload small for the storefront mega-menu.
/// </summary>
public class CategoryNode
{
    /// <summary>Mongo <c>_id</c> serialized as a 24-char hex string.</summary>
    public string? Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    /// <summary>Direct children; empty for leaf nodes.</summary>
    public List<CategoryNode> Children { get; set; } = new();
}

