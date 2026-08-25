using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ecommer.Api.Models;
using Ecommer.Api.Services;

namespace Ecommer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;
    private readonly ProductService _productService;
    private readonly OrderStatusLogService _logService;

    public OrdersController(OrderService orderService, ProductService productService, OrderStatusLogService logService)
    {
        _orderService = orderService;
        _productService = productService;
        _logService = logService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<Order>>> GetAll()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        var role = User.FindFirstValue(ClaimTypes.Role)
            ?? User.FindFirstValue("role");

        if (role == "Admin")
        {
            return Ok(await _orderService.GetAllAsync());
        }

        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized(new { message = "Invalid token" });

        return Ok(await _orderService.GetByUserIdAsync(currentUserId));
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<Order>> GetById(string id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        var role = User.FindFirstValue(ClaimTypes.Role)
            ?? User.FindFirstValue("role");

        if (role != "Admin" && order.UserId != currentUserId)
            return NotFound();

        return Ok(order);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Order>> Create([FromBody] Order order)
    {
        // Always override userId from the verified JWT token — never trust the client body.
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Invalid token" });

        if (order.Items == null || order.Items.Count == 0)
            return BadRequest(new { message = "Order must contain at least one item" });

        // Server-side price integrity: look up each product+variant in the DB
        // and ignore whatever UnitPrice / TotalAmount the client sent.
        foreach (var item in order.Items)
        {
            if (item.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be positive" });

            var product = await _productService.GetByIdAsync(item.ProductId);
            if (product == null)
                return BadRequest(new { message = $"Product '{item.ProductId}' not found" });

            var variant = product.Variants.FirstOrDefault(v => v.Sku == item.VariantId || v.Name == item.VariantId);
            if (variant == null)
                return BadRequest(new { message = $"Variant '{item.VariantId}' not found for product '{item.ProductId}'" });

            if (!variant.IsActive)
                return BadRequest(new { message = $"Variant '{variant.Name}' is no longer available" });

            if (variant.Stock < item.Quantity)
                return BadRequest(new { message = $"Insufficient stock for '{variant.Name}'" });

            // Overwrite everything derived from the DB. Client cannot tamper with prices or names.
            item.UnitPrice = variant.Price;
            item.ProductName = product.Name;
            item.VariantName = variant.Name;
            item.Sku = variant.Sku;
        }

        order.UserId = userId;
        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);
        var created = await _orderService.CreateAsync(order);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateStatus(string id, [FromBody] StatusUpdate status)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        var changedBy = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? "unknown";

        var success = await _orderService.UpdateStatusAsync(id, status.Status, order.Status, changedBy, status.Note);
        if (!success)
            return NotFound();
        return NoContent();
    }

    [HttpGet("{id}/status-logs")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<OrderStatusLog>>> GetStatusLogs(string id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        var logs = await _logService.GetByOrderIdAsync(id);
        return Ok(logs);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        var success = await _orderService.DeleteAsync(id);
        if (!success)
            return NotFound();
        return NoContent();
    }
}

public class StatusUpdate
{
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
}
