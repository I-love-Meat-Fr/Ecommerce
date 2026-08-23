using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ecommer.Api.DTOs;
using Ecommer.Api.Models;
using Ecommer.Api.Services;

namespace Ecommer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserService _userService;
    private readonly JwtService _jwtService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(UserService userService, JwtService jwtService, ILogger<AuthController> logger)
    {
        _userService = userService;
        _jwtService = jwtService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var existingUser = await _userService.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            // Email enumeration: log attempt at Info with email so we can spot
            // bots probing valid addresses, but return a generic 409.
            _logger.LogInformation("Register attempt with existing email: {Email}", request.Email);
            return Conflict(new { message = "Email already registered" });
        }

        var user = new User
        {
            Email = request.Email,
            FullName = request.FullName,
            Phone = request.Phone,
            Address = request.Address,
            IsActive = true
        };

        await _userService.CreateAsync(user, request.Password);
        _logger.LogInformation("User registered: {Email}", request.Email);

        var (token, expiresAt) = _jwtService.GenerateToken(user.Id!, user.Email, user.Role);

        return Ok(new AuthResponse(token, user.Email, user.FullName, user.Role, expiresAt));
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        var user = await _userService.GetByEmailAsync(request.Email);
        if (user == null)
        {
            // Do NOT distinguish "user not found" from "wrong password" in the
            // response. Log internally so operators can correlate brute-force.
            _logger.LogWarning("Failed login (no such user): {Email} from {Ip}", request.Email, ip);
            return Unauthorized(new { message = "Invalid email or password" });
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Failed login (deactivated): {Email} from {Ip}", request.Email, ip);
            return Unauthorized(new { message = "Account is deactivated" });
        }

        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            _logger.LogWarning("Failed login (no password set): {Email} from {Ip}", request.Email, ip);
            return Unauthorized(new { message = "Invalid email or password" });
        }

        if (!_userService.VerifyPassword(user.PasswordHash, request.Password))
        {
            // Never log the supplied password or the stored hash.
            _logger.LogWarning("Failed login (bad password): {Email} from {Ip}", request.Email, ip);
            return Unauthorized(new { message = "Invalid email or password" });
        }

        _logger.LogInformation("Login success: {Email} from {Ip}", request.Email, ip);

        var (token, expiresAt) = _jwtService.GenerateToken(user.Id!, user.Email, user.Role);

        return Ok(new AuthResponse(token, user.Email, user.FullName, user.Role, expiresAt));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponse>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var user = await _userService.GetByIdAsync(userId);
        if (user == null) return NotFound(new { message = "User not found" });

        var expiryUnix = User.FindFirstValue("exp");
        var expiresAt = DateTime.UtcNow;
        if (long.TryParse(expiryUnix, out var exp))
        {
            expiresAt = DateTimeOffset.FromUnixTimeSeconds(exp).UtcDateTime;
        }

        return Ok(new AuthResponse(
            Token: string.Empty,
            Email: user.Email,
            FullName: user.FullName,
            Role: user.Role,
            ExpiresAt: expiresAt
        ));
    }
}
