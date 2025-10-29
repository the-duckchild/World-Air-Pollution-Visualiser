import { PerspectiveCamera, OrbitControls, Edges } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Iaqi } from "../../Api/ApiClient";
import { useEffect, useRef, useState } from "react";
import { ParticleSystem } from "./ParticleSystems";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Grass from "./Grass";
import { Sun } from "./Sun";
import { CloudPattern } from "./Clouds";

interface AirQualityVisualizationProps {
  data: Iaqi;
  overallAqi?: number; // Overall AQI value
  enabledSystems: Record<string, boolean>;
  longitude?: number; // Optional longitude for location-based time calculation
  latitude?: number; // Optional latitude for location-based time calculation
}

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

const BOUNDS = { x: 100, y: 20, z: 25 };

export function AqiVisualiser({
  data,
  overallAqi,
  enabledSystems,
  longitude,
  latitude,
}: AirQualityVisualizationProps) {
  const allParticles = useRef(new Map());
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

  const [cameraPosition, setCameraPosition] = useState<
    [number, number, number]
  >([0, 0, 65]);

  useEffect(() => {
    const updateCameraPosition = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const isPortrait = windowHeight > windowWidth;
      const isMobile = windowWidth < 768;

      // Calculate zoom based on window size
      // Smaller windows need more zoom out to fit content
      let zoomDistance = 65; // Default for large desktop

      if (isMobile || isPortrait) {
        // For mobile/portrait, zoom out more based on how small the window is
        const minDimension = Math.min(windowWidth, windowHeight);
        if (minDimension < 800) {
          zoomDistance = 200; // Very small screens
        } else if (minDimension < 1200) {
          zoomDistance = 150; // Small screens
        } else {
          zoomDistance = 100; // Medium screens in portrait
        }
      } else {
        // For desktop landscape, adjust zoom based on width
        if (windowWidth < 1200) {
          zoomDistance = 85; // Smaller desktop windows
        } else if (windowWidth < 1920) {
          zoomDistance = 65; // Standard desktop
        } else {
          zoomDistance = 55; // Large desktop screens can zoom in more
        }
      }

      setCameraPosition([0, 0, zoomDistance]);
    };

    updateCameraPosition();
    window.addEventListener("resize", updateCameraPosition);

    return () => {
      window.removeEventListener("resize", updateCameraPosition);
    };
  }, []);

  // Reset OrbitControls when camera position changes
  useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
    }
  }, [cameraPosition]);

  const getParticleCount = (value: number) => {
    // Scale the particle count based on the value
    // Proportionally map AQI values from 0-500 to 0-800 particles
    return Math.max(0, Math.min(800, Math.round(value * 10)));
  };

  return (
    <>
      <div
        style={{
          width: "75vw",
          height: "50vh",
          border: "5px solid #ffffff",
          borderRadius: "25px",
        }}>
        <Canvas>
          <fog attach="fog" args={[0xcccccc, 200, 500]} />
          <Sun longitude={longitude} latitude={latitude} />
          <ambientLight color={0xffffff} intensity={0.3} />
          <OrbitControls
            ref={orbitControlsRef}
            enableDamping
            dampingFactor={0.05}
            minPolarAngle={0}
            maxPolarAngle={Math.PI * 0.599}
            minDistance={10}
            maxDistance={200}
          />
          <PerspectiveCamera
            makeDefault
            fov={45}
            near={1}
            far={1000}
            position={cameraPosition}
          />

          <group position={[0, -25.1, 0]}>
            <Grass
              instances={2500000}
              width={1000}
              depth={1000}
              windStrength={0.8}
            />
          </group>

          {/* Rolling hills terrain - fallback plane */}
          <mesh
            position={[0, -25.2, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[1, 1, 1]}>
            <planeGeometry args={[1000, 1000, 64, 64]} />
            <meshLambertMaterial
              color="#2E6F40"
              onBeforeCompile={(shader) => {
                shader.vertexShader = shader.vertexShader.replace(
                  "#include <begin_vertex>",
                  `
              #include <begin_vertex>
              float hillHeight = 8.0;
              float freq1 = 0.01;
              float freq2 = 0.005;
              float freq3 = 0.003;
              
              float hill1 = sin(position.x * freq1) * cos(position.y * freq1) * hillHeight * 0.8;
              float hill2 = sin(position.x * freq2 + 1.5) * cos(position.y * freq2 + 2.0) * hillHeight * 0.6;
              float hill3 = sin(position.x * freq3 + 3.0) * cos(position.y * freq3 + 1.0) * hillHeight * 0.4;
              
              transformed.z += hill1 + hill2 + hill3;
              `
                );
              }}
            />
          </mesh>

          <CloudPattern />
          <mesh rotation={[0.3, 0, 0]} renderOrder={2}>
            <boxGeometry args={[100, 20, 25]} />

            <meshStandardMaterial
              color={0xffffff}
              opacity={0.08}
              transparent={true}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
            <Edges
              linewidth={2}
              scale={1}
              threshold={15} // Display edges only when the angle between two faces exceeds this value (default=15 degrees)
              color="white"
            />

            {PARTICLE_CONFIGS.map((config) => {
              // Handle AQI differently since it's not in the iaqi object
              let pollutantValue: number | undefined;
              
              if (config.key === 'aqi') {
                pollutantValue = overallAqi;
              } else {
                const pollutantData = data[config.key as keyof Iaqi];
                pollutantValue = pollutantData?.v;
              }
              
              if (pollutantValue === undefined || !enabledSystems[config.key]) return null;

              const particleCount = getParticleCount(pollutantValue);

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
          </mesh>
        </Canvas>
      </div>
    </>
  );
}
