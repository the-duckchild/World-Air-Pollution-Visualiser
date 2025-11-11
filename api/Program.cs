using api.Repositories;
using api.Middleware;
using dotenv.net;

var AllowSpecificOrigins = "_AllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

// CRITICAL: Configure to listen on the PORT environment variable
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(int.Parse(port));
});

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
                    .WithOrigins("https://air-pollution-visualiser.netlify.app", "https://air-pollution-visualiser-191519804984.europe-west1.run.app")
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
    DotEnv.Load();
}
catch
{
    // .env file not found or error loading - continue with environment variables
}

// Add services to the container.

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

var app = builder.Build();

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

app.Run();

// Make Program class public for testing
public partial class Program { }
