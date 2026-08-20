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

    public OrdersController(OrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<Order>>> GetAll([FromQuery] string? userId = null)
    {
        if (!string.IsNullOrEmpty(userId))
        {
            return Ok(await _orderService.GetByUserIdAsync(userId));
        }
        return Ok(await _orderService.GetAllAsync());
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<Order>> GetById(string id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order == null)
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

        order.UserId = userId;
        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);
        var created = await _orderService.CreateAsync(order);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateStatus(string id, [FromBody] StatusUpdate status)
    {
        var success = await _orderService.UpdateStatusAsync(id, status.Status);
        if (!success)
            return NotFound();
        return NoContent();
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
}
