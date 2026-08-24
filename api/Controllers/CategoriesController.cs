using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    [HttpGet]
    public async Task<ActionResult<List<Category>>> GetAll()
    {
        return Ok(await _categoryService.GetAllAsync());
    }

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

        var category = await _categoryService.CreateAsync(new Category { Name = dto.Name.Trim() });
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Update(string id, [FromBody] CategoryUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(id) || id.Length != 24)
            return BadRequest(new { message = "id không hợp lệ." });
        if (string.IsNullOrWhiteSpace(dto.Name?.Trim()))
            return BadRequest(new { message = "Tên danh mục bắt buộc." });

        var success = await _categoryService.UpdateAsync(id, dto.Name.Trim(), dto.Description?.Trim());
        if (!success)
            return NotFound();
        return NoContent();
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
}

public class CategoryUpdateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
}
