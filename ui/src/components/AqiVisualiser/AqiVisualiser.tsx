import { PerspectiveCamera, OrbitControls, Edges } from "@react-three/drei";
import type { Iaqi } from "../../Api/ApiClient";
import { useEffect, useRef, useState } from "react";
import { ParticleSystem } from "./ParticleSystems";
import { Canvas } from '@react-three/fiber'

interface AirQualityVisualizationProps {
  data: Iaqi;
  enabledSystems: Record<string, boolean>;
}

interface ParticleSystemConfig {
  key: string;
  label: string;
  color: string;
}

const PARTICLE_CONFIGS: ParticleSystemConfig[] = [
  { key: "co", label: "CO", color: "#12436D" },
  { key: "co2", label: "CO₂", color: "#28A197" },
  { key: "no2", label: "NO₂", color: "#801650" },
  { key: "pm10", label: "PM10", color: "#F46A25" },
  { key: "pm25", label: "PM2.5", color: "#4D1A3E" },
  { key: "so2", label: "SO₂", color: "#F9A70F" },
];

const BOUNDS = { x: 65, y: 20, z: 25 };

export function AqiVisualiser({
  data,
  enabledSystems,
}: AirQualityVisualizationProps) {

  const aspect = 800 / 600;
  const allParticles = useRef(new Map());
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([12, 8, 12]);
  

  useEffect(() => {
    const updateCameraPosition = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isMobile = window.innerWidth < 768;

      if (isPortrait || isMobile) {
        // Zoom out more on mobile/portrait to fit the boundary mesh
        setCameraPosition([10, 6, 10]);
      } else {
        // Default camera position for desktop/landscape
        setCameraPosition([12, 8, 12]);
      }
    };

    updateCameraPosition();
    window.addEventListener("resize", updateCameraPosition);

    return () => {
      window.removeEventListener("resize", updateCameraPosition);
    };
  }, []);

    const getParticleCount = (value: number) => {
    // Scale the particle count based on the value
    // Proportionally map AQI values from 0-500 to 0-250 particles
    return Math.max(0, Math.min(250, Math.round(value * 100)));
  };

  return (
    <>
    <Canvas camera={{ position: cameraPosition, fov: 50 }}>
      <ambientLight color={0xffffff} intensity={1} />
      {/* <directionalLight color="white" intensity={0.7} position={[0, 3, 5]} /> */}
      <OrbitControls enableDamping dampingFactor={0.05} />
      <PerspectiveCamera
        makeDefault
        fov={45}
        aspect={aspect}
        near={1}
        far={1000}
        position={[0, 0, 50]}
      />
      <mesh rotation={[0.3, 0, 0]}>
        <boxGeometry args={[65, 20, 25]} />

        <meshStandardMaterial
          color={0xffffff}
          opacity={0.08}
          transparent={true}
        />
        <Edges
          linewidth={2}
          scale={1}
          threshold={15} // Display edges only when the angle between two faces exceeds this value (default=15 degrees)
          color="white"
        />

       { PARTICLE_CONFIGS.map((config) => {
          const pollutantData = data[config.key as keyof Iaqi];
          if (!pollutantData || !enabledSystems[config.key]) return null;

          const particleCount = getParticleCount(pollutantData.v);

          return (
            <ParticleSystem
              key={config.key}
              systemId={config.key}
              count={particleCount}
              color={config.color}
              bounds={BOUNDS}
              allParticles={allParticles}
            />
          );
        })}
        <mesh></mesh>
      </mesh>
      </Canvas>
    </>
  );
}
