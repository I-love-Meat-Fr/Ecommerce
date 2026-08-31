using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ecommer.Api.DTOs;
using Ecommer.Api.Models;
using Ecommer.Api.Services;

namespace Ecommer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ProductService _productService;
    private readonly ProductStatsService _statsService;

    public ProductsController(ProductService productService, ProductStatsService statsService)
    {
        _productService = productService;
        _statsService = statsService;
    }

    /// <summary>
    /// Paginated product listing with server-side filtering & sort.
    /// Query parameters bind via <see cref="ProductQueryParams"/>.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ProductListResponse>> GetAll([FromQuery] ProductQueryParams query)
    {
        var (items, total) = await _productService.GetFilteredAsync(query);
        var withStats = await BuildStatsAsync(items);
        return Ok(new ProductListResponse
        {
            Items = withStats,
            Total = (int)total,
            Page = query.Page,
            PageSize = query.PageSize,
        });
    }

    /// <summary>
    /// Lightweight search endpoint used by admin UI for product lookup.
    /// Returns at most 500 matches without pagination — the new
    /// paginated <c>GET /</c> supersedes this for the storefront.
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<ProductWithStats>>> Search([FromQuery] string? q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new List<ProductWithStats>());
        var results = await _productService.SearchAsync(q);
        var withStats = await BuildStatsAsync(results);
        return Ok(withStats);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductWithStats>> GetById(string id)
    {
        if (string.IsNullOrWhiteSpace(id) || id.Length != 24 || !id.All(char.IsLetterOrDigit))
            return BadRequest(new { message = "id không hợp lệ." });
        var product = await _productService.GetByIdAsync(id);
        if (product == null) return NotFound();
        var wrapped = await BuildStatsAsync(new List<Product> { product });
        return Ok(wrapped[0]);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Product>> Create([FromBody] Product product)
    {
        var created = await _productService.CreateAsync(product);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Update(string id, [FromBody] ProductUpdateDto dto)
    {
        var success = await _productService.UpdateAsync(id, dto);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        var success = await _productService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    // --- helpers ---

    private async Task<List<ProductWithStats>> BuildStatsAsync(List<Product> products)
    {
        var ids = products.Select(p => p.Id).Where(id => !string.IsNullOrEmpty(id)).Cast<string>().ToList();
        if (ids.Count == 0)
        {
            return products.Select(p => new ProductWithStats { Product = p }).ToList();
        }
        var sold = await _statsService.GetSoldCountsAsync(ids);
        var rating = await _statsService.GetRatingsAsync(ids);
        return products.Select(p =>
        {
            var key = p.Id ?? string.Empty;
            return new ProductWithStats
            {
                Product = p,
                SoldCounts = sold.TryGetValue(key, out var s) ? s : new(),
                Rating = rating.TryGetValue(key, out var r) ? r : new(),
            };
        }).ToList();
    }
}
