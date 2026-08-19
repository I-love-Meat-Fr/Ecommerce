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
}
