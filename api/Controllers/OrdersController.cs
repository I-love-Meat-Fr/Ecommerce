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
    private readonly UserService _userService;
    private readonly InventoryService _inventoryService;

    public OrdersController(
        OrderService orderService,
        ProductService productService,
        OrderStatusLogService logService,
        UserService userService,
        InventoryService inventoryService)
    {
        _orderService = orderService;
        _productService = productService;
        _logService = logService;
        _userService = userService;
        _inventoryService = inventoryService;
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
    public async Task<ActionResult<Order>> Create([FromBody] CreateOrderRequest request)
    {
        // Always override userId from the verified JWT token — never trust the client body.
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "Invalid token" });

        if (request.Items == null || request.Items.Count == 0)
            return BadRequest(new { message = "Order must contain at least one item" });

        if (string.IsNullOrWhiteSpace(request.ShippingAddress))
            return BadRequest(new { message = "Shipping address is required" });

        // Server-side price integrity: look up each product+variant in the DB
        // and ignore whatever UnitPrice / TotalAmount the client sent.
        foreach (var item in request.Items)
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

            var available = variant.Stock - variant.LockedQuantity;
            if (available < item.Quantity)
            {
                if (available == 0)
                    return BadRequest(new { message = $"Sản phẩm '{variant.Name}' hiện đã hết hàng." });
                return BadRequest(new { message = $"Sản phẩm '{variant.Name}' chỉ còn {available} trong kho (yêu cầu {item.Quantity})." });
            }

            // Overwrite everything derived from the DB. Client cannot tamper with prices or names.
            item.UnitPrice = variant.Price;
            item.ProductName = product.Name;
            item.VariantName = variant.Name;
            item.Sku = variant.Sku;
        }

        var order = new Order
        {
            UserId = userId,
            Items = request.Items,
            TotalAmount = request.Items.Sum(i => i.Quantity * i.UnitPrice),
            Status = "Pending",
            PaymentMethod = request.PaymentMethod ?? "COD",
            ShippingAddress = request.ShippingAddress,
        };

        var created = await _orderService.CreateOrderWithLockAsync(order);
        await _logService.CreateLogAsync(created.Id!, null, "Pending", userId, "Order created");
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

        var fromStatus = order.Status;

        var success = await _orderService.UpdateStatusAsync(id, status.Status, fromStatus, changedBy, status.Note);
        if (!success)
            return NotFound();

        // Xử lý tồn kho theo trạng thái chuyển đổi
        if (status.Status == "Cancelled")
        {
            foreach (var item in order.Items)
            {
                var sku = item.Sku ?? item.VariantId;
                await _inventoryService.UnlockStockAsync(item.ProductId, sku, item.Quantity);
            }
        }
        else if (status.Status == "Delivered")
        {
            foreach (var item in order.Items)
            {
                var sku = item.Sku ?? item.VariantId;
                await _inventoryService.CommitStockAsync(item.ProductId, sku, item.Quantity);
            }
        }

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

public class CreateOrderRequest
{
    public List<OrderItem> Items { get; set; } = new();
    public string? PaymentMethod { get; set; }
    public string? ShippingAddress { get; set; }
}
