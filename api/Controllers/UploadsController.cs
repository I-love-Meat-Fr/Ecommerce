using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;

namespace Ecommer.Api.Controllers;

/// <summary>
/// Image upload endpoints for the admin panel.
/// <para>
/// By default files are written to <c>wwwroot/uploads/yyyy/mm/{guid}.{ext}</c>
/// and served as static assets under <c>/uploads/...</c> by Program.cs.
/// </para>
/// <para>
/// If the <c>UPLOADS_PATH</c> environment variable is set (recommended for
/// Railway / Render / any ephemeral container), the controller writes into
/// that directory instead. The matching <see cref="IFileProvider"/> is wired
/// up in Program.cs so the same <c>/uploads/...</c> URL keeps working.
/// </para>
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UploadsController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<UploadsController> _logger;

    // 5 MB per file — plenty for product photography, blocks accidental
    // video / PDF uploads.
    private const long MaxFileSize = 5L * 1024 * 1024;

    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };

    private static readonly HashSet<string> AllowedContentTypes =
        new(StringComparer.OrdinalIgnoreCase) { "image/jpeg", "image/png", "image/webp" };

    public UploadsController(IWebHostEnvironment env, ILogger<UploadsController> logger)
    {
        _env = env;
        _logger = logger;
    }

    /// <summary>
    /// Resolves the on-disk root for uploaded files. Honors <c>UPLOADS_PATH</c>
    /// if set, otherwise falls back to <c>wwwroot/uploads</c>. Falls back to a
    /// temp-friendly path if even WebRootPath is null (rare unit-test setups).
    /// </summary>
    private string GetUploadsRoot()
    {
        var overridePath = Environment.GetEnvironmentVariable("UPLOADS_PATH");
        if (!string.IsNullOrWhiteSpace(overridePath))
        {
            return overridePath;
        }

        var webRoot = _env.WebRootPath;
        if (!string.IsNullOrEmpty(webRoot))
        {
            return Path.Combine(webRoot, "uploads");
        }

        return Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
    }

    /// <summary>
    /// Upload a single image file under the "file" form field.
    /// Returns { url } where url is a relative path like
    /// "/uploads/2026/08/abc123.jpg" — prepend your origin to render.
    /// </summary>
    [HttpPost]
    [RequestSizeLimit(MaxFileSize + 1024)]
    public async Task<ActionResult<object>> Upload(IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Không có file được tải lên." });

        if (file.Length > MaxFileSize)
            return BadRequest(new { message = $"File vượt quá {MaxFileSize / 1024 / 1024} MB." });

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
            return BadRequest(new { message = "Chỉ chấp nhận định dạng .jpg, .jpeg, .png, .webp." });

        if (!string.IsNullOrEmpty(file.ContentType) && !AllowedContentTypes.Contains(file.ContentType))
            return BadRequest(new { message = $"Content-Type không hợp lệ: {file.ContentType}" });

        var now = DateTime.UtcNow;
        var uploadsRoot = GetUploadsRoot();
        var monthDir = Path.Combine(uploadsRoot, now.ToString("yyyy"), now.ToString("MM"));
        Directory.CreateDirectory(monthDir);

        // Sanitize extension: trim and lowercase to keep the on-disk name safe.
        var safeExt = ext.ToLowerInvariant();
        var fileName = $"{Guid.NewGuid():N}{safeExt}";
        var fullPath = Path.Combine(monthDir, fileName);

        try
        {
            await using (var stream = System.IO.File.Create(fullPath))
            {
                await file.CopyToAsync(stream, ct);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write upload to {Path}", fullPath);
            return StatusCode(500, new { message = "Lưu file thất lỗi." });
        }

        var url = $"/uploads/{now:yyyy}/{now:MM}/{fileName}";
        return Ok(new { url, size = file.Length });
    }

    /// <summary>
    /// Delete a previously uploaded file. The url must live under /uploads/
    /// (we reject anything else to avoid path-traversal cleanup).
    /// </summary>
    [HttpDelete]
    public ActionResult Delete([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return BadRequest(new { message = "Thiếu url." });

        // Accept either "/uploads/foo.jpg" or "uploads/foo.jpg".
        var relative = url.TrimStart('/');
        if (!relative.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "url không hợp lệ." });

        var uploadsRoot = GetUploadsRoot();
        Directory.CreateDirectory(uploadsRoot); // ensure root exists so GetFullPath is safe
        var fullPath = Path.GetFullPath(Path.Combine(uploadsRoot, relative.Substring("uploads/".Length)));
        var rootFull = uploadsRoot.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                     + Path.DirectorySeparatorChar;
        var rootBare = uploadsRoot.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        if (!fullPath.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase) &&
            !fullPath.Equals(rootBare, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "url nằm ngoài thư mục uploads." });
        }

        if (!System.IO.File.Exists(fullPath))
            return NotFound();

        try
        {
            System.IO.File.Delete(fullPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete upload {Path}", fullPath);
            return StatusCode(500, new { message = "Xóa file thất lỗi." });
        }

        return NoContent();
    }
}
