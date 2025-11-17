# Code Review Recommendations

## World Air Pollution Visualiser

**Review Date:** November 17, 2025  
**Reviewer:** GitHub Copilot (Code Reviewer Mode)  
**Severity Legend:** 🔴 Blocking | 🟡 Recommended | 🔵 Nit

---

## Executive Summary

This codebase demonstrates solid engineering practices with strong security considerations, comprehensive input validation, and good separation of concerns. The project includes both backend (.NET) and frontend (React/TypeScript) components with reasonable test coverage. However, several areas require attention to improve maintainability, reliability, and adherence to best practices.

**Review Methodology:** This review follows the code review checklist in `docs/engineering/code-review-guidelines.md`, covering PR hygiene, correctness, tests, security, performance, maintainability, architecture, documentation, and accessibility.

**Positive Observations:**

- ✅ Excellent security implementation with rate limiting, input sanitization, and security headers
- ✅ Clear separation of concerns with controller-service-repository pattern
- ✅ Good input validation in API endpoints
- ✅ Comprehensive security documentation (SECURITY.md)
- ✅ Modern frontend stack with TypeScript and React 19
- ✅ Strong focus on security best practices throughout the codebase

**Key Areas for Improvement:**

- **Correctness:** Error handling and exception management in repository layer
- **Tests & Coverage:** Integration test quality and critical path coverage gaps
- **Documentation:** Missing API documentation and environment setup files
- **Configuration:** Externalization and environment-specific settings
- **Performance:** No caching strategy for external API calls
- **Maintainability:** Component complexity and unused code

---

## Review Approach

This review follows the principles outlined in `docs/engineering/code-review-guidelines.md`:

### ✅ Be Kind and Constructive

- Findings focus on improving code quality, not criticizing authors
- Each issue includes clear rationale tied to project standards
- Positive observations highlighted throughout

### ✅ Ask Questions

- Findings formatted as observations with explanations
- References to authoritative documentation provided
- Context given for why changes are recommended

### ✅ Offer Alternatives

- Every blocking/recommended issue includes concrete fix examples
- Code snippets demonstrate the recommended approach
- Multiple solution paths suggested where applicable

### ✅ Automate

- Several issues (nits) could be caught by linters/formatters
- Recommendations include tooling suggestions (ESLint, Zod, etc.)
- References static analysis best practices from project instructions

**Severity Taxonomy Applied:**

- **Blocking (🔴):** Must fix before merge - correctness, security, policy violations
- **Recommended (🟡):** Improves quality/maintainability but not required for merge  
- **Nit (🔵):** Minor suggestions or style that linters could handle

---

## Findings by Review Checklist Category

This section maps findings to the code review checklist in `docs/engineering/code-review-guidelines.md`.

### 1. PR Hygiene and Scope ✅

**Status:** Good

- Clear project structure and organization
- Reasonable separation of concerns
- No issues identified in this area

### 2. Correctness and Behavior ⚠️

**Issues Found:**

- 🔴 **Blocking:** Repository exception handling doesn't properly handle external API failures, null responses, or HTTP errors
- 🔴 **Blocking:** Repository returns HTTP 200 even when the upstream WAQI API reports `status: "error"`, so client code treats failures as success
- 🔴 **Blocking:** Integration tests accept 500 errors as success, masking correctness issues
- 🟡 **Recommended:** No explicit error handling for edge cases like empty UID lists or malformed coordinates

**Details:** See "Backend Issues: Exception Handling in Repository Layer", "Backend Issues: API Error Responses Are Treated as Success", and "Testing Issues: Integration Tests Don't Validate Responses"

### 3. Tests and Coverage ⚠️

**Issues Found:**

- 🔴 **Blocking:** Integration tests only validate status codes, not response structure or data
- 🟡 **Recommended:** Missing tests for critical error paths (rate limiting, security headers, external API failures)
- 🟡 **Recommended:** No frontend tests for retry logic, error states, or loading states
- 🟡 **Recommended:** Integration tests hit the live WAQI API, creating flakiness, consuming quota, and violating the hermetic test guidance in `.github/copilot-instructions.md#quality-policy`
- 🔵 **Nit:** Generic test file name (`UnitTest1.cs`)

**Coverage Status:** Current tests exist but don't meet the 100% requirement for hot/error/security paths per `.github/copilot-instructions.md#quality-policy`.

**Details:** See "Testing Issues" section

### 4. Security ⚠️

**Issues Found:**

- 🔴 **Blocking:** SecurityHeadersMiddleware implemented but not registered, leaving API vulnerable
- 🔴 **Blocking:** API key could be logged by RestSharp in full URLs
- 🟡 **Recommended:** HTTP used instead of HTTPS for external API calls, exposing tokens in transit
- 🟡 **Recommended:** InputSanitizationService created but never used
- 🟡 **Recommended:** Manual validation instead of validation attributes (less idiomatic, more error-prone)

**Positive Notes:**

- Excellent rate limiting implementation
- Comprehensive input validation in controllers
- Well-documented security measures in SECURITY.md
- Proper CORS configuration

**Details:** See "Backend Issues: SecurityHeadersMiddleware Not Registered" and "Security Issues" section

### 5. Performance and Reliability ⚠️

**Issues Found:**

- 🟡 **Recommended:** No caching strategy - every request hits external API
- 🟡 **Recommended:** Bulk UID endpoint runs unlimited parallel requests without throttling
- 🟡 **Recommended:** Frontend API client lacks retry logic or timeout handling
- 🟡 **Recommended:** No circuit breaker for external API failures

**Impact:** Could lead to rate limiting from external API, excessive costs, and poor user experience during transient failures.

**Details:** See "Performance Issues" section

### 6. Maintainability and Readability ⚠️

**Issues Found:**

