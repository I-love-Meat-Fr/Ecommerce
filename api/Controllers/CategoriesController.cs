using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ecommer.Api.DTOs;
using Ecommer.Api.Models;
using Ecommer.Api.Services;

namespace Ecommer.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly CategoryService _categoryService;

    public CategoriesController(CategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    /// <summary>
    /// Flat list of categories ordered by <c>(SortOrder, Name)</c>.
    /// Used by the storefront category filter bar and the admin CRUD page.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<Category>>> GetAll()
    {
        return Ok(await _categoryService.GetAllAsync());
    }

    /// <summary>
    /// Lightweight payload used by the storefront filter UI. Mirrors the
    /// full <c>Category</c> shape but is documented separately so future
    /// tree-style payloads don't surprise the storefront.
    /// </summary>
    [HttpGet("nodes")]
    public async Task<ActionResult<List<CategoryNode>>> GetNodes()
    {
        var all = await _categoryService.GetAllAsync();
        return Ok(all.Select(MapNode).ToList());
    }

    private static CategoryNode MapNode(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Slug = c.Slug,
        SortOrder = c.SortOrder,
        Description = c.Description,
    };

    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetById(string id)
    {
        if (string.IsNullOrWhiteSpace(id) || id.Length != 24)
            return BadRequest(new { message = "id không hợp lệ." });
        var category = await _categoryService.GetByIdAsync(id);
        if (category == null)
            return NotFound();
        return Ok(category);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Category>> Create([FromBody] CategoryCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name?.Trim()))
            return BadRequest(new { message = "Tên danh mục bắt buộc." });

        var existing = await _categoryService.GetBySlugAsync(
            dto.Name.Trim().ToLowerInvariant().Replace(" ", "-"));
        if (existing != null)
            return Conflict(new { message = "Danh mục đã tồn tại." });

        var category = await _categoryService.CreateAsync(new Category
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            SortOrder = dto.SortOrder ?? 0,
        });
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Patch(string id, [FromBody] CategoryUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(id) || id.Length != 24)
            return BadRequest(new { message = "id không hợp lệ." });
        if (string.IsNullOrWhiteSpace(dto.Name?.Trim()))
            return BadRequest(new { message = "Tên danh mục bắt buộc." });

        var result = await _categoryService.UpdateAsync(id, dto.Name.Trim(), dto.Description?.Trim());
        return result switch
        {
            CategoryUpdateResult.Updated => NoContent(),
            CategoryUpdateResult.NotFound => NotFound(),
            CategoryUpdateResult.DuplicateName => Conflict(new { message = "Tên danh mục đã tồn tại." }),
            _ => StatusCode(500),
        };
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        if (string.IsNullOrWhiteSpace(id) || id.Length != 24)
            return BadRequest(new { message = "id không hợp lệ." });
        var success = await _categoryService.DeleteAsync(id);
        if (!success)
            return NotFound();
        return NoContent();
    }
}

public class CategoryCreateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? SortOrder { get; set; }
}

public class CategoryUpdateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
}