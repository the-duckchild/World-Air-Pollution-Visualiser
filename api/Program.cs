using api.Middleware;
using api.Repositories;
using dotenv.net;

var builder = WebApplication.CreateBuilder(args);

// Configure logging to stdout for Cloud Run
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

var logger = LoggerFactory.Create(config => 
{
    config.AddConsole();
}).CreateLogger("Startup");

logger.LogInformation("=== Application Starting ===");

var AllowSpecificOrigins = "_AllowSpecificOrigins";

// CRITICAL: Configure to listen on the PORT environment variable for Cloud Run
// In development, use port 5090; in production, use PORT env var (Cloud Run provides 8080)
var port = builder.Environment.IsDevelopment() 
    ? "5090" 
    : (Environment.GetEnvironmentVariable("PORT") ?? "8080");
logger.LogInformation($"Configuring to listen on port: {port}");
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddCors(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.AddPolicy(
            name: AllowSpecificOrigins,
            policy =>
            {
                policy
                    .WithOrigins("http://localhost:5173")
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            }
        );
    }
    else
    {
        // Production: Allow requests from your frontend URL
        options.AddPolicy(
            name: AllowSpecificOrigins,
            policy =>
            {
                policy
                    .WithOrigins(
                        "https://air-pollution-visualiser.netlify.app",
                        "https://worldairqualityvisualiser.online",
                        "https://air-pollution-visualiser-191519804984.europe-west1.run.app"
                    )
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            }
        );
    }
});

// Load .env file only if it exists (won't exist in Docker)
try
{
    logger.LogInformation("Attempting to load .env file...");
    DotEnv.Load();
    logger.LogInformation(".env file loaded successfully");
}
catch (Exception ex)
{
    logger.LogWarning($".env file not found or error loading: {ex.Message}");
    // .env file not found or error loading - continue with environment variables
}

// Add services to the container.
logger.LogInformation("Registering services...");

builder.Services.AddControllers();
builder.Services.AddScoped<IAirQualityDataRepository, AirQualityDataRepository>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(options =>
{
    options.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
    options.IgnoreObsoleteActions();
    options.IgnoreObsoleteProperties();
    options.CustomSchemaIds(type => type.FullName);
});

logger.LogInformation("Building application...");
var app = builder.Build();

logger.LogInformation("Configuring middleware pipeline...");

// Add a simple health check endpoint
app.MapGet("/", () => "API is running");
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRateLimiting();

app.UseCors(AllowSpecificOrigins);

// Don't use HTTPS redirection - Cloud Run handles HTTPS termination
// if (!app.Environment.IsDevelopment())
// {
//     app.UseHttpsRedirection();
// }

app.UseAuthorization();

app.MapControllers();

logger.LogInformation($"=== Starting server on http://0.0.0.0:{port} ===");
app.Run();
logger.LogInformation("Application stopped.");

// Make Program class public for testing
public partial class Program { }