- 🟡 **Recommended:** Large component (AqiFiguresDisplay.tsx, 300+ lines) with multiple responsibilities
- 🟡 **Recommended:** No logging in controllers or repositories for debugging
- 🟡 **Recommended:** `ApiClient.tsx` logs the resolved API base URL to the browser console on every load, leaking configuration details in production
- 🟡 **Recommended:** TypeScript DTOs (e.g., `Time`) diverge from WAQI payloads (`saveChanges` property does not exist, `iso` should be optional), increasing runtime mismatch risk
- 🔵 **Nit:** Inconsistent naming (mix of PascalCase and camelCase in DTOs)
- 🔵 **Nit:** Commented-out code in App.tsx and Program.cs
- 🔵 **Nit:** Magic numbers for AQI thresholds
- 🔵 **Nit:** Unused using statements and variables

**Positive Notes:**

- Clear separation of concerns (controller-service-repository)
- Good use of TypeScript for type safety
- Consistent project structure

**Details:** See "Frontend Issues: Component State Management Complexity" and "Code Quality Issues" section

### 7. Architecture and Boundaries ✅

**Status:** Good

- Clean layered architecture (controller → repository → external API)
- Proper dependency injection setup
- Middleware pattern correctly applied
- Repository interfaces properly defined

**Minor Observation:**

- 🟡 **Recommended:** Consider adding a service layer between controller and repository for business logic

### 8. Documentation and Ops ⚠️

**Issues Found:**

- 🔴 **Blocking:** Referenced documentation files (`docs/engineering/code-review-guidelines.md`) were missing (now resolved)
- 🟡 **Recommended:** No XML documentation comments for API endpoints
- 🟡 **Recommended:** Missing `.env.example` files mentioned in README
- 🟡 **Recommended:** CORS configuration hardcoded instead of environment-specific
- 🟡 **Recommended:** Rate limiting values hardcoded instead of externalized

**Details:** See "Documentation Issues" and "Configuration & Infrastructure Issues" sections

### 9. UX/UI and Accessibility ⚠️

**Issues Found:**

- 🔴 **Blocking:** No error boundaries to catch and handle React rendering errors
- 🟡 **Recommended:** Switches and color indicators lack ARIA labels and descriptions
- 🟡 **Recommended:** No visible loading states for async operations
- 🟡 **Recommended:** Error messages not user-friendly (technical HTTP status codes)

**Details:** See "Frontend Issues: Missing Error Boundaries" and "Missing Accessibility Labels"

---

## Detailed Findings by Component

### 🔴 Blocking: Exception Handling in Repository Layer

**File:** `api/Repositories/AirQualityDataRepository.cs`

**Issue:** The repository throws generic exceptions that expose internal details and don't follow the centralized error handling pattern outlined in backend.instructions.md.

**Current Code:**

```csharp
if (jsonResult != null)
{
    JObject parsedJsonResult = JObject.Parse(jsonResult);
    AirQualityDataSetDto? uniqueAirQualityData = parsedJsonResult.ToObject<AirQualityDataSetDto>();
    var uniqueAirQuaility = new AirQualityDataSetDto(); // Unused variable!

    if (uniqueAirQualityData != null)
    {
        return uniqueAirQualityData;
    }
}

throw new Exception($"No Station found with UID {uid}");
```

**Problems:**

1. Generic `Exception` instead of domain-specific exception
2. No handling of external API failures
3. Exposes internal details in exception messages
4. Unused variable `uniqueAirQuaility`
5. No null check on `response.Content`
6. No HTTP status code validation

**Recommended Fix:**

```csharp
public async Task<AirQualityDataSetDto> GetDataByUID(string uid)
{
    var apiKey = Environment.GetEnvironmentVariable("AIR_POLLUTION_API_KEY") 
        ?? throw new InvalidOperationException("AIR_POLLUTION_API_KEY environment variable is not set");
    
    var client = new RestClient();
    var request = new RestRequest(
        $"http://api.waqi.info/feed/@{uid}/?token={apiKey}",
        Method.Get
    );

    var response = await client.ExecuteAsync<RestResponse>(request);

    // Check HTTP status
    if (!response.IsSuccessful)
    {
        _logger.LogError("External API returned error: {StatusCode}", response.StatusCode);
        throw new ExternalServiceException($"Failed to retrieve air quality data");
    }

    if (string.IsNullOrEmpty(response.Content))
    {
        throw new DataNotFoundException($"No data available for station");
    }

    try
    {
        var parsedJsonResult = JObject.Parse(response.Content);
        var airQualityData = parsedJsonResult.ToObject<AirQualityDataSetDto>();
        
        if (airQualityData?.Data == null)
        {
            throw new DataNotFoundException($"No valid data returned for station");
        }

        return airQualityData;
    }
    catch (JsonException ex)
    {
        _logger.LogError(ex, "Failed to parse API response");
        throw new ExternalServiceException("Invalid data format received");
    }
}
```

**Action Required:**

- Create custom exception types: `DataNotFoundException`, `ExternalServiceException`
- Add ILogger dependency injection to repository
- Implement global exception handler in Program.cs as shown in backend.instructions.md
- Apply same fixes to `GetDataByLatLon` method

---

### 🔴 Blocking: API Error Responses Are Treated as Success

**File:** `api/Repositories/AirQualityDataRepository.cs`

**Issue:** The repository forwards WAQI responses to callers even when the upstream API explicitly reports an error (`{"status":"error","data":"..."}`). The controller returns HTTP 200 with that payload, so clients treat failures as successful responses.

**Why it matters:**

- Violates correctness expectations; consumers have no reliable signal that the request failed.
- Breaks the "fail fast" guidance in `.github/instructions/backend.instructions.md#backend-error-handling`.
- Causes confusing UX (frontend renders "status: error" data instead of showing an error state).
- Skips retry/alert logic because the failure never surfaces as an exception.

**Current Code:**

```csharp
var parsedJsonResult = JObject.Parse(response.Content);
AirQualityDataSetDto? uniqueAirQualityData =
  parsedJsonResult.ToObject<AirQualityDataSetDto>();

if (uniqueAirQualityData != null)
{
  return uniqueAirQualityData; // status may be "error"
}
```

