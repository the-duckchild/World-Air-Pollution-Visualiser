using api.Models.Database;
using Microsoft.EntityFrameworkCore;

namespace api.Database;

public class AirPollutionDbContext : DbContext
{
    public DbSet<StationLocation> StationLocation { get; set; }
    private IConfiguration _configuration;

    public AirPollutionDbContext(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(_configuration["ConnectionStrings:AirPollutionDb"]);
    }
}
