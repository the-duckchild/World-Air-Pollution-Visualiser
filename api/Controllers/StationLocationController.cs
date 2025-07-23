using api.Migrations;
using api.Models.Database;
using api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
public class StationLocationController : ControllerBase
{
    private readonly IStationLocationRepository _stationLocationRepository;

    public StationLocationController(IStationLocationRepository stationLocationRepository)
    {
        _stationLocationRepository = stationLocationRepository;
    }

    [HttpGet("stations")]
    public async Task<ActionResult<IEnumerable<StationLocation>>> GetStations()
    {
        var result = await _stationLocationRepository.GetStationLocations();

        return Ok(result);
    }
}
