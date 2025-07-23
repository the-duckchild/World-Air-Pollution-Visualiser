using System.Globalization;
using api.Models.Database;
using CsvHelper;

namespace api.Helpers
{
    public class StationReader
    {
        public static IEnumerable<StationLocation> ReadStationsFromCsv(string filePath)
        {
            using var reader = new StreamReader(filePath);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            csv.Read();
            csv.ReadHeader();

            while (csv.Read())
            {
                var Name = csv.GetField<string>("Name");
                var Lat = csv.GetField<float>("Lat");
                var Lon = csv.GetField<float>("Lon");
                var UID = csv.GetField<int>("UID");

                yield return new StationLocation
                {
                    Name = Name,
                    Lat = Lat,
                    Lon = Lon,
                    Uid = UID,
                };
            }
        }
    }
}
