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
    public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByUID(int uid)
    {
        var result = await _airQualityDataRepository.GetDataByUID(uid);

        return Ok(result);
    }
};
