using api.Middleware;
using api.Repositories;
using dotenv.net;

Console.WriteLine("Starting application...");

var AllowSpecificOrigins = "_AllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

// CRITICAL: Configure to listen on the PORT environment variable for Cloud Run
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
Console.WriteLine($"Configuring to listen on port: {port}");
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
                    .AllowCredentials()
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
                        "https://air-pollution-visualiser-191519804984.europe-west1.run.app"
                    )
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .AllowAnyHeader();
            }
        );
    }
});

// Load .env file only if it exists (won't exist in Docker)
try
{
    Console.WriteLine("Attempting to load .env file...");
    DotEnv.Load();
    Console.WriteLine(".env file loaded successfully");
}
catch (Exception ex)
{
    Console.WriteLine($".env file not found or error loading: {ex.Message}");
    // .env file not found or error loading - continue with environment variables
}

// Add services to the container.
Console.WriteLine("Registering services...");

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

Console.WriteLine("Building application...");
var app = builder.Build();

Console.WriteLine("Configuring middleware pipeline...");

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

Console.WriteLine($"Starting server on http://0.0.0.0:{port}...");
app.Run();
Console.WriteLine("Application stopped.");

// Make Program class public for testing
public partial class Program { }
