interface ParticleSystemConfig {
  key: string;
  label: string;
  color: string;
}

export const PARTICLE_CONFIGS: ParticleSystemConfig[] = [
  { key: "aqi", label: "Air Quality Index", color: "#FFD700" },
  { key: "pm10", label: "PM10 Particles", color: "#F46A25" },
  { key: "pm25", label: "PM2.5 Particles", color: "#4D1A3E" },
  { key: "co", label: "Carbon Monoxide", color: "#12436D" },
  { key: "co2", label: "Carbon Dioxide", color: "#28A197" },
  { key: "no2", label: "Nitrogen Dioxide", color: "#801650" },
  { key: "so2", label: "Sulphur Dioxide", color: "#F9A70F" },

  
];