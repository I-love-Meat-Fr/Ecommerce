using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Ecommer.Api.Data;
using Ecommer.Api.Middleware;
using Ecommer.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add JWT config from environment or appsettings
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT_SECRET environment variable or Jwt:Secret config is required");

var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? builder.Configuration["Jwt:Issuer"] ?? "Ecommer.Api";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? builder.Configuration["Jwt:Audience"] ?? "Ecommer.Client";

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Rate limiting for the login endpoint to slow down brute-force attacks.
// 5 attempts per IP per minute, sliding window. On limit exceeded the API returns 429.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("login", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetSlidingWindowLimiter(ip, _ => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 6,
            QueueLimit = 0,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
        });
    });
});

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for the local Vite dev server (5173 by default) and the production
// frontend origin. Add your deployed frontend URL here once you have one
// (e.g. https://florist.vercel.app). The "*" entry is only honored when
// AllowCredentials is false (we don't use cookies here).
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://florist.vn",
                "https://www.florist.vn")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// MongoDB
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<OrderService>();

// Health check that pings MongoDB.
builder.Services.AddHealthChecks()
    .AddCheck<MongoHealthCheck>("mongodb");

var app = builder.Build();

// Run index + seed in background so we don't block startup if Mongo is slow.
// The task is registered with the host's lifetime so it can't be GC'd and
// gets cancelled on shutdown.
var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
var startupLogger = app.Services.GetRequiredService<ILoggerFactory>()
    .CreateLogger("MongoStartup");
var initTask = Task.Run(() => MongoStartup.InitializeAsync(app.Services, startupLogger), lifetime.ApplicationStopping);
_ = initTask.ContinueWith(
    t => startupLogger.LogError(t.Exception, "Mongo startup failed."),
    TaskContinuationOptions.OnlyOnFaulted);

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseSecurityHeaders();
app.UseCors("FrontendDev");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();
app.MapHealthChecks("/health");

// Lightweight test endpoint — no dependencies, used by test-security-headers.ps1
app.MapGet("/ping", () => Results.Ok(new { status = "ok", timestamp = DateTime.UtcNow }));

app.Run();
