using Microsoft.AspNetCore.Mvc;
using api.Models.Database;
using api.Repositories;

namespace api.Controllers;



[ApiController]
[Route("[controller]")]
public class StationLocationController : ControllerBase
{
    private readonly IStationLocationRepository _stationLocationRepository;

    public StationLocationController(IStationLocationRepository stationLocationRepository)
    {
        _stationLocationRepository = stationLocationRepository;
    }

    public async Task<ActionResult<IEnumerable<StationLocation>>> GetStations()
    {
        var result = await _stationLocationRepository.GetStationLocations();

        return Ok(result);
    }
}
