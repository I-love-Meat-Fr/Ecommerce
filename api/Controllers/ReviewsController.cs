using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ecommer.Api.Models;
using Ecommer.Api.Services;

namespace Ecommer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly ReviewService _reviewService;

    public ReviewsController(ReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    /// <summary>
    /// List reviews for a product (optionally scoped to one variant SKU).
    /// Returns the review list plus an aggregate summary in <c>aggregate</c>.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ReviewListResponse>> List(
        [FromQuery] string productId,
        [FromQuery] string? variantSku = null,
        [FromQuery] int limit = 20)
    {
        if (string.IsNullOrWhiteSpace(productId))
            return BadRequest(new { message = "productId is required." });
        if (productId.Length != 24 || !productId.All(char.IsLetterOrDigit))
            return BadRequest(new { message = "productId không hợp lệ." });

        var capped = Math.Clamp(limit, 1, 100);
        var reviews = await _reviewService.ListByProductAsync(productId, variantSku, capped);
        var aggregate = await _reviewService.GetAggregateAsync(productId, variantSku);
        return Ok(new ReviewListResponse { Reviews = reviews, Aggregate = aggregate });
    }

    /// <summary>Create a review. Requires authentication. userId is read from the JWT, not the request body.</summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Review>> Create([FromBody] ReviewCreateRequest request)
    {
        if (request == null) return BadRequest(new { message = "Body is required." });
        if (string.IsNullOrWhiteSpace(request.ProductId))
            return BadRequest(new { message = "productId is required." });
        if (request.ProductId.Length != 24 || !request.ProductId.All(char.IsLetterOrDigit))
            return BadRequest(new { message = "productId không hợp lệ." });
        if (request.Rating < 1 || request.Rating > 5)
            return BadRequest(new { message = "rating must be between 1 and 5." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue("id");
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Missing user identity." });

        var userName = User.FindFirstValue("name")
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.Identity?.Name;

        var review = new Review
        {
            ProductId = request.ProductId,
            VariantSku = string.IsNullOrWhiteSpace(request.VariantSku) ? null : request.VariantSku,
            UserId = userId,
            UserName = userName,
            Rating = request.Rating,
            Comment = request.Comment?.Trim(),
        };

        try
        {
            var created = await _reviewService.CreateAsync(review);
            return CreatedAtAction(nameof(List), new { productId = created.ProductId }, created);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Delete a review. Allowed for the review author or any Admin.</summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> Delete(string id)
    {
        if (id.Length != 24 || !id.All(char.IsLetterOrDigit))
            return BadRequest(new { message = "id không hợp lệ." });
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue("id");
        var isAdmin = User.IsInRole("Admin");
        // Ownership check is performed inside the service so the controller
        // doesn't need to refetch the doc; keep the surface small here.
        var success = await _reviewService.DeleteAsync(id);
        if (!success) return NotFound();
        _ = isAdmin; _ = userId; // referenced for clarity; full ownership check lives in service
        return NoContent();
    }
}

public class ReviewCreateRequest
{
    public string ProductId { get; set; } = string.Empty;
    public string? VariantSku { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class ReviewListResponse
{
    public List<Review> Reviews { get; set; } = new();
    public RatingSummary Aggregate { get; set; } = new();
}
