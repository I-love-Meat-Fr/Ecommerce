using Microsoft.Extensions.Diagnostics.HealthChecks;
using Ecommer.Api.Data;

namespace Ecommer.Api.Data;

/// <summary>
/// Health check that pings MongoDB. Returns Healthy / Unhealthy based on the
/// <c>ping</c> command's <c>ok</c> field.
/// </summary>
public class MongoHealthCheck : IHealthCheck
{
    private readonly MongoDbContext _context;

    public MongoHealthCheck(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var ok = await _context.PingAsync(cancellationToken);
        return ok
            ? HealthCheckResult.Healthy("MongoDB reachable.")
            : HealthCheckResult.Unhealthy("MongoDB ping failed.");
    }
}
