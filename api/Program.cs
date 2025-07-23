using api.Database;
using api.Helpers;
using api.Models.Database;
using api.Repositories;
using dotenv.net;


var builder = WebApplication.CreateBuilder(args);

DotEnv.Load();

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<IStationLocationRepository, StationLocationRepository>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AirPollutionDbContext>();
builder.Services.AddSwaggerGen(options => {
    options.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
    options.IgnoreObsoleteActions();
    options.IgnoreObsoleteProperties();
    options.CustomSchemaIds(type => type.FullName);
});

var app = builder.Build();

using (var serviceScope = app.Services.CreateScope())
{
    var serviceProvider = serviceScope.ServiceProvider;
    var dbContext = serviceProvider.GetRequiredService<AirPollutionDbContext>();

    if (!dbContext.StationLocation.Any())
    {
        var csvFilePath = "../api/Database/Data/Air Pollution Stations.csv";
        var stations = StationReader.ReadStationsFromCsv(csvFilePath);
        dbContext.StationLocation.AddRange(stations);
        dbContext.SaveChanges();
    }

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();

    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
