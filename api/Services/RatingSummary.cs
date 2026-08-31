namespace Ecommer.Api.Services;

/// <summary>
/// Aggregate rating for a product: average of all review ratings + total count.
/// </summary>
public class RatingSummary
{
    public double Avg { get; set; }
    public int Count { get; set; }
}
