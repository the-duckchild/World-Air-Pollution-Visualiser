interface ParticleSystemConfig {
  key: string;
  label: string;
  shortLabel: string;
  color: string;
}

export const PARTICLE_CONFIGS: ParticleSystemConfig[] = [
  { key: "aqi", label: "Air Quality Index", shortLabel: "AQI", color: "#e62314" },
  { key: "pm10", label: "PM10 Particles", shortLabel: "PM10" , color: "#72bad5" },
  { key: "pm25", label: "PM2.5 Particles", shortLabel: "PM2.5",color: "#73d707" },
  { key: "co", label: "Carbon Monoxide", shortLabel: "CO", color: "#d5d5d5"},
  { key: "co2", label: "Carbon Dioxide", shortLabel: "CO2", color: "#555555" },
  { key: "no2", label: "Nitrogen Dioxide", shortLabel: "NO2", color: "#670d0b" },
  { key: "so2", label: "Sulphur Dioxide", shortLabel: "SO2", color: "#fff700" },

  
];