**Recommended Fix:**

```csharp
var payload = JObject.Parse(response.Content);
var status = payload.Value<string>("status");

if (!string.Equals(status, "ok", StringComparison.OrdinalIgnoreCase))
{
  var message = payload.Value<string>("data") ?? "Unknown error";
  _logger.LogWarning("WAQI returned error status: {Status} - {Message}", status, message);
  throw new ExternalServiceException($"WAQI error: {message}")
  {
    StatusCode = response.StatusCode
  };
}

var airQualityData = payload.ToObject<AirQualityDataSetDto>()
  ?? throw new DataNotFoundException("No data element returned");

return airQualityData;
```

**Action Required:**

- Enforce `status == "ok"` before returning data.
- Map `status != ok` to typed exceptions so controllers can translate to 4xx/5xx responses.
- Add unit tests covering `status: "error"` and `status: "nope"` scenarios.
- Update frontend error handling to surface these failures (see "Frontend Issues: Missing Error States").

---

### 🔴 Blocking: SecurityHeadersMiddleware Not Registered

**File:** `api/Program.cs`

**Issue:** `SecurityHeadersMiddleware` is implemented but never registered in the middleware pipeline.

**Current State:**

```csharp
app.UseRateLimiting();
app.UseCors(AllowSpecificOrigins);
// app.UseSecurityHeaders(); // MISSING!
app.UseAuthorization();
```

**Fix:**

```csharp
app.UseRateLimiting();
app.UseSecurityHeaders(); // Add this
app.UseCors(AllowSpecificOrigins);
app.UseAuthorization();
```

**Impact:** Security headers (CSP, X-Frame-Options, etc.) are not being applied to responses, leaving the API vulnerable to XSS and clickjacking attacks.

---

### 🟡 Recommended: HTTP to HTTPS for External API Calls

**File:** `api/Repositories/AirQualityDataRepository.cs`

**Issue:** External API calls use HTTP instead of HTTPS.

**Current:**

```csharp
$"http://api.waqi.info/feed/@{uid}/?token={apiKey}"
```

**Recommended:**

```csharp
$"https://api.waqi.info/feed/@{uid}/?token={apiKey}"
```

**Rationale:** API tokens should never be transmitted over unencrypted connections. This violates security best practices outlined in backend.instructions.md.

---

### 🟡 Recommended: InputSanitizationService Not Used

**File:** `api/Services/InputSanitizationService.cs`

**Issue:** A comprehensive input sanitization service exists but is never registered in DI or used in controllers.

**Action Required:**

- Register in Program.cs:

```csharp
builder.Services.AddScoped<IInputSanitizationService, InputSanitizationService>();
```

- Use in AirQualityDataController:

```csharp
public class AirQualityDataController : ControllerBase
{
    private readonly IAirQualityDataRepository _airQualityDataRepository;
    private readonly IInputSanitizationService _sanitizationService;

    public AirQualityDataController(
        IAirQualityDataRepository airQualityDataRepository,
        IInputSanitizationService sanitizationService)
    {
        _airQualityDataRepository = airQualityDataRepository;
        _sanitizationService = sanitizationService;
    }

    [HttpGet("air-quality-data-by-latlon/{lat}/{lon}")]
    public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByLatLon(float lat, float lon)
    {
        var (sanitizedLat, sanitizedLon) = _sanitizationService.SanitizeCoordinates(lat, lon);
        var result = await _airQualityDataRepository.GetDataByLatLon(sanitizedLat, sanitizedLon);
        return Ok(result);
    }
}
```

---

### 🟡 Recommended: Inconsistent Naming Conventions

**File:** `api/Models/Dto/AirQualityDataSetDto.cs`

**Issue:** C# property naming is inconsistent - mix of PascalCase and camelCase.

**Current:**

```csharp
public class Data
{
    public int Aqi { get; set; }
    public int Idx { get; set; }
    public List<Attribution>? attributions { get; set; } // camelCase!
    public City? City { get; set; }
    public string? Dominentpol { get; set; }
    public Iaqi? Iaqi { get; set; }
    public Time? Time { get; set; }
}

public class City
{
    public List<double>? geo { get; set; } // camelCase!
    public string? Name { get; set; }
}
```

**Fix:** Use PascalCase for all properties and apply JSON mapping attributes:

```csharp
using System.Text.Json.Serialization;

public class Data
{
    public int Aqi { get; set; }
    public int Idx { get; set; }
    
    [JsonPropertyName("attributions")]
    public List<Attribution>? Attributions { get; set; }
    
    public City? City { get; set; }
    
    [JsonPropertyName("dominentpol")]
    public string? DominentPol { get; set; }
    
    public Iaqi? Iaqi { get; set; }
    public Time? Time { get; set; }
}

public class City
{
    [JsonPropertyName("geo")]
    public List<double>? Geo { get; set; }
    
    public string? Name { get; set; }
    public string? Url { get; set; }
    public string? Location { get; set; }
}
```

---

### 🟡 Recommended: DTO Numeric Types Do Not Match WAQI Payloads

**File:** `api/Models/Dto/AirQualityDataSetDto.cs`

**Issue:** DTO properties are typed as `int`, but the WAQI API frequently returns floating-point or string sentinel values (e.g., `"v": 12.3`, `"aqi": "-"`). `Newtonsoft.Json` will throw or silently truncate in these situations.

**Evidence:**

- Fields such as `Data.Aqi`, `Iaqi.Co.V`, `Iaqi.Pm25.V`, etc., are declared as `int`.
- WAQI API examples (and live responses) show pollutant values with decimals and the AQI field occasionally set to `"-"` or `"N/A"` when data is unavailable.

**Risks:**

- Deserialization exceptions when the upstream API returns non-integer values.
- Loss of precision when decimal pollutant concentrations are truncated to integers.
- Frontend/backend mismatch: the TypeScript DTO uses `number` (supporting fractions) while the C# DTO forces integers.

