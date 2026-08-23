using Microsoft.AspNetCore.Http;

namespace Ecommer.Api.Middleware;

/// <summary>
/// Adds HTTP security headers to every response.
/// Rationale per header:
///   X-Frame-Options          — blocks this app from being embedded in any iframe (clickjacking defence)
///   X-Content-Type-Options   — browsers must honour Content-Type; no MIME sniffing
///   X-XSS-Protection         — legacy IE/Chrome XSS auditor; deprecated but still respected by some
///   Referrer-Policy          — never leak referrer across origins
///   Permissions-Policy        — disable browser APIs the app does not use
///   Content-Security-Policy   — strict allowlist; inline styles/scripts blocked by default
///   Strict-Transport-Security — enforce HTTPS in production (handled conditionally)
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext ctx)
    {
        var headers = ctx.Response.Headers;

        // Applied on ALL environments
        headers["X-Frame-Options"] = "DENY";
        headers["X-Content-Type-Options"] = "nosniff";
        headers["X-XSS-Protection"] = "1; mode=block";
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()";

        // Content-Security-Policy: strict allowlist
        //   'self'       — same origin (API)
        //   data:        — base64 inline images (e.g. product thumbnails)
        //   'unsafe-inline' NOT included — prevents inline scripts/styles in browser
        headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "img-src 'self' data: https:; " +
            "connect-src 'self' https://florist.vn https://www.florist.vn; " +
            "font-src 'self' data:; " +
            "object-src 'none'; " +
            "frame-ancestors 'none';";

        // HSTS: always-on in production; short max-age in development so dev browsers
        // stay warned even when testing HTTPS locally.
        if (ctx.RequestServices.GetService<IWebHostEnvironment>()?.IsProduction() == true)
        {
            // 1 year, include subdomains, preload (submit to hstspreload.org)
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
        }
        else
        {
            // Development: still tell the browser to enforce HTTPS
            // but with a very short max-age so local cert testing is not broken
            // by a cached HSTS header persisting after cert changes.
            headers["Strict-Transport-Security"] = "max-age=86400; includeSubDomains";
        }

        await _next(ctx);
    }
}

/// <summary>
/// Extension to wire the middleware into the ASP.NET pipeline in Program.cs with a
/// single <c>app.UseSecurityHeaders()</c> call.
/// </summary>
public static class SecurityHeadersMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        => app.UseMiddleware<SecurityHeadersMiddleware>();
}
