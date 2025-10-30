interface ParticleSystemConfig {
  key: string;
  label: string;
  color: string;
}

export const PARTICLE_CONFIGS: ParticleSystemConfig[] = [
  { key: "aqi", label: "AQI", color: "#FFD700" },
  { key: "co", label: "CO", color: "#12436D" },
  { key: "co2", label: "CO₂", color: "#28A197" },
  { key: "no2", label: "NO₂", color: "#801650" },
  { key: "pm10", label: "PM10", color: "#F46A25" },
  { key: "pm25", label: "PM2.5", color: "#4D1A3E" },
  { key: "so2", label: "SO₂", color: "#F9A70F" },
];