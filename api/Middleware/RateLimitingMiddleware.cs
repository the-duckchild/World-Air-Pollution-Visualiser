using System.Collections.Concurrent;
using System.Net;

namespace api.Middleware
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly int _maxRequests;
        private readonly TimeSpan _timeWindow;
        private readonly ConcurrentDictionary<string, (DateTime FirstRequest, int Count)> _requests;

        public RateLimitingMiddleware(
            RequestDelegate next,
            int maxRequests = 100,
            int timeWindowMinutes = 15
        )
        {
            _next = next;
            _maxRequests = maxRequests;
            _timeWindow = TimeSpan.FromMinutes(timeWindowMinutes);
            _requests = new ConcurrentDictionary<string, (DateTime, int)>();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Get client identifier (IP address + User-Agent for better uniqueness)
            var clientId = GetClientIdentifier(context);

            // Clean up old entries periodically
            CleanupOldEntries();

            // Check rate limit
            if (IsRateLimited(clientId))
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = _timeWindow.TotalSeconds.ToString();
                await context.Response.WriteAsync("Rate limit exceeded. Please try again later.");
                return;
            }

            await _next(context);
        }

        private string GetClientIdentifier(HttpContext context)
        {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var userAgent = context.Request.Headers.UserAgent.ToString();

            // Hash the combination to create a unique but anonymous identifier
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var hashBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(ip + userAgent));
            return Convert.ToBase64String(hashBytes);
        }

        private bool IsRateLimited(string clientId)
        {
            var now = DateTime.UtcNow;

            _requests.AddOrUpdate(
                clientId,
                (now, 1),
                (key, value) =>
                {
                    if (now - value.FirstRequest > _timeWindow)
                    {
                        // Reset the window
                        return (now, 1);
                    }
                    else
                    {
                        // Increment count within current window
                        return (value.FirstRequest, value.Count + 1);
                    }
                }
            );

            return _requests.TryGetValue(clientId, out var entry) && entry.Count > _maxRequests;
        }

        private void CleanupOldEntries()
        {
            var now = DateTime.UtcNow;
            var toRemove = _requests
                .Where(kvp => now - kvp.Value.FirstRequest > _timeWindow)
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (var key in toRemove)
            {
                _requests.TryRemove(key, out _);
            }
        }
    }

    public static class RateLimitingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRateLimiting(
            this IApplicationBuilder builder,
            int maxRequests = 100,
            int timeWindowMinutes = 15
        )
        {
            return builder.UseMiddleware<RateLimitingMiddleware>(maxRequests, timeWindowMinutes);
        }
    }
}
