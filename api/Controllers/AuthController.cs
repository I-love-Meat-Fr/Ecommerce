using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public AuthController(UserService userService, JwtService jwtService)
    {
        _userService = userService;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var existingUser = await _userService.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
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

        var (token, expiresAt) = _jwtService.GenerateToken(user.Id!, user.Email);

        return Ok(new AuthResponse(token, user.Email, user.FullName, expiresAt));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userService.GetByEmailAsync(request.Email);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new { message = "Account is deactivated" });
        }

        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        if (!_userService.VerifyPassword(user.PasswordHash, request.Password))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var (token, expiresAt) = _jwtService.GenerateToken(user.Id!, user.Email);

        return Ok(new AuthResponse(token, user.Email, user.FullName, expiresAt));
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
            ExpiresAt: expiresAt
        ));
    }
}
