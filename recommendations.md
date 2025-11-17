# Code Review Recommendations
## World Air Pollution Visualiser

**Review Date:** November 17, 2025  
**Reviewer:** GitHub Copilot (Code Reviewer Mode)  
**Severity Legend:** 🔴 Blocking | 🟡 Recommended | 🔵 Nit

---

## Executive Summary

This codebase demonstrates solid engineering practices with strong security considerations, comprehensive input validation, and good separation of concerns. The project includes both backend (.NET) and frontend (React/TypeScript) components with reasonable test coverage. However, several areas require attention to improve maintainability, reliability, and adherence to best practices.

**Positive Observations:**
- ✅ Excellent security implementation with rate limiting, input sanitization, and security headers
- ✅ Clear separation of concerns with controller-service-repository pattern
- ✅ Good input validation in API endpoints
- ✅ Comprehensive security documentation (SECURITY.md)
- ✅ Modern frontend stack with TypeScript and React 19

**Key Areas for Improvement:**
- Error handling and exception management
- Test coverage gaps (especially integration tests)
- Missing documentation structure
- Configuration management
- Code duplication and unused code
- API client error handling

---

## Backend (C#/.NET) Issues

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
1. Register in Program.cs:
```csharp
builder.Services.AddScoped<IInputSanitizationService, InputSanitizationService>();
```

2. Use in AirQualityDataController:
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
1. Create `docs/engineering/` directory structure
2. Create referenced documentation files
3. Update references or remove broken links

---

### 🟡 Recommended: Missing API Documentation

**Issue:** No OpenAPI/Swagger documentation enhancements beyond default setup.

**Recommendations:**
1. Add XML documentation comments:
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

2. Enable XML documentation in `.csproj`:
```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <NoWarn>$(NoWarn);1591</NoWarn>
</PropertyGroup>
```

3. Configure Swagger to use XML comments:
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
1. ✅ Fix exception handling in `AirQualityDataRepository.cs`
2. ✅ Register `SecurityHeadersMiddleware` in middleware pipeline
3. ✅ Implement structured error handling in API client
4. ✅ Fix integration tests to validate responses properly
5. ✅ Create missing documentation structure

### Medium Priority (Recommended 🟡)
6. ✅ Switch external API calls from HTTP to HTTPS
7. ✅ Register and use `InputSanitizationService`
8. ✅ Add logging to controllers and repositories
9. ✅ Implement error boundaries in React app
10. ✅ Extract API data fetching to custom hooks
11. ✅ Add response caching strategy
12. ✅ Improve type safety in TypeScript code
13. ✅ Externalize rate limiting configuration
14. ✅ Add comprehensive test coverage for error paths
15. ✅ Create `.env.example` files
16. ✅ Add API documentation with XML comments

### Low Priority (Nits 🔵)
17. ✅ Fix naming inconsistencies
18. ✅ Remove commented code
19. ✅ Rename `ApiClient.tsx` to `ApiClient.ts`
20. ✅ Remove unused using statements
21. ✅ Extract magic numbers to constants

---

## Conclusion

This codebase demonstrates strong security awareness and good architectural patterns. The main areas requiring attention are:

1. **Error Handling:** Both backend and frontend need more robust, structured error handling
2. **Testing:** Coverage gaps in critical paths, especially error scenarios
3. **Documentation:** Missing structural documentation and examples
4. **Type Safety:** Frontend could benefit from runtime validation
5. **Performance:** Add caching to reduce external API load

The security implementation is particularly noteworthy, with comprehensive input validation, rate limiting, and sanitization services. Once the blocking issues are addressed, this will be a solid, production-ready application.

---

**Next Steps:**
1. Address blocking issues in order listed above
2. Create missing documentation files referenced in `.github/` instructions
3. Increase test coverage to meet the 90% threshold specified in `.github/copilot-instructions.md#quality-policy`
4. Consider adding monitoring/observability tooling (Application Insights, Sentry, etc.)
5. Set up CI/CD pipeline with automated testing and security scanning
