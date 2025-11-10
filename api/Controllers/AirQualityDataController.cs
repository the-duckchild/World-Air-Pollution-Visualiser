using api.Models.Dto;
using api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
public class AirQualityDataController : ControllerBase
{
    private readonly IAirQualityDataRepository _airQualityDataRepository;

    public AirQualityDataController(IAirQualityDataRepository airQualityDataRepository)
    {
        _airQualityDataRepository = airQualityDataRepository;
    }

    [HttpGet("air-quality-data-by-uid/{uid}")]
    public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByUID(string uid)
    {
        var result = await _airQualityDataRepository.GetDataByUID(uid);

        return Ok(result);
    }

    [HttpGet("air-quality-data-by-latlon/{lat}/{lon}")]
    public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByLatLon(float lat, float lon)
    {
        var result = await _airQualityDataRepository.GetDataByLatLon(lat, lon);

        return Ok(result);
    }

    [HttpPost("air-quality-data-by-uids")]
    public async Task<ActionResult<Dictionary<string, AirQualityDataSetDto>>> AirQualityByUIDs(
        [FromBody] List<string> uids
    )
    {
        var tasks = uids.Select(uid => _airQualityDataRepository.GetDataByUID(uid));
        var results = await Task.WhenAll(tasks);

        var dictionary = uids.Zip(results, (uid, data) => new { uid, data })
            .ToDictionary(x => x.uid, x => x.data);

        return Ok(dictionary);
    }
};
