using api.Models.Dto;
using api.Repositories;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace api.Controllers;

[ApiController]
public partial class AirQualityDataController : ControllerBase
{
    private readonly IAirQualityDataRepository _airQualityDataRepository;
    private readonly IInputSanitizationService _sanitizationService;

    [GeneratedRegex(@"^[a-zA-Z0-9\-_]+$")]
    private static partial Regex ValidUidPattern();

    public AirQualityDataController(
        IAirQualityDataRepository airQualityDataRepository,
        IInputSanitizationService sanitizationService)
    {
        _airQualityDataRepository = airQualityDataRepository;
        _sanitizationService = sanitizationService;
    }

    [HttpGet("air-quality-data-by-uid/{uid}")]
    public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByUID(string uid)
    {
        // Input validation
        if (string.IsNullOrWhiteSpace(uid))
        {
            return BadRequest("UID cannot be null or empty");
        }

        // Sanitize the UID input
        var sanitizedUid = _sanitizationService.SanitizeString(uid, maxLength: 100);

        // Validate UID format after sanitization
        if (string.IsNullOrEmpty(sanitizedUid) || !ValidUidPattern().IsMatch(sanitizedUid))
        {
            return BadRequest("Invalid UID format");
        }

        var result = await _airQualityDataRepository.GetDataByUID(sanitizedUid);

        return Ok(result);
    }

    [HttpGet("air-quality-data-by-latlon/{lat}/{lon}")]
    public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByLatLon(float lat, float lon)
    {
        try
        {
            // Sanitize and validate coordinates
            var (sanitizedLat, sanitizedLon) = _sanitizationService.SanitizeCoordinates(lat, lon);

            var result = await _airQualityDataRepository.GetDataByLatLon(sanitizedLat, sanitizedLon);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
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
        var invalidUids = sanitizedUids.Where(uid => !ValidUidPattern().IsMatch(uid)).ToList();

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
