using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ecommer.Api.DTOs;
using Ecommer.Api.Models;
using Ecommer.Api.Services;

namespace Ecommer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    private string? CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

    private bool IsAdmin => User.FindFirstValue(ClaimTypes.Role) == "Admin";

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<UserPublicDto>>> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users.Select(UserPublicDto.From).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserPublicDto>> GetById(string id)
    {
        if (CurrentUserId != id && !IsAdmin)
            return Forbid();

        var user = await _userService.GetByIdAsync(id);
        if (user == null)
            return NotFound();
        return Ok(UserPublicDto.From(user));
    }

    [HttpGet("email/{email}")]
    public async Task<ActionResult<UserPublicDto>> GetByEmail(string email)
    {
        var targetUser = await _userService.GetByEmailAsync(email);
        if (targetUser == null)
            return NotFound();

        if (targetUser.Id != CurrentUserId && !IsAdmin)
            return Forbid();

        return Ok(UserPublicDto.From(targetUser));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserPublicDto>> Create([FromBody] UserCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email and password are required" });

        var existing = await _userService.GetByEmailAsync(dto.Email);
        if (existing != null)
            return Conflict(new { message = "Email already registered" });

        var user = new User
        {
            Email = dto.Email.Trim(),
            FullName = dto.FullName?.Trim() ?? string.Empty,
            Phone = dto.Phone,
            Address = dto.Address,
            Role = string.IsNullOrWhiteSpace(dto.Role) ? "User" : dto.Role,
            IsActive = dto.IsActive,
        };
        var created = await _userService.CreateAsync(user, dto.Password);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, UserPublicDto.From(created));
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Update(string id, [FromBody] UserUpdateDto dto)
    {
        var success = await _userService.UpdateAsync(id, dto);
        if (!success)
            return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        // Admins shouldn't be able to lock themselves out by deleting their own account.
        if (id == CurrentUserId)
            return BadRequest(new { message = "Bạn không thể xóa tài khoản của chính mình." });

        var success = await _userService.DeleteAsync(id);
        if (!success)
            return NotFound();
        return NoContent();
    }

    // POST /api/users/{id}/change-password
    // Self-service: a logged-in user can change their own password (must supply current).
    // Admins may also reset another user's password by skipping currentPassword.
    [HttpPost("{id}/change-password")]
    public async Task<ActionResult> ChangePassword(string id, [FromBody] ChangePasswordDto dto)
    {
        if (CurrentUserId != id && !IsAdmin)
            return Forbid();

        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự." });

        bool ok;
        if (IsAdmin && CurrentUserId != id && string.IsNullOrEmpty(dto.CurrentPassword))
        {
            // Admin-initiated reset — no current password required.
            var newHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            ok = await _userService.AdminResetPasswordAsync(id, newHash);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                return BadRequest(new { message = "Vui lòng nhập mật khẩu hiện tại." });

            ok = await _userService.ChangePasswordAsync(id, dto.CurrentPassword, dto.NewPassword);
            if (!ok)
                return BadRequest(new { message = "Mật khẩu hiện tại không đúng." });
        }

        return ok ? NoContent() : NotFound();
    }
}