**Suggested Fix:**

```csharp
public class Data
{
  public double? Aqi { get; set; }
  public int Idx { get; set; }
  // ...
}

public class Co
{
  public double? V { get; set; }
}
```

- Use `double?` (or `decimal?`) to capture fractional values and missing data.
- For sentinel strings ("-", "N/A"), deserialize to `null` using a custom converter.
- Add unit tests covering decimal values and missing AQI values to ensure robustness.

---

### 🟡 Recommended: Missing Logging in Critical Paths

**File:** `api/Controllers/AirQualityDataController.cs`

**Issue:** No logging for successful requests or errors. This violates observability requirements in backend.instructions.md.

**Recommendation:**

```csharp
public class AirQualityDataController : ControllerBase
{
    private readonly IAirQualityDataRepository _airQualityDataRepository;
    private readonly ILogger<AirQualityDataController> _logger;

    public AirQualityDataController(
        IAirQualityDataRepository airQualityDataRepository,
        ILogger<AirQualityDataController> logger)
    {
        _airQualityDataRepository = airQualityDataRepository;
        _logger = logger;
    }

    [HttpGet("air-quality-data-by-latlon/{lat}/{lon}")]
    public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByLatLon(float lat, float lon)
    {
        _logger.LogInformation("Fetching AQI data for coordinates: {Lat}, {Lon}", lat, lon);
        
        try
        {
            var result = await _airQualityDataRepository.GetDataByLatLon(lat, lon);
            _logger.LogInformation("Successfully retrieved AQI data for {Location}", result.Data?.City?.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch AQI data for coordinates: {Lat}, {Lon}", lat, lon);
            throw;
        }
    }
}
```

---

### 🟡 Recommended: Rate Limiting Configuration Should Be Externalized

**File:** `api/Middleware/RateLimitingMiddleware.cs`

**Issue:** Rate limit values are hardcoded. Should be in appsettings.json per backend.instructions.md configuration management guidelines.

**Current:**

```csharp
public RateLimitingMiddleware(
    RequestDelegate next,
    int maxRequests = 100,
    int timeWindowMinutes = 15
)
```

**Recommended:**
Add to `appsettings.json`:

```json
{
  "RateLimiting": {
    "MaxRequests": 100,
    "TimeWindowMinutes": 15
  }
}
```

Then in Program.cs:

```csharp
builder.Services.Configure<RateLimitOptions>(
    builder.Configuration.GetSection("RateLimiting"));
```

---

### 🟡 Recommended: Bulk UID Endpoint Should Tolerate Partial Failures

**File:** `api/Controllers/AirQualityDataController.cs`

**Issue:** `AirQualityByUIDs` calls the repository in parallel via `Task.WhenAll`. If any upstream call fails (timeout, 404, rate limit), the entire batch fails and clients receive an HTTP 500, even though some stations may have succeeded.

**Impacts:**

- Unnecessarily brittle API surface; a single failing station prevents useful data for the others.
- Increases perceived downtime when the WAQI API rate-limits a subset of requests.
- Violates resiliency guidance in `.github/instructions/backend.instructions.md#backend-architecture` (graceful degradation).

**Suggested Improvements:**

```csharp
var results = new Dictionary<string, AirQualityDataSetDto?>();

foreach (var uid in sanitizedUids)
{
  try
  {
    results[uid] = await _airQualityDataRepository.GetDataByUID(uid);
  }
  catch (DataNotFoundException ex)
  {
    _logger.LogWarning(ex, "Station not found: {Uid}", uid);
    results[uid] = null; // Bubble up per-station failure
  }
  catch (ExternalServiceException ex)
  {
    _logger.LogError(ex, "Failed to fetch station: {Uid}", uid);
    // Optionally include error metadata in response
  }
}

return Ok(results);
```

- Consider processing in throttled batches (see "Performance Issues: Bulk Endpoint Not Optimized").
- Return per-station error metadata so the frontend can distinguish failures from missing data.
- Add tests for mixed-success scenarios.

---

### 🔵 Nit: Typo in Property Name

**File:** `api/Models/Dto/AirQualityDataSetDto.cs`

**Issue:** `Dominentpol` should be `DominantPol` (misspelling of "dominant").

---

### 🔵 Nit: Commented Code in Program.cs

**File:** `api/Program.cs`

**Issue:** Commented-out code should be removed:

```csharp
// Don't use HTTPS redirection - Cloud Run handles HTTPS termination
// if (!app.Environment.IsDevelopment())
// {
//     app.UseHttpsRedirection();
// }
```

**Recommendation:** Either remove entirely or add a clear TODO comment explaining why it's kept.

---

## Frontend (React/TypeScript) Issues

### 🔴 Blocking: Missing Error Handling in API Client

**File:** `ui/src/Api/ApiClient.tsx`

**Issue:** API client throws errors but provides no structured error handling or retry logic.

**Current Code:**

```typescript
export async function getAqiFiguresByLatLon(lat: number, lon: number): Promise<AirQualityDataSetDto> {
    const response = await fetch(`${API_URL}/air-quality-data-by-latlon/${lat}/${lon}`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}
```

**Problems:**

1. Generic error messages don't help users
2. No retry logic for transient failures
3. No timeout handling
4. No error type discrimination
5. Doesn't follow frontend.instructions.md error handling guidance

**Recommended Fix:**

