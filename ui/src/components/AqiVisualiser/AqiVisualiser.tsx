import { PerspectiveCamera, OrbitControls, Edges } from "@react-three/drei";
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
          <div
            className="legend-container"
            style={{
              position: "absolute",
              bottom: "10px",
              right: "20px",
              left: "auto",
              backgroundColor: "rgba(255, 255, 255, 0.45)",
              backdropFilter: "blur(10px)",
              padding: "var(--spacing-sm)",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              zIndex: 1000,
              minWidth: "180px",
            }}
          >
            <h4
              className="legend-title"
              style={{
                margin: "0 0 var(--spacing-xs) 0",
                fontSize: "var(--font-size-sm)",
                fontWeight: "600",
                color: "#2c2c2c",
                lineHeight: "var(--line-height-tight)"
              }}
            >
              Active Pollutants
            </h4>
            <div 
              className="legend-grid"
              style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(1, 1fr)",
                gap: "var(--spacing-xs)"
              }}
            >
              {PARTICLE_CONFIGS.filter(config => enabledSystems[config.key] && particleCounts[config.key] > 0).map((config) => (
                <div
                  key={config.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-xs)",
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: config.color,
                      borderRadius: "3px",
                      flexShrink: 0,
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <span
                    className="legend-label"
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "#2c2c2c",
                      lineHeight: "var(--line-height-normal)",
                    }}
                  >
                    {config.shortLabel}
                  </span>
                </div>
              ))}
              {PARTICLE_CONFIGS.filter(config => enabledSystems[config.key] && particleCounts[config.key] > 0).length === 0 && (
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "#666",
                    fontStyle: "italic",
                    lineHeight: "var(--line-height-normal)",
                  }}
                >
                  No Pollutants active
                </span>
              )}
            </div>
            <style>{`
              @media (max-width: 768px) {
                .legend-container {
                  left: 15px !important;
                  right: 15px !important;
                  bottom: 10px !important;
                  min-width: auto !important;
                  width: calc(100% - 30px) !important;
                }
                .legend-title {
                  display: none !important;
                }
                .legend-grid {
                  grid-template-columns: repeat(3, 1fr) !important;
                }
                .legend-label {
                  font-size: 0.7rem !important;
                }
              }
            `}</style>
          </div>
        )}
        
        {/* Loading overlay */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "75vw",
              height: "45vh",
              border: "5px solid #ffffff",
              borderRadius: "25px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(248, 249, 250, 0.95)",
              zIndex: 900,
              backdropFilter: "blur(2px)",
            }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid #e9ecef",
                borderTop: "4px solid #007bff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "20px",
              }}
            />
            <h3
              style={{
                color: "#495057",
                fontSize: "var(--font-size-lg)",
                lineHeight: "var(--line-height-tight)",
                fontWeight: "600",
                margin: "0 0 8px 0",
              }}>
              Loading Air Quality Visualisation
            </h3>
            <p
              style={{
                color: "#6c757d",
                fontSize: "var(--font-size-sm)",
                lineHeight: "var(--line-height-normal)",
                margin: 0,
              }}>
              Preparing environment...
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        <div
          style={{
            width: "75vw",
            height: "45vh",
            border: "5px solid #ffffff",
            borderRadius: "25px",
          }}>
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
