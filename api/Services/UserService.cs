using MongoDB.Driver;
using Ecommer.Api.Data;
using Ecommer.Api.Models;

namespace Ecommer.Api.Services;

public class UserService
{
    private readonly IMongoCollection<User> _users;

    public UserService(MongoDbContext context)
    {
        _users = context.Users;
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _users.Find(_ => true).ToListAsync();
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
    }

    public async Task<User> CreateAsync(User user, string? plainPassword = null)
    {
        user.CreatedAt = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(plainPassword))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(plainPassword);
        }
        await _users.InsertOneAsync(user);
        return user;
    }

    public async Task<bool> UpdateAsync(string id, UserUpdateDto dto)
    {
        var updates = new List<UpdateDefinition<User>>();

        if (dto.FullName != null) updates.Add(Builders<User>.Update.Set(u => u.FullName, dto.FullName));
        if (dto.Phone != null) updates.Add(Builders<User>.Update.Set(u => u.Phone, dto.Phone));
        if (dto.Address != null) updates.Add(Builders<User>.Update.Set(u => u.Address, dto.Address));
        if (dto.Role != null) updates.Add(Builders<User>.Update.Set(u => u.Role, dto.Role));
        if (dto.IsActive.HasValue) updates.Add(Builders<User>.Update.Set(u => u.IsActive, dto.IsActive.Value));

        var update = Builders<User>.Update.Combine(updates);
        var result = await _users.UpdateOneAsync(u => u.Id == id, update);
        return result.MatchedCount > 0;
    }

    // Admin-initiated password reset: write the already-hashed password directly.
    // Callers must have authorized the request before calling this.
    public async Task<bool> AdminResetPasswordAsync(string id, string newPasswordHash)
    {
        var result = await _users.UpdateOneAsync(
            u => u.Id == id,
            Builders<User>.Update.Set(u => u.PasswordHash, newPasswordHash));
        return result.MatchedCount > 0;
    }

    // Verify the supplied current password, then replace the stored hash.
    // Caller (controller) is responsible for proving identity via JWT.
    public async Task<bool> ChangePasswordAsync(string id, string currentPassword, string newPassword)
    {
        var user = await GetByIdAsync(id);
        if (user == null) return false;
        if (!VerifyPassword(user.PasswordHash, currentPassword)) return false;

        var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        var result = await _users.UpdateOneAsync(
            u => u.Id == id,
            Builders<User>.Update.Set(u => u.PasswordHash, newHash));
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _users.DeleteOneAsync(u => u.Id == id);
        return result.DeletedCount > 0;
    }

    public bool VerifyPassword(string passwordHash, string plainPassword)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(plainPassword, passwordHash);
        }
        catch
        {
            return false;
        }
    }
}
