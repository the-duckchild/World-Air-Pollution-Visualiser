using System.Globalization;
using System.Text.RegularExpressions;

namespace api.Services
{
    public interface IInputSanitizationService
    {
        (float Latitude, float Longitude) SanitizeCoordinates(float lat, float lon);
        string SanitizeString(string input, int maxLength = 100);
        int SanitizeInteger(int value, int min = int.MinValue, int max = int.MaxValue);
    }

    public class InputSanitizationService : IInputSanitizationService
    {
        private readonly ILogger<InputSanitizationService> _logger;

        public InputSanitizationService(ILogger<InputSanitizationService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Validates and sanitizes coordinate inputs.
        /// Returns explicit validation errors for out-of-range coordinates rather than silently clamping.
        /// Normalizes precision and handles edge cases like NaN/Infinity.
        /// </summary>
        public (float Latitude, float Longitude) SanitizeCoordinates(float lat, float lon)
        {
            var originalLat = lat;
            var originalLon = lon;

            // Step 1: Validate float integrity (reject NaN, Infinity)
            if (!IsValidFloat(lat) || !IsValidFloat(lon))
            {
                _logger.LogWarning("Invalid float values detected: lat={Lat}, lon={Lon}", lat, lon);
                throw new ArgumentException("Invalid coordinate values detected.");
            }

            // Step 2: Validate geographic ranges - return explicit errors, don't silently clamp
            if (lat < -90f || lat > 90f)
            {
                _logger.LogWarning("Latitude out of range: {Lat}", lat);
                throw new ArgumentException("Latitude must be between -90 and 90.");
            }

            if (lon < -180f || lon > 180f)
            {
                _logger.LogWarning("Longitude out of range: {Lon}", lon);
                throw new ArgumentException("Longitude must be between -180 and 180.");
            }

            // Step 3: Normalize precision to reasonable level (5 decimal places ≈ 1m accuracy)
            lat = NormalizePrecision(lat);
            lon = NormalizePrecision(lon);

            // Step 4: Handle edge case where 180° should be normalized to -180°
            if (Math.Abs(lon - 180f) < 0.00001f)
                lon = -180f;

            // Step 5: Log if precision normalization changed values significantly
            if (Math.Abs(originalLat - lat) > 0.00001f || Math.Abs(originalLon - lon) > 0.00001f)
            {
                _logger.LogDebug(
                    "Coordinates precision normalized: ({OriginalLat},{OriginalLon}) -> ({NewLat},{NewLon})",
                    originalLat,
                    originalLon,
                    lat,
                    lon
                );
            }

            return (lat, lon);
        }

        /// <summary>
        /// Sanitizes string inputs to prevent injection attacks
        /// </summary>
        public string SanitizeString(string input, int maxLength = 100)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            // Remove potentially dangerous characters
            var sanitized = Regex.Replace(input, @"[<>""'%;()&+]", "");

            // Trim whitespace and limit length
            sanitized = sanitized.Trim();
            if (sanitized.Length > maxLength)
            {
                sanitized = sanitized[..maxLength];
                _logger.LogWarning("String input truncated to {MaxLength} characters", maxLength);
            }

            // Remove control characters
            sanitized = Regex.Replace(sanitized, @"[\x00-\x1F\x7F]", "");

            return sanitized;
        }

        /// <summary>
        /// Sanitizes integer inputs with bounds checking
        /// </summary>
        public int SanitizeInteger(int value, int min = int.MinValue, int max = int.MaxValue)
        {
            var originalValue = value;
            value = Math.Clamp(value, min, max);

            if (originalValue != value)
            {
                _logger.LogWarning(
                    "Integer value clamped: {Original} -> {Sanitized} (bounds: {Min}-{Max})",
                    originalValue,
                    value,
                    min,
                    max
                );
            }

            return value;
        }

        #region Private Helper Methods

        private static bool IsValidFloat(float value)
        {
            return !float.IsNaN(value)
                && !float.IsInfinity(value)
                && !float.IsNegativeInfinity(value)
                && !float.IsPositiveInfinity(value);
        }

        private static float NormalizePrecision(float value)
        {
            // Round to 5 decimal places (approximately 1.1 meter accuracy at equator)
            // This is sufficient for location-based queries while avoiding floating-point noise
            return (float)Math.Round(value, 5);
        }

        #endregion
    }
}
