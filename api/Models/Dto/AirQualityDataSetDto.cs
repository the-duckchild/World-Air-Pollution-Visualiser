using CsvHelper;
using Microsoft.Net.Http.Headers;

namespace api.Models.Dto;

public class AirQualityDataSetDto
{
    // Add properties as needed
    public int Uid { get; set; }
    public string? Name { get; set; }
    public int AQI { get; set; }

    public string? DominantPollutant { get; set; }
    public int Humidity { get; set; }
    public int Ozone { get; set; }

    public int Pressure { get; set; }

    public int PM1 { get; set; }

    public int PM10 { get; set; }

    public int PM25 { get; set; }

    public int So2 { get; set; }

    public int Co { get; set; }

    public int Co2 { get; set; }

    public int No2 { get; set; }
    public int Wind { get; set; }

    public string? Data { get; set; }
};
