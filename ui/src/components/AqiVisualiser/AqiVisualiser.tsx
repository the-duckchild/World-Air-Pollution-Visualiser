import { PerspectiveCamera, OrbitControls, Edges } from "@react-three/drei";
import "./AqiVisualiser.css";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Iaqi } from "../../Api/ApiClient";
import { useEffect, useRef, useState, useMemo, memo } from "react";
import { ParticleSystem } from "./ParticleSystems";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Grass from "./Grass";
import { Sun } from "./Sun";
import { CloudPattern } from "./Clouds";
import { PARTICLE_CONFIGS } from "./ParticleConfigs";

interface AirQualityVisualizationProps {
  data: Iaqi;
  overallAqi?: number; // Overall AQI value
  enabledSystems: Record<string, boolean>;
  longitude?: number; // Optional longitude for location-based time calculation
  latitude?: number; // Optional latitude for location-based time calculation
}

let BOUNDS = { x: 100, y: 20, z: 25 };
let ROTATION = {x: 0.2, y: 0, z: 0};


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

  const [isLoading, setIsLoading] = useState(true);
   const [terrainConfig, setTerrainConfig] = useState({
    planeSize: 800,
    grassInstances: 750000,
  });
  const [devicePixelRatio, setDevicePixelRatio] = useState<[number, number]>([1, 1.5]);

  // Hide loading after components are initialized
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Give time for Three.js to initialize

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateCameraPosition = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const isPortrait = windowHeight > windowWidth;

      let zoomDistance = 60; 
      let planeSize = 800;
      let grassInstances = 400000;
      let dpr: [number, number] = [1, 1.5]; // Default for desktop

 
      if (isPortrait) {
        BOUNDS = { x: 40, y: 40, z: 40 };
        ROTATION = {x: 0, y:0, z:0};
      }

      if (windowWidth < 600) {
        zoomDistance = 125;
        planeSize = 300;
        grassInstances = 40000;
        dpr = [1, 1]; // Lower DPR for small mobile
      } else if (windowWidth < 800) {
        zoomDistance = 100;
        planeSize = 400;
        grassInstances = 100000;
        dpr = [1, 1]; // Lower DPR for tablets
      } 
      else if (windowWidth < 1000) {
        zoomDistance = 110;
        planeSize = 500;
        grassInstances = 150000; 
      } else if (windowWidth < 1200) {
        zoomDistance = 95;
        planeSize = 800;
        grassInstances = 300000; 
      } else if (windowWidth < 1920) {
        zoomDistance = 70;
        planeSize = 800;
        grassInstances = 500000; 
      } else {
        zoomDistance = 55;
        planeSize = 800;
        grassInstances = 750000;
      }
      
      setCameraPosition([0, 0, zoomDistance]);
      setTerrainConfig({ planeSize, grassInstances });
      setDevicePixelRatio(dpr);
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

  // Memoize particle counts to avoid recalculation on every render
  const particleCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    PARTICLE_CONFIGS.forEach((config) => {
      if (!enabledSystems[config.key]) {
        counts[config.key] = 0;
        return;
      }

      let pollutantValue: number | undefined;

      if (config.key === "aqi") {
        pollutantValue = overallAqi;
      } else {
        const pollutantData = data[config.key as keyof Iaqi];
        pollutantValue = pollutantData?.v;
      }

      counts[config.key] = pollutantValue
        ? getParticleCount(pollutantValue)
        : 0;
    });

    return counts;
  }, [data, overallAqi, enabledSystems]);

  return (
    <>
      <div style={{ position: "relative" }}>
        {/* Legend - responsive positioning and layout */}
        {!isLoading && (
          <figure
            className="legend-container"
            aria-label="Air quality pollutants legend"
          >
            <figcaption
              className="legend-title"
            >
              Active Pollutants
            </figcaption>
            <div className="legend-grid">
              {(() => {
                const activeParticleConfigs = PARTICLE_CONFIGS.filter(
                  (config) => enabledSystems[config.key] && particleCounts[config.key] > 0
                );

                return (
                  <>
                    {activeParticleConfigs.length > 0 && (
                      <ul
                        aria-label="Active pollutants legend"
                        className="legend-list"
                      >
                        {activeParticleConfigs.map((config) => (
                          <li
                            key={config.key}
                            className="legend-item"
                          >
                            <div
                              className="legend-color-box"
                              style={{
                                backgroundColor: config.color,
                              }}
                            />
                            <span className="legend-label">
                              {config.shortLabel}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {activeParticleConfigs.length === 0 && (
                      <span className="legend-no-pollutants">
                        No Pollutants active
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </figure>
        )}
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <h3 className="loading-heading">
              Loading Air Quality Visualisation
            </h3>
            <p className="loading-text">
              Preparing environment...
            </p>
          </div>
        )}

        <div className="canvas-container">
          <Canvas
            gl={{
              antialias: false, // Disabled for better mobile performance
              alpha: false,
              powerPreference: "high-performance",
              stencil: false, // Disable stencil buffer: not required for this scene, reduces memory usage and can improve performance,
                              // especially on mobile devices. Enables faster context creation and lower GPU resource consumption.
              depth: true,
            }}
            dpr={devicePixelRatio} // Reactive pixel ratio based on device size
            performance={{ min: 0.5 }} // Allow lower frame rates on slow devices
          >
            <fog attach="fog" args={[0xcccccc, 200, 600]} />
            <Sun longitude={longitude} latitude={latitude} />
            <ambientLight color={0xffffff} intensity={0.3} />
            <OrbitControls
              ref={orbitControlsRef}
              enableDamping
              dampingFactor={0.05}
              minPolarAngle={0}
              maxPolarAngle={Math.PI * 0.53}
              minDistance={10}
              maxDistance={200}
            />
            <PerspectiveCamera
              makeDefault
              fov={45}
              near={1}
              far={400}
              position={cameraPosition}
            />

            <group position={[0, -25.1, 0]}>
              <Grass
                instances={terrainConfig.grassInstances}
                width={terrainConfig.planeSize}
                depth={terrainConfig.planeSize}
                windStrength={0.8}
              />
            </group>

            {/* Rolling hills terrain - fallback plane */}
            <mesh
              position={[0, -25.2, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[1, 1, 1]}>
              <planeGeometry args={[800, 800, 32, 32]} />
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
            <mesh rotation={[ROTATION.x, ROTATION.y, ROTATION.z]} renderOrder={2}>
              <boxGeometry args={[BOUNDS.x, BOUNDS.y, BOUNDS.z]} />

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
                const particleCount = particleCounts[config.key];

                if (!particleCount || !enabledSystems[config.key]) return null;

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
      </div>
    </>
  );
}

// Export memoized version to prevent unnecessary re-renders
export default memo(AqiVisualiser);
