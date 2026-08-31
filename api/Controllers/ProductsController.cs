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

    [HttpGet]
    public async Task<ActionResult<List<ProductWithStats>>> GetAll(
        [FromQuery] string? category = null,
        [FromQuery] string? search = null)
    {
        List<Product> products;
        if (!string.IsNullOrEmpty(search))
        {
            products = await _productService.SearchAsync(search);
        }
        else if (!string.IsNullOrEmpty(category))
        {
            products = await _productService.GetByCategoryAsync(category);
        }
        else
        {
            products = await _productService.GetAllAsync();
        }
        return Ok(await BuildStatsAsync(products));
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
