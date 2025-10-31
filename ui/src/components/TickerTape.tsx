import { motion } from "framer-motion"

interface CityData {
  city: string;
  country: string;
  aqi: number;
  pollutant: string;
}

const mockCityData: CityData[] = [
  { city: "New York", country: "USA", aqi: 65, pollutant: "PM2.5" },
  { city: "London", country: "UK", aqi: 42, pollutant: "NO2" },
  { city: "Tokyo", country: "Japan", aqi: 38, pollutant: "PM2.5" },
  { city: "Delhi", country: "India", aqi: 156, pollutant: "PM2.5" },
  { city: "Beijing", country: "China", aqi: 89, pollutant: "PM2.5" },
  { city: "Paris", country: "France", aqi: 51, pollutant: "NO2" },
  { city: "Sydney", country: "Australia", aqi: 28, pollutant: "O3" },
  { city: "Mexico City", country: "Mexico", aqi: 94, pollutant: "PM2.5" },
  { city: "São Paulo", country: "Brazil", aqi: 73, pollutant: "PM2.5" },
  { city: "Cairo", country: "Egypt", aqi: 167, pollutant: "PM2.5" },
  { city: "Mumbai", country: "India", aqi: 142, pollutant: "PM2.5" },
  { city: "Los Angeles", country: "USA", aqi: 87, pollutant: "O3" },
];

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return "text-green-600";
  if (aqi <= 100) return "text-yellow-600";
  if (aqi <= 150) return "text-orange-600";
  if (aqi <= 200) return "text-red-600";
  if (aqi <= 300) return "text-purple-600";
  return "text-red-800";
};

const getAQIBg = (aqi: number) => {
  if (aqi <= 50) return "bg-green-100";
  if (aqi <= 100) return "bg-yellow-100";
  if (aqi <= 150) return "bg-orange-100";
  if (aqi <= 200) return "bg-red-100";
  if (aqi <= 300) return "bg-purple-100";
  return "bg-red-200";
};

export function TickerTape() {
  const duplicatedData = [...mockCityData, ...mockCityData];

  return (
    <div className="w-full bg-muted border-t overflow-hidden py-2 fixed bottom-0">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{
            x: [0, -50 * duplicatedData.length],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}>
          {duplicatedData.map((city, index) => (
            <div
              key={`${city.city}-${index}`}
              className="flex items-center gap-3 px-4 py-1 rounded-full bg-background shadow-sm min-w-fit">
              <span className="text-sm font-medium">
                {city.city}, {city.country}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${getAQIBg(
                  city.aqi
                )} ${getAQIColor(city.aqi)} font-medium`}>
                AQI {city.aqi}
              </span>
              <span className="text-xs text-muted-foreground">
                {city.pollutant}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

  );
}