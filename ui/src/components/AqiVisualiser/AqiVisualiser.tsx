import { PerspectiveCamera, OrbitControls, Edges, Clouds, Cloud, Sky,} from "@react-three/drei";
import type { Iaqi } from "../../Api/ApiClient";
import { useEffect, useRef, useState } from "react";
import { ParticleSystem } from "./ParticleSystems";
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three';
import Grass from "./Grass";


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

const BOUNDS = { x: 100, y: 20, z: 25 };



export function AqiVisualiser({
  data,
  enabledSystems,
}: AirQualityVisualizationProps) {

  const aspect = 800 / 600;
  const allParticles = useRef(new Map());
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([12, 8, 5]);
  

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

  // Calculate sun position based on current time
  const getSunPosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeDecimal = hours + minutes / 60; // Convert to decimal hours (0-24)
    
    // Calculate sun angle based on time (sunrise ~6am, sunset ~18pm)
    // Map 6-18 hours to 0-180 degrees (sunrise to sunset)
    const sunAngle = ((timeDecimal - 6) / 12) * Math.PI; // 0 to π radians
    
    // Calculate sun position
    const sunHeight = Math.sin(sunAngle) * 100; // Height varies with sun angle
    const sunDistance = 150; // Distance from origin
    
    // Clamp sun height to reasonable bounds
    const clampedHeight = Math.max(5, Math.min(100, sunHeight));
    
    // Position: x, y, z
    const sunX = Math.cos(sunAngle) * sunDistance;
    const sunY = clampedHeight;
    const sunZ = Math.sin(sunAngle) * sunDistance * 0.3; // Slight Z variation
    
    return [sunX, sunY, sunZ] as [number, number, number];
  };

  const [sunPosition, setSunPosition] = useState<[number, number, number]>(getSunPosition());

  // Update sun position every minute
  useEffect(() => {
    const updateSunPosition = () => {
      setSunPosition(getSunPosition());
    };

    // Update immediately and then every minute
    updateSunPosition();
    const interval = setInterval(updateSunPosition, 60000); 

    return () => clearInterval(interval);
  }, []);

  function CloudPattern() {
    // Create individual refs for each cloud group
    const cloudGroup1 = useRef<THREE.Group>(null);
    const cloudGroup2 = useRef<THREE.Group>(null);
    const cloudGroup3 = useRef<THREE.Group>(null);
    const cloudGroup4 = useRef<THREE.Group>(null);
    const cloudGroup5 = useRef<THREE.Group>(null);
    const cloudGroup6 = useRef<THREE.Group>(null);
    const cloudGroup7 = useRef<THREE.Group>(null);
    const cloudGroup8 = useRef<THREE.Group>(null);
    const cloudGroup9 = useRef<THREE.Group>(null);
    const cloudGroup10 = useRef<THREE.Group>(null);
    
    // Array of refs for easier iteration
    const cloudGroupRefs = [
      cloudGroup1, cloudGroup2, cloudGroup3, cloudGroup4, cloudGroup5,
      cloudGroup6, cloudGroup7, cloudGroup8, cloudGroup9, cloudGroup10
    ];
    
    // Generate random initial positions and properties for each cloud group
    const [cloudConfigs] = useState(() => {
      // Get initial canvas width for cloud positioning
      const initialCanvasWidth = window.innerWidth * 0.75; // 75vw
      // Calculate safe Z range: not behind camera (65) and not in fog (starts at 200)
      const maxSafeZ = Math.min(150, initialCanvasWidth * 0.3); // Scale with canvas width, max 150
      const minSafeZ = -maxSafeZ; // Symmetric range in front of camera
      
      return Array.from({ length: 10 }, (_, index) => ({
        id: index,
        initialX: Math.random() * initialCanvasWidth - (initialCanvasWidth / 2), // Random X across canvas width
        initialY: Math.random() * 60 + 10,  // Random Y between 10 and 70
        initialZ: Math.random() * (maxSafeZ - minSafeZ) + minSafeZ, // Random Z based on canvas width, safe from camera/fog
        speed: Math.random() * 9 + 1,     // Random speed between 1 and 10
        seed: index + 1,
        scale: (Math.random() * 1.5 + 0.8) * 2, 
        volume: Math.random() * 8 + 5,      // Random volume between 5 and 13
        color: (() => {
          const rand = Math.random();
          if (rand > 0.6) return "white";
          if (rand > 0.3) return "lightgrey"; 
          return "#E0E0E0"; // Light gray instead of dark grey
        })(),
        fade: Math.random() * 30 + 70       // Random fade between 70 and 100 (lighter overall)
      }));
    });
    
    const driftSpeed = 6; // Base drift speed
    
    useFrame((state, delta) => {
      const canvasWidth = state.size.width;
      const leftEdge = -(canvasWidth/2) - 50; // Extra padding for smooth reset
      const rightEdge = (canvasWidth/2) + 50;
      
      // Move each cloud group
      cloudGroupRefs.forEach((ref, index) => {
        if (ref.current) {
          const config = cloudConfigs[index];
          ref.current.position.x += (driftSpeed + config.speed * 0.1) * delta;
          
          // Reset to left edge when reaching right edge
          if (ref.current.position.x > rightEdge) {
            ref.current.position.x = leftEdge;
          }
        }
      });
    });

    return (
      <>
        {cloudConfigs.map((config, index) => (
          <group 
            key={config.id}
            ref={cloudGroupRefs[index]} 
            position={[config.initialX, config.initialY, config.initialZ]}
          >
            <Clouds material={THREE.MeshLambertMaterial}>
              <Cloud 
                segments={40} 
                bounds={[8, 3, 3]} 
                volume={config.volume} 
                color={config.color}
                seed={config.seed}
                scale={config.scale}
                fade={config.fade}
                position={[0, 0, 0]} 
              />
              {/* Add a second cloud for more density */}
              <Cloud 
                segments={30} 
                bounds={[6, 2, 2]} 
                volume={config.volume * 0.6} 
                color={config.color === "white" ? "lightgrey" : "white"}
                seed={config.seed + 10}
                scale={config.scale * 0.7}
                fade={config.fade * 0.8}
                position={[Math.random() * 10 - 5, Math.random() * 5 - 2.5, Math.random() * 10 - 5]} 
              />
            </Clouds>
          </group>
        ))}
      </>
    );
  }

  const getParticleCount = (value: number) => {
    // Scale the particle count based on the value
    // Proportionally map AQI values from 0-500 to 0-250 particles
    return Math.max(0, Math.min(250, Math.round(value * 100)));
  };

  return (
    <>
    <div style={{ width:"75vw", height: "50vh", border: '5px solid #ffffff', borderRadius: '25px'}}>
      <Canvas>
        <fog attach="fog" args={[0xcccccc, 200, 500]} />
        <Sky sunPosition={sunPosition} azimuth={0.25}/>  
      <ambientLight color={0xffffff} intensity={1} />
      {/* <directionalLight color="white" intensity={0.7} position={[0, 3, 5]} /> */}
      <OrbitControls 
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
        aspect={aspect}
        near={1}
        far={1000}
        position={[0, 0, 65]}
      />
      
      <group position={[0, -25.1, 0]}>
        <Grass instances={2500000} width={1000} depth={1000} windStrength={0.8} />
      </group>

      {/* Rolling hills terrain - fallback plane */}
      <mesh position={[0, -25.2, 0]} rotation={[-Math.PI/2, 0, 0]} scale={[1, 1, 1]}>
        <planeGeometry args={[1000, 1000, 64, 64]} />
        <meshLambertMaterial 
          color="#2E6F40" 
          onBeforeCompile={(shader) => {
            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
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
        
      </mesh>
      </Canvas>
      </div>
    </>
  );
}
