namespace Ecommer.Api.DTOs;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string Email,
    string Password,
    string FullName,
    string? Phone = null,
    string? Address = null
);

public record AuthResponse(
    string Token,
    string Email,
    string FullName,
    DateTime ExpiresAt
);
