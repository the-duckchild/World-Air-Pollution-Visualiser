using System.ComponentModel;
using CsvHelper;
using CsvHelper.Configuration.Attributes;
using Microsoft.Net.Http.Headers;

namespace api.Models.Dto;

public class AirQualityDataSetDto
{
    public string? Status { get; set; }
    public Data? Data { get; set; }
}

public class Data
{
    public int Aqi { get; set; }
    public int Idx { get; set; }
    public List<Attribution>? attributions { get; set; }
    public City? City { get; set; }
    public string? Dominentpol { get; set; }
    public Iaqi? Iaqi { get; set; }
    public Time? Time { get; set; }
}

// Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse);
public class Attribution
{
    public string? Url { get; set; }
    public string? Name { get; set; }
    public string? Station { get; set; }
}

public class City
{
    public List<double>? geo { get; set; }
    public string? Name { get; set; }
    public string? Url { get; set; }
    public string? Location { get; set; }
}

public class Iaqi
{
    public Co? Co { get; set; }
    public Co2? Co2 { get; set; }
    public No2? No2 { get; set; }
    public Pm10? Pm10 { get; set; }
    public Pm25? Pm25 { get; set; }
    public So2? So2 { get; set; }
}

public class Time
{
    public string? SaveChanges { get; set; }
    public string? Tz { get; set; }
    public int? V { get; set; }
    public DateTime Iso { get; set; }
}

public class Co
{
    public int V { get; set; } = 0;
}

public class Co2
{
    public int V { get; set; } = 0;
}

public class No2
{
    public int V { get; set; } = 0;
}

public class Pm10
{
    public int V { get; set; }
}

public class Pm25
{
    public int V { get; set; }
}

public class So2
{
    public int V { get; set; }
}


// public AirQualityDataSetDto(
//     int idx,
//     string name,
//     int aqi,
//     string dominantPollutant,
//     int humidity,
//     int ozone,
//     int pressure,
//     int pm1,
//     int pm10,
//     int pm25,
//     int so2,
//     int co,
//     int co2,
//     int no2,
//     int wind
// )
// {
//     Uid = idx;
//     Name = name;
//     AQI = aqi;
//     DominantPollutant = dominantPollutant;
//     Humidity = humidity;
//     Ozone = ozone;
//     Pressure = pressure;
//     PM1 = pm1;
//     PM10 = pm10;
//     PM25 = pm25;
//     So2 = so2;
//     Co = co;
//     Co2 = co2;
//     No2 = no2;
//     Wind = wind;
// }
