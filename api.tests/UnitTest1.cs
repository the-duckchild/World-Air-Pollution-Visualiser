using api.Controllers;
using api.Models.Dto;
using api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace api.tests;

public class AirQualityDataControllerTests
{
    private readonly Mock<IAirQualityDataRepository> _mockRepository;
    private readonly AirQualityDataController _controller;

    public AirQualityDataControllerTests()
    {
        _mockRepository = new Mock<IAirQualityDataRepository>();
        _controller = new AirQualityDataController(_mockRepository.Object);
    }

    [Fact]
    public async Task AirQualityByUID_ReturnsOkResult_WithValidUID()
    {
        // Arrange
        string testUID = "123";
        var expectedData = new AirQualityDataSetDto
        {
            Status = "ok",
            Data = new Data
            {
                Aqi = 42,
                Idx = 123,
                City = new City
                {
                    Name = "London",
                    geo = new List<double> { 51.5074, -0.1278 },
                },
            },
        };

        _mockRepository.Setup(repo => repo.GetDataByUID(testUID)).ReturnsAsync(expectedData);

        // Act
        var result = await _controller.AirQualityByUID(testUID);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<AirQualityDataSetDto>(okResult.Value);
        Assert.Equal(expectedData, returnValue);
    }

    [Fact]
    public async Task AirQualityByLatLon_ReturnsOkResult_WithValidCoordinates()
    {
        // Arrange
        float testLat = 51.5074f;
        float testLon = -0.1278f;
        var expectedData = new AirQualityDataSetDto
        {
            Status = "ok",
            Data = new Data
            {
                Aqi = 35,
                City = new City
                {
                    Name = "London",
                    geo = new List<double> { testLat, testLon },
                },
            },
        };

        _mockRepository
            .Setup(repo => repo.GetDataByLatLon(testLat, testLon))
            .ReturnsAsync(expectedData);

        // Act
        var result = await _controller.AirQualityByLatLon(testLat, testLon);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnValue = Assert.IsType<AirQualityDataSetDto>(okResult.Value);
        Assert.Equal(expectedData, returnValue);
    }

    [Fact]
    public async Task AirQualityByUID_CallsRepositoryWithCorrectUID()
    {
        // Arrange
        string testUID = "456";
        var expectedData = new AirQualityDataSetDto();

        _mockRepository.Setup(repo => repo.GetDataByUID(testUID)).ReturnsAsync(expectedData);

        // Act
        await _controller.AirQualityByUID(testUID);

        // Assert
        _mockRepository.Verify(repo => repo.GetDataByUID(testUID), Times.Once);
    }

    [Fact]
    public async Task AirQualityByLatLon_CallsRepositoryWithCorrectCoordinates()
    {
        // Arrange
        float testLat = 40.7128f;
        float testLon = -74.0060f;
        var expectedData = new AirQualityDataSetDto();

        _mockRepository
            .Setup(repo => repo.GetDataByLatLon(testLat, testLon))
            .ReturnsAsync(expectedData);

        // Act
        await _controller.AirQualityByLatLon(testLat, testLon);

        // Assert
        _mockRepository.Verify(repo => repo.GetDataByLatLon(testLat, testLon), Times.Once);
    }
}