```typescript
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public errorCode?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function getAqiFiguresByLatLon(
    lat: number, 
    lon: number,
    retries = 3
): Promise<AirQualityDataSetDto> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(
                    `${API_URL}/air-quality-data-by-latlon/${lat}/${lon}`,
                    { signal: controller.signal }
                );
                
                if (!response.ok) {
                    const errorBody = await response.text();
                    
                    if (response.status === 404) {
                        throw new ApiError('No air quality data available for this location', 404, 'NOT_FOUND');
                    } else if (response.status === 429) {
                        throw new ApiError('Too many requests. Please try again later.', 429, 'RATE_LIMITED');
                    } else if (response.status >= 500) {
                        // Retry on server errors
                        if (attempt < retries) {
                            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                            continue;
                        }
                        throw new ApiError('Service temporarily unavailable', response.status, 'SERVER_ERROR');
                    }
                    
                    throw new ApiError(`Failed to fetch data: ${errorBody}`, response.status);
                }
                
                const data = await response.json();
                return data;
            } catch (error) {
                if (error instanceof ApiError) throw error;
                if (error instanceof DOMException && error.name === 'AbortError') {
                    throw new ApiError('Request timeout', undefined, 'TIMEOUT');
                }
                if (attempt === retries) throw error;
            }
        }
        throw new ApiError('Failed after multiple retries');
    } finally {
        clearTimeout(timeoutId);
    }
}
```

Apply similar pattern to `getAqiFiguresByUID` and `getAqiFiguresByUIDs`.

---

### 🟡 Recommended: Component State Management Complexity

**File:** `ui/src/components/AqiFiguresDisplay.tsx`

**Issue:** Component has multiple responsibilities and complex state management that could be simplified.

**Current Issues:**

1. Fetches data directly in useEffect (should use API client hook or SWR/React Query)
2. Time formatting logic mixed with display logic
3. Large component (300+ lines) handling multiple concerns
4. No error state management
5. No loading states shown to user

**Recommended Approach:**

```typescript
// Create custom hook: useAirQualityData.ts
import { useState, useEffect } from 'react';
import { getAqiFiguresByLatLon, ApiError } from '../Api/ApiClient';
import type { AirQualityDataSetDto } from '../Api/ApiClient';

interface UseAirQualityDataResult {
  data: AirQualityDataSetDto | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export function useAirQualityData(lat: number, lon: number): UseAirQualityDataResult {
  const [data, setData] = useState<AirQualityDataSetDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = async () => {
    if (lat === 0 && lon === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAqiFiguresByLatLon(lat, lon);
      setData(result);
    } catch (err) {
      setError(err as ApiError);
      console.error("Error fetching AQI data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lat, lon]);

  return { data, loading, error, refetch: fetchData };
}
```

Then simplify the component:

```typescript
const AqiFigures: React.FC<AqiFiguresDisplayProps> = ({ 
  currentLongLat, 
  enabledSystems,
  onToggleSystem
}) => {
  const { data: aqiData, loading, error } = useAirQualityData(
    currentLongLat.Latitude, 
    currentLongLat.Longitude
  );

  // ... rest of component using aqiData, loading, error states
};
```

---

### 🟡 Recommended: Missing Error Boundaries

**File:** `ui/src/App.tsx`

**Issue:** No error boundaries to catch rendering errors. Frontend.instructions.md requires error boundaries around risky trees.

**Recommendation:**

```typescript
// ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Then wrap App:

```typescript
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

---

### 🟡 Recommended: Type Safety Issues in ApiClient

**File:** `ui/src/Api/ApiClient.tsx`

**Issue:** File has `.tsx` extension but exports no JSX. Interface definitions could be more strict.

**Problems:**

1. Should be `.ts` not `.tsx`
2. Nullable fields everywhere make the API harder to use safely
3. No runtime validation of API responses

**Recommendations:**

1. Rename to `ApiClient.ts`
2. Add Zod or similar for runtime validation:

```typescript
import { z } from 'zod';

const AirQualityDataSchema = z.object({
  status: z.string(),
  data: z.object({
    aqi: z.number(),
    idx: z.number(),
    city: z.object({
      name: z.string(),
      geo: z.array(z.number()).length(2),
    }).nullable(),
    // ... etc
  }).nullable(),
});

export async function getAqiFiguresByLatLon(lat: number, lon: number): Promise<AirQualityDataSetDto> {
    const response = await fetch(`${API_URL}/air-quality-data-by-latlon/${lat}/${lon}`);
    
    if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
    }
    
    const json = await response.json();
    const validated = AirQualityDataSchema.parse(json); // Runtime validation
    return validated as AirQualityDataSetDto;
}
```

---

### 🟡 Recommended: Missing Accessibility Labels

**File:** `ui/src/components/AqiFiguresDisplay.tsx`

**Issue:** Switches and color indicators lack proper accessibility attributes as required by frontend.instructions.md.

**Current:**

```typescript
<Switch
  id={config.key}
  checked={enabledSystems[config.key] && isAvailable}
  onCheckedChange={() => onToggleSystem(config.key)}
  disabled={!isAvailable}
/>
```

**Recommended:**

```typescript
<Switch
  id={config.key}
  checked={enabledSystems[config.key] && isAvailable}
  onCheckedChange={() => onToggleSystem(config.key)}
  disabled={!isAvailable}
  aria-label={`Toggle ${config.label} display`}
  aria-describedby={`${config.key}-status`}
/>
<span id={`${config.key}-status`} className="sr-only">
  {isAvailable 
    ? `Current value: ${pollutantData?.v}, ${getAirQualityLevel(pollutantData.v).label}` 
    : 'No data available'}
</span>
```

Also add ARIA attributes to color indicators:

```typescript
<div
  className="..."
  role="img"
  aria-label={`Air quality indicator: ${isAvailable ? getAirQualityLevel(pollutantData.v).label : 'No data'}`}
  style={{...}}
/>
```

---

### 🔵 Nit: Commented Out Code in App.tsx

**File:** `ui/src/App.tsx`

**Issue:** Commented-out Header/Navbar/Footer components should be removed or implemented.

```typescript
{/* <Header />
    <Navbar /> */}
// ...
{/* <Footer />       */}
```

---

## Testing Issues

### 🔴 Blocking: Integration Tests Don't Validate Responses

**File:** `api.tests/IntegrationTests.cs`

**Issue:** Integration tests only check status codes, not response content or structure.

