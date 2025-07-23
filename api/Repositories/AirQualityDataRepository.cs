using System;
using api.Database;
using api.Models.Dto;
using dotenv.net;
using Microsoft.AspNetCore.Http.HttpResults;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;

namespace api.Repositories;

public interface IAirQualityDataRepository
{
    Task<Newtonsoft.Json.Linq.JToken> GetDataByUID(int uid);
}

public class AirQualityDataRepository : IAirQualityDataRepository
{
    private readonly AirPollutionDbContext _context;

    public AirQualityDataRepository(AirPollutionDbContext context)
    {
        _context = context;
    }

    public async Task<Newtonsoft.Json.Linq.JToken> GetDataByUID(int uid)
    {
        var envVars = DotEnv.Read();
        var client = new RestClient(
            $"http://api.waqi.info/feed/@{uid}/?token={envVars["AIR_POLLUTION_API_KEY"]}"
        );
        Console.WriteLine(envVars["AIR_POLLUTION_API_KEY"]);
        var request = new RestRequest("search", Method.Get);
        RestResponse response = await client.ExecuteAsync(request);

        if (response.IsSuccessful && response.Content != null)
        {
            var content = JsonConvert.DeserializeObject<JToken>(response.Content);

            return content;
        }

        throw new Exception("No Station found with UID {uid}");
    }
}
