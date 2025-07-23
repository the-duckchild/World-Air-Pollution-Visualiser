namespace api.Models.Database;

public class StationLocation
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Country { get; set; }
    public float Lat { get; set; }
    public float Lon { get; set; }
    public int Uid { get; set; }
}
