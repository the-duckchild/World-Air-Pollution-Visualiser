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
        /// Comprehensive coordinate sanitization with security logging
        /// </summary>
        public (float Latitude, float Longitude) SanitizeCoordinates(float lat, float lon)
        {
            var originalLat = lat;
            var originalLon = lon;

            // Step 1: Validate float integrity
            if (!IsValidFloat(lat) || !IsValidFloat(lon))
            {
                _logger.LogWarning("Invalid float values detected: lat={Lat}, lon={Lon}", lat, lon);
                throw new ArgumentException("Invalid coordinate values detected.");
            }

            // Step 2: Check for suspicious precision (potential coordinated attack)
            if (HasSuspiciousPrecision(lat) || HasSuspiciousPrecision(lon))
            {
                _logger.LogWarning("Suspicious precision detected: lat={Lat}, lon={Lon}", lat, lon);
            }

            // Step 3: Normalize precision to reasonable level
            lat = NormalizePrecision(lat);
            lon = NormalizePrecision(lon);

            // Step 4: Clamp to valid geographic ranges
            lat = Math.Clamp(lat, -90f, 90f);
            lon = NormalizeLongitude(lon);

            // Step 5: Log if values were significantly modified
            if (Math.Abs(originalLat - lat) > 0.01f || Math.Abs(originalLon - lon) > 0.01f)
            {
                _logger.LogInformation(
                    "Coordinates sanitized: ({OriginalLat},{OriginalLon}) -> ({NewLat},{NewLon})",
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

        private static bool HasSuspiciousPrecision(float value)
        {
            // Check if the value has more than 8 decimal places (suspicious for coordinates)
            var str = value.ToString("F10", CultureInfo.InvariantCulture);
            var decimalIndex = str.IndexOf('.');

            if (decimalIndex == -1)
                return false;

            var decimalPlaces = str.Length - decimalIndex - 1;
            return decimalPlaces > 8;
        }

        private static float NormalizePrecision(float value)
        {
            // Round to 5 decimal places (approximately 1.1 meter accuracy at equator)
            return (float)Math.Round(value, 5);
        }

        private static float NormalizeLongitude(float lon)
        {
            // Clamp to valid range
            lon = Math.Clamp(lon, -180f, 180f);

            // Handle the edge case where 180° should be normalized to -180°
            if (Math.Abs(lon - 180f) < 0.00001f)
                return -180f;

            return lon;
        }

        #endregion
    }
}
