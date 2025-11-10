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
        // Input validation
        if (string.IsNullOrWhiteSpace(uid))
        {
            return BadRequest("UID cannot be null or empty");
        }

        // Validate UID format and length
        var validUidPattern = new System.Text.RegularExpressions.Regex(@"^[a-zA-Z0-9\-_]+$");
        if (!validUidPattern.IsMatch(uid) || uid.Length > 100)
        {
            return BadRequest("Invalid UID format");
        }

        var result = await _airQualityDataRepository.GetDataByUID(uid);

        return Ok(result);
    }

    [HttpGet("air-quality-data-by-latlon/{lat}/{lon}")]
    public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByLatLon(float lat, float lon)
    {
        // Validate latitude and longitude ranges
        if (lat < -90 || lat > 90)
        {
            return BadRequest("Latitude must be between -90 and 90");
        }

        if (lon < -180 || lon > 180)
        {
            return BadRequest("Longitude must be between -180 and 180");
        }

        var result = await _airQualityDataRepository.GetDataByLatLon(lat, lon);

        return Ok(result);
    }

    [HttpPost("air-quality-data-by-uids")]
    public async Task<ActionResult<Dictionary<string, AirQualityDataSetDto>>> AirQualityByUIDs(
        [FromBody] List<string> uids
    )
    {
        // Input validation
        if (uids == null || uids.Count == 0)
        {
            return BadRequest("UIDs list cannot be null or empty");
        }

        // Limit the number of UIDs to prevent DoS attacks
        const int maxUids = 50;
        if (uids.Count > maxUids)
        {
            return BadRequest($"Cannot process more than {maxUids} UIDs at once");
        }

        // Sanitize UIDs - remove null/empty values and trim whitespace
        var sanitizedUids = uids.Where(uid => !string.IsNullOrWhiteSpace(uid))
            .Select(uid => uid.Trim())
            .Distinct() // Remove duplicates to avoid redundant API calls
            .ToList();

        if (sanitizedUids.Count == 0)
        {
            return BadRequest("No valid UIDs provided");
        }

        // Validate UID format - alphanumeric and common separators only
        var validUidPattern = new System.Text.RegularExpressions.Regex(@"^[a-zA-Z0-9\-_]+$");
        var invalidUids = sanitizedUids.Where(uid => !validUidPattern.IsMatch(uid)).ToList();

        if (invalidUids.Any())
        {
            return BadRequest(
                $"Invalid UID format detected. UIDs must contain only alphanumeric characters, hyphens, and underscores."
            );
        }

        // Limit UID length to prevent buffer overflow attacks
        const int maxUidLength = 100;
        if (sanitizedUids.Any(uid => uid.Length > maxUidLength))
        {
            return BadRequest($"UID length cannot exceed {maxUidLength} characters");
        }

        var tasks = sanitizedUids.Select(uid => _airQualityDataRepository.GetDataByUID(uid));
        var results = await Task.WhenAll(tasks);

        var dictionary = sanitizedUids
            .Zip(results, (uid, data) => new { uid, data })
            .ToDictionary(x => x.uid, x => x.data);

        return Ok(dictionary);
    }
};
