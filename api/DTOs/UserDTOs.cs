namespace Ecommer.Api.DTOs;

// Admin creates a user via POST /api/users
public record UserCreateDto(
    string Email,
    string Password,
    string? FullName,
    string? Phone,
    string? Address,
    string? Role,
    bool IsActive = true
);

// Self-service password change (current + new) OR admin reset (new only, no current)
public record ChangePasswordDto(
    string? CurrentPassword,
    string NewPassword
);