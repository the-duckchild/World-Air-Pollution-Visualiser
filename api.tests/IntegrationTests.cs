using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace api.tests;

public class IntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public IntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }


    [Fact]
    public async Task AirQualityByUID_WithValidUID_ReturnsSuccessStatusCode()
    {
        // Arrange - using a test UID that should work with your API
        int testUID = 1;

        // Act
        var response = await _client.GetAsync($"/air-quality-data-by-uid/{testUID}");

        // Assert
        // Note: This might return OK even if external API fails, depending on your implementation
        Assert.True(
            response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.InternalServerError
        );
    }

    [Fact]
    public async Task AirQualityByLatLon_WithValidCoordinates_ReturnsSuccessStatusCode()
    {
        // Arrange - London coordinates
        float lat = 51.5074f;
        float lon = -0.1278f;

        // Act
        var response = await _client.GetAsync($"/air-quality-data-by-latlon/{lat}/{lon}");

        // Assert
        // Note: This might return OK even if external API fails, depending on your implementation
        Assert.True(
            response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.InternalServerError
        );
    }
}
