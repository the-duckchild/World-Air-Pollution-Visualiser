# Air Quality API Security Implementation

## Security Measures Implemented

### 1. Input Validation & Sanitization
- **Coordinate Range Validation**: Latitude (-90 to 90°), Longitude (-180 to 180°)
- **Precision Control**: Rounds coordinates to 5 decimal places (≈1 meter accuracy)
- **Type Safety**: Ensures proper float parsing and validation
- **Error Handling**: Returns appropriate HTTP status codes for invalid inputs

### 2. Rate Limiting
- **Request Limits**: 60 requests per 15-minute window per client
- **Client Identification**: Uses hashed IP + User-Agent combination
- **Automatic Cleanup**: Removes expired rate limit entries
- **HTTP 429 Response**: Returns "Too Many Requests" with Retry-After header

### 3. Security Headers
- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-Frame-Options**: `DENY` - Prevents clickjacking attacks
- **X-XSS-Protection**: `1; mode=block` - Enables XSS filtering
- **Content-Security-Policy**: Restricts resource loading to prevent XSS
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Controls referrer information
- **Server Header Removal**: Hides server implementation details

### 4. CORS Configuration
- **Development**: Restricted to `localhost:5173` only
- **Credential Support**: Allows credentials for authenticated requests
- **Method Restrictions**: Configurable allowed HTTP methods
- **Header Control**: Manages allowed request/response headers

### 5. HTTPS Enforcement
- **Production Redirect**: Forces HTTPS in production environments
- **Certificate Validation**: Ensures encrypted communication
- **Transport Security**: Protects data in transit

### 6. Error Handling
- **Information Disclosure Prevention**: Generic error messages for security
- **Logging Integration**: Structured logging for security monitoring
- **Exception Management**: Proper exception handling without exposing internals

## API Endpoint Security: `/air-quality-data-by-latlon/{lat}/{lon}`

### Validation Rules
```csharp
// Latitude validation
if (lat < -90 || lat > 90) return BadRequest("Invalid latitude");

// Longitude validation  
if (lon < -180 || lon > 180) return BadRequest("Invalid longitude");

// Precision limiting (prevents ultra-precise attacks)
lat = Math.Round(lat, 5);
lon = Math.Round(lon, 5);
```

### Rate Limiting
- **Per-Client Limit**: 60 requests per 15 minutes
- **Identification**: Hashed IP + User-Agent
- **Response**: HTTP 429 with retry information

### Response Security
- **Null Handling**: Returns 404 for no data found
- **Exception Hiding**: Returns generic 500 errors
- **Data Sanitization**: Ensures clean response data

## Additional Security Recommendations

### 1. Authentication & Authorization
```csharp
// Future implementation
[Authorize]
[HttpGet("air-quality-data-by-latlon/{lat}/{lon}")]
```

### 2. API Versioning
```csharp
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/air-quality")]
```

### 3. Request Logging & Monitoring
```csharp
// Log all coordinate requests for monitoring
_logger.LogInformation("AQI request: {ClientId} - {Lat}, {Lon}", clientId, lat, lon);
```

### 4. Geographic Restrictions
```csharp
// Optional: Restrict to specific geographic regions
if (!IsWithinAllowedRegion(lat, lon))
{
    return Forbidden("Location not supported");
}
```

### 5. Data Caching
```csharp
// Implement caching to reduce load and prevent abuse
[ResponseCache(Duration = 300)] // 5-minute cache
```

## Security Benefits

1. **Input Attack Prevention**: Validates all coordinate inputs
2. **DoS Protection**: Rate limiting prevents API abuse
3. **Data Integrity**: Ensures coordinate precision limits
4. **Transport Security**: HTTPS and security headers
5. **Information Disclosure Prevention**: Generic error responses
6. **Client Tracking**: Monitors usage patterns for security analysis
7. **Cross-Origin Protection**: CORS restricts unauthorized access

## Monitoring & Alerts

### Recommended Monitoring
- Failed validation attempts (potential attacks)
- Rate limit violations (abuse patterns)
- Geographic clustering (unusual usage)
- Error rate spikes (system issues)
- Response time degradation (performance impact)

### Security Logs
- All coordinate requests with client identification
- Rate limit violations and client patterns
- Validation failures and attack attempts
- System errors and performance metrics