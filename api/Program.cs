using Ecommer.Api.Data;
using Ecommer.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for the local Vite dev server (5173 by default).
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// MongoDB
builder.Services.AddSingleton<MongoDbContext>();
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
app.UseCors("FrontendDev");
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
