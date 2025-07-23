using api.Database;
using api.Models.Database;
using Microsoft.EntityFrameworkCore;

namespace api.Repositories;

public interface IStationLocationRepository
{
    Task<IEnumerable<StationLocation>> GetStationLocations();
}

public class StationLocationRepository : IStationLocationRepository
{
    private readonly AirPollutionDbContext _context;

    public StationLocationRepository(AirPollutionDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StationLocation>> GetStationLocations()
    {
        return await _context.StationLocation.ToListAsync();
    }
}