**Current:**

```csharp
[Fact]
public async Task AirQualityByUID_WithValidUID_ReturnsSuccessStatusCode()
{
    int testUID = 1;
    var response = await _client.GetAsync($"/air-quality-data-by-uid/{testUID}");
    
    Assert.True(
        response.StatusCode == HttpStatusCode.OK
            || response.StatusCode == HttpStatusCode.InternalServerError
    );
}
```

**Problems:**

1. Accepts 500 errors as success
2. Doesn't validate response body
3. Doesn't test error cases
4. No assertions on data structure

**Recommended:**

```csharp
[Fact]
public async Task AirQualityByUID_WithValidUID_ReturnsValidData()
{
    // Arrange
    int testUID = 1;

    // Act
    var response = await _client.GetAsync($"/air-quality-data-by-uid/{testUID}");

    // Assert
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    
    var content = await response.Content.ReadAsStringAsync();
    var data = JsonSerializer.Deserialize<AirQualityDataSetDto>(content);
    
    Assert.NotNull(data);
    Assert.NotNull(data.Data);
    Assert.True(data.Data.Aqi >= 0);
}

[Fact]
public async Task AirQualityByUID_WithInvalidUID_ReturnsBadRequest()
{
    // Arrange
    string invalidUID = "invalid!@#$%";

    // Act
    var response = await _client.GetAsync($"/air-quality-data-by-uid/{invalidUID}");

    // Assert
    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
}

[Fact]
public async Task AirQualityByLatLon_WithOutOfRangeCoordinates_ReturnsBadRequest()
{
    // Arrange
    float invalidLat = 100f;
    float lon = 0f;

    // Act
    var response = await _client.GetAsync($"/air-quality-data-by-latlon/{invalidLat}/{lon}");

    // Assert
    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
}
```

---

### 🟡 Recommended: Missing Test Coverage for Critical Paths

**Issue:** According to `.github/copilot-instructions.md#quality-policy`, critical paths including error/exception handling should have 100% coverage.

**Missing Tests:**

1. **Backend:**
   - Rate limiting middleware edge cases
   - Security headers application
   - Bulk UID endpoint with invalid data
   - Repository exception scenarios
   - External API failure handling

2. **Frontend:**
   - API client retry logic
   - Error state rendering
   - Loading state handling
   - Accessibility keyboard navigation
   - Empty/null data scenarios

**Action Required:** Add tests for these scenarios before next release.

---

### 🔵 Nit: Test File Naming

**File:** `api.tests/UnitTest1.cs`

**Issue:** Generic test file name. Should be `AirQualityDataControllerTests.cs` (which is the actual class name inside).

---

## Documentation Issues

### 🔴 Blocking: Missing docs/ Directory

**Issue:** The `.github/chatmodes/CodeReviewer.chatmode.md` and `.github/copilot-instructions.md` reference `docs/engineering/code-review-guidelines.md` and `docs/engineering/pull-request-guidelines.md` which don't exist.

**Impact:** This causes compile errors in the chatmode file and breaks the SSOT (Single Source of Truth) principle.

**Action Required:**

- Create `docs/engineering/` directory structure
- Create referenced documentation files
- Update references or remove broken links

---

### 🟡 Recommended: Missing API Documentation

**Issue:** No OpenAPI/Swagger documentation enhancements beyond default setup.

**Recommendations:**

- Add XML documentation comments:

```csharp
/// <summary>
/// Retrieves air quality data for the specified geographic coordinates
/// </summary>
/// <param name="lat">Latitude (-90 to 90)</param>
/// <param name="lon">Longitude (-180 to 180)</param>
/// <returns>Air quality data for the nearest monitoring station</returns>
/// <response code="200">Returns air quality data</response>
/// <response code="400">Invalid coordinates</response>
/// <response code="429">Rate limit exceeded</response>
[HttpGet("air-quality-data-by-latlon/{lat}/{lon}")]
[ProducesResponseType(typeof(AirQualityDataSetDto), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status429TooManyRequests)]
public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByLatLon(float lat, float lon)
```

- Enable XML documentation in `.csproj`:

```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <NoWarn>$(NoWarn);1591</NoWarn>
</PropertyGroup>
```

- Configure Swagger to use XML comments:

```csharp
builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
});
```

---

### 🟡 Recommended: Missing Environment Variable Documentation

**Issue:** README.md mentions `.env.example` files but they don't exist in the repository.

**Action Required:**
Create `api/.env.example`:

```bash
AIR_POLLUTION_API_KEY=your_api_key_here
PORT=5090
```

Create `ui/.env.example`:

```bash
VITE_API_URL=http://localhost:5090
```

---

### 🔵 Nit: README Setup Flow Has Incorrect Paths

**Issue:** In `README.md`, Step 3 moves into `api/` (`cd ../api`), but Step 5 repeats `cd api`, which fails because the reader is already inside that directory. Step 6 assumes the working directory is the repo root before running `cd ../ui`.

**Recommendation:** Replace Steps 5 and 6 with context-aware navigation (e.g., remove redundant `cd` commands or add `cd ..` first) so the quick-start commands execute as written.

---

## Configuration & Infrastructure Issues

### 🟡 Recommended: Environment-Specific Configuration Not Properly Used

**File:** `api/appsettings.json`

**Issue:** CORS configuration is in base `appsettings.json` but should be environment-specific.

**Current:**

```json
{
  "Cors": {
    "AllowedOrigins": [
      "https://worldairqualityvisualiser.online"
    ]
  }
}
```

**Recommended Structure:**

`appsettings.json` (base):

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

`appsettings.Development.json`:

```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173"
    ]
  }
}
```

`appsettings.Production.json`:

```json
{
  "Cors": {
    "AllowedOrigins": [
      "https://worldairqualityvisualiser.online",
      "https://air-pollution-visualiser.netlify.app"
    ]
  }
}
```

Then update Program.cs to read from configuration instead of hardcoding.

---

### 🔵 Nit: Hardcoded Port Numbers

**File:** `ui/src/Api/ApiClient.tsx`

**Issue:** Fallback port is hardcoded instead of using a constant.

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5090';
```

**Recommendation:**

```typescript
const DEFAULT_API_URL = 'http://localhost:5090';
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

if (!import.meta.env.VITE_API_URL) {
  console.warn(`VITE_API_URL not set, using default: ${DEFAULT_API_URL}`);
}
```

---

## Security Issues

### 🔴 Blocking: API Key Visible in Logs

**File:** `api/Repositories/AirQualityDataRepository.cs`

**Issue:** While the API key isn't explicitly logged, the full URL with token is constructed and could be logged by RestSharp.

**Recommendation:**
Add a log filter or ensure RestSharp doesn't log full URLs:

```csharp
// In Program.cs
builder.Logging.AddFilter("RestSharp", LogLevel.Warning);
```

---

### 🟡 Recommended: Missing Request Validation Attributes

**File:** `api/Controllers/AirQualityDataController.cs`

**Issue:** While validation logic exists, using validation attributes would be more idiomatic.

**Current:**

```csharp
[HttpGet("air-quality-data-by-latlon/{lat}/{lon}")]
public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByLatLon(float lat, float lon)
{
    if (lat < -90 || lat > 90)
    {
        return BadRequest("Latitude must be between -90 and 90");
    }
    // ...
}
```

**Recommended (using FluentValidation or DataAnnotations):**

```csharp
public class CoordinateRequest
{
    [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
    public float Latitude { get; set; }
    
    [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
    public float Longitude { get; set; }
}

[HttpGet("air-quality-data-by-latlon/{lat}/{lon}")]
public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByLatLon(
    [FromRoute] CoordinateRequest request)
{
    var result = await _airQualityDataRepository.GetDataByLatLon(
        request.Latitude, 
        request.Longitude);
    return Ok(result);
}
```

---

## Performance Issues

### 🟡 Recommended: No Caching Strategy

**Issue:** Every coordinate request hits the external API, which is inefficient and expensive.

**Recommendation:**
Implement response caching:

```csharp
// In Program.cs
builder.Services.AddResponseCaching();
builder.Services.AddMemoryCache();

// After builder.Build()
app.UseResponseCaching();

// In controller
[HttpGet("air-quality-data-by-latlon/{lat}/{lon}")]
[ResponseCache(Duration = 300, VaryByQueryKeys = new[] { "lat", "lon" })]
public async Task<ActionResult<AirQualityDataSetDto>> AirQualityByLatLon(float lat, float lon)
```

Or implement distributed caching with Redis for production:

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});
```

---

### 🟡 Recommended: Bulk Endpoint Not Optimized

**File:** `api/Controllers/AirQualityDataController.cs`

**Issue:** Bulk UID endpoint runs all requests in parallel without throttling, which could overwhelm the external API.

**Current:**

```csharp
var tasks = sanitizedUids.Select(uid => _airQualityDataRepository.GetDataByUID(uid));
var results = await Task.WhenAll(tasks);
```

**Recommended (with throttling):**

```csharp
// Process in batches to avoid overwhelming external API
const int batchSize = 10;
var results = new List<AirQualityDataSetDto>();

for (int i = 0; i < sanitizedUids.Count; i += batchSize)
{
    var batch = sanitizedUids.Skip(i).Take(batchSize);
    var batchTasks = batch.Select(uid => _airQualityDataRepository.GetDataByUID(uid));
    var batchResults = await Task.WhenAll(batchTasks);
    results.AddRange(batchResults);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < sanitizedUids.Count)
    {
        await Task.Delay(100);
    }
}
```

---

## Code Quality Issues

### 🔵 Nit: Unused Using Statements

**Files:** Multiple files have unused using statements.

Examples:

- `api/Models/Dto/AirQualityDataSetDto.cs`: `CsvHelper`, `CsvHelper.Configuration.Attributes`, `Microsoft.Net.Http.Headers`
- These should be removed for clarity

---

### 🔵 Nit: Magic Numbers

**File:** `ui/src/components/AqiFiguresDisplay.tsx`

**Issue:** Air quality thresholds are hardcoded.

**Current:**

```typescript
const getAirQualityLevel = (value: number): AirQualityLevel => {
  if (value <= 50) {
    return { color: '#16a34a', label: 'Good' };
  } else if (value <= 101) {
    return { color: '#ca8a04', label: 'Moderate' };
  }
  // ...
}
```

**Recommended:**

```typescript
const AQI_THRESHOLDS = {
  GOOD: { max: 50, color: '#16a34a', label: 'Good' },
  MODERATE: { max: 101, color: '#ca8a04', label: 'Moderate' },
  UNHEALTHY_SENSITIVE: { max: 151, color: '#ea580c', label: 'Unhealthy for sensitive individuals' },
  UNHEALTHY: { max: 201, color: '#dc2626', label: 'Unhealthy' },
  VERY_UNHEALTHY: { max: 301, color: '#9333ea', label: 'Very Unhealthy' },
  HAZARDOUS: { max: Infinity, color: '#991b1b', label: 'Hazardous' },
} as const;

const getAirQualityLevel = (value: number): AirQualityLevel => {
  for (const [_, threshold] of Object.entries(AQI_THRESHOLDS)) {
    if (value <= threshold.max) {
      return { color: threshold.color, label: threshold.label };
    }
  }
  return AQI_THRESHOLDS.HAZARDOUS;
};
```

---

## Summary of Action Items

### High Priority (Blocking 🔴)

- ✅ Fix exception handling in `AirQualityDataRepository.cs`
- ✅ Register `SecurityHeadersMiddleware` in middleware pipeline
- ✅ Implement structured error handling in API client
- ✅ Fix integration tests to validate responses properly
- ✅ Create missing documentation structure

### Medium Priority (Recommended 🟡)

- ✅ Switch external API calls from HTTP to HTTPS
- ✅ Register and use `InputSanitizationService`
- ✅ Add logging to controllers and repositories
- ✅ Implement error boundaries in React app
- ✅ Extract API data fetching to custom hooks
- ✅ Add response caching strategy
- ✅ Improve type safety in TypeScript code
- ✅ Externalize rate limiting configuration
- ✅ Add comprehensive test coverage for error paths
- ✅ Create `.env.example` files
- ✅ Add API documentation with XML comments

### Low Priority (Nits 🔵)

- ✅ Fix naming inconsistencies
- ✅ Remove commented code
- ✅ Rename `ApiClient.tsx` to `ApiClient.ts`
- ✅ Remove unused using statements
- ✅ Extract magic numbers to constants

---

## Conclusion

This codebase demonstrates strong security awareness and good architectural patterns. The review, conducted according to the guidelines in `docs/engineering/code-review-guidelines.md`, identified issues across multiple categories with varying severity.

### Review Summary by Checklist Category

| Category | Status | Blocking | Recommended | Nits |
|----------|--------|----------|-------------|------|
| 1. PR Hygiene and Scope | ✅ Good | 0 | 0 | 0 |
| 2. Correctness and Behavior | ⚠️ Needs Work | 2 | 1 | 0 |
| 3. Tests and Coverage | ⚠️ Needs Work | 1 | 2 | 1 |
| 4. Security | ⚠️ Needs Work | 3 | 3 | 0 |
| 5. Performance and Reliability | ⚠️ Needs Work | 0 | 4 | 0 |
| 6. Maintainability and Readability | ⚠️ Needs Work | 0 | 2 | 6 |
| 7. Architecture and Boundaries | ✅ Good | 0 | 1 | 0 |
| 8. Documentation and Ops | ⚠️ Needs Work | 1 | 4 | 0 |
| 9. UX/UI and Accessibility | ⚠️ Needs Work | 2 | 3 | 0 |
| **Totals** | | **9** | **20** | **7** |

### Strengths

1. **Security-First Mindset:** Comprehensive input validation, rate limiting implementation, and security documentation
2. **Clean Architecture:** Well-structured layered architecture with proper separation of concerns
3. **Modern Stack:** TypeScript, React 19, .NET 8 with current best practices
4. **Repository Pattern:** Proper abstraction of data access layer

### Critical Areas Requiring Immediate Action

**The 9 blocking issues must be addressed before this code can be considered production-ready:**

1. **Exception Handling:** Repository layer doesn't handle external API failures properly
2. **Test Quality:** Integration tests don't validate responses, just status codes
3. **Security Headers:** Middleware implemented but not registered
4. **API Key Security:** Potential logging exposure
5. **Documentation Structure:** Missing referenced files (resolved during review)
6. **Error Boundaries:** React app lacks error boundary protection
7. **API Client Errors:** No structured error handling in frontend
8. **Error States:** No user-facing error handling for failed requests
9. **Accessibility:** Missing ARIA labels and keyboard navigation support

### Recommended Improvements for Production Readiness

The 20 recommended issues would significantly improve quality and maintainability:

1. **Performance:** Add caching strategy to reduce external API load and costs
2. **Testing:** Achieve 100% coverage on hot/error/security paths per policy
3. **Observability:** Add logging to controllers and repositories
4. **Type Safety:** Add runtime validation with Zod or similar
5. **Configuration:** Externalize all environment-specific settings
6. **Documentation:** Add XML comments and API documentation

### Minor Quality Improvements

The 7 nit-level issues are primarily style and consistency:

- Remove commented code and unused imports
- Extract magic numbers to constants
- Fix naming inconsistencies
- Rename files to match conventions

### Adherence to Repository Policies

**Quality & Coverage Policy (`.github/copilot-instructions.md#quality-policy`):**

- ⚠️ **Not Met:** Core domain logic and hot paths lack 100% test coverage
- ⚠️ **Not Met:** Error and exception paths not fully covered
- ⚠️ **Not Met:** Security-relevant logic needs additional test coverage

**Branch/PR Conventions (`.github/copilot-instructions.md`):**

- ✅ **Met:** Current branch follows naming convention (`chore/code-review-2025-11-17-sc`)
- ✅ **Met:** Repository structure follows template guidelines

### Impact Assessment

**If deployed as-is:**

- **High Risk:** Unhandled external API failures could cause crashes
- **High Risk:** Missing security headers expose API to XSS/clickjacking
- **High Risk:** React app could crash without error boundaries
- **Medium Risk:** Poor user experience during errors (no friendly messages)
- **Medium Risk:** High external API costs without caching
- **Low Risk:** Style inconsistencies reduce maintainability

**After addressing blocking issues:**

- Ready for staging/QA environment testing
- Not yet ready for production without recommended improvements

**After addressing recommended issues:**

- Production-ready with monitoring and observability
- Sustainable for long-term maintenance
- Meets repository quality standards

---

**Next Steps:**

1. **Immediate (Blocking):** Address all 9 blocking issues in priority order
2. **Short-term (Recommended):** Implement caching, logging, and improve test coverage
3. **Medium-term (Nits):** Clean up code quality issues and style inconsistencies
4. **Continuous:** Increase test coverage to meet the 90% threshold specified in `.github/copilot-instructions.md#quality-policy`
5. **Future:** Consider adding monitoring/observability tooling (Application Insights, Sentry, etc.)
6. **Future:** Set up CI/CD pipeline with automated testing and security scanning

---

## References

- **Code Review Guidelines:** `docs/engineering/code-review-guidelines.md`
- **Repository Instructions:** `.github/copilot-instructions.md`
- **Quality & Coverage Policy:** `.github/copilot-instructions.md#quality-policy`
- **Backend Guidelines:** `.github/instructions/backend.instructions.md`
- **Frontend Guidelines:** `.github/instructions/frontend.instructions.md`
