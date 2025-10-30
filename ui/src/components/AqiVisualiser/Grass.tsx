import { useRef, useMemo, useEffect, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// TypeScript interfaces
interface GrassProps {
  /** Number of grass blade instances */
  instances?: number;
  /** Width of the grass field (X-axis) */
  width?: number;
  /** Depth of the grass field (Z-axis) */
  depth?: number;
  /** Height of individual grass blades */
  bladeHeight?: number;
  /** Width of individual grass blades */
  bladeWidth?: number;
  /** Wind strength multiplier */
  windStrength?: number;
}

/**
 * Grass component that renders thousands of animated grass blades using instancedMesh
 * Uses custom shaders for realistic wind animation
 */
const Grass = memo(function Grass({
  instances = 5000,
  width = 100,
  depth = 100,
  bladeHeight = 1.5,
  bladeWidth = 0.1,
  windStrength = 1
}: GrassProps) {
  
  // Refs for the instanced mesh and shader material
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Shader definitions
  const vertexShader = `
    varying vec2 vUv;
    uniform float time;
    
    void main() {
      vUv = uv;
      
      // VERTEX POSITION
      vec4 mvPosition = vec4(position, 1.0);
      #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
      #endif
      
      // DISPLACEMENT - stronger on blade tips
      float dispPower = 1.0 - cos(uv.y * 3.1416 / 2.0);
      float displacement = sin(mvPosition.z + time * 10.0) * (0.1 * dispPower);
      mvPosition.z += displacement;
      
      vec4 modelViewPosition = modelViewMatrix * mvPosition;
      gl_Position = projectionMatrix * modelViewPosition;
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D grassTexture;
    uniform sampler2D alphaTexture;
    uniform vec3 grassColor;
    
    void main() {
      // Sample the diffuse texture
      vec4 texColor = texture2D(grassTexture, vUv);
      
      // Sample the alpha texture for transparency
      float alpha = texture2D(alphaTexture, vUv).r;
      
      // Mix texture with base grass color
      vec3 finalColor = texColor.rgb * grassColor;
      
      // Apply vertical gradient for lighting variation
      float clarity = (vUv.y * 0.5) + 0.5;
      finalColor *= clarity;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  // Create optimized geometry once
  const grassGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(bladeWidth, bladeHeight, 1, 2); // Reduced from 4 to 2 segments
    geometry.translate(0, bladeHeight / 2, 0); // Move lowest point to 0
    // Pre-compute and cache geometry data
    geometry.computeVertexNormals();
    return geometry;
  }, [bladeWidth, bladeHeight]);

  // Load textures
  const grassTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/src/assets/blade_diffuse.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  const alphaTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/src/assets/blade_alpha.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Create optimized shader material once
  const grassMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        grassTexture: { value: grassTexture },
        alphaTexture: { value: alphaTexture },
        grassColor: { value: new THREE.Color(0.7, 1.0, 0.3) } // Customizable grass color
      },
      side: THREE.DoubleSide,
      // Optimized transparency settings to fix visibility issues
      transparent: true,
      alphaTest: 0.3, // Lower threshold for better visibility
      depthWrite: true, // Enable depth write to prevent sorting issues
      depthTest: true
    });
  }, [vertexShader, fragmentShader, grassTexture, alphaTexture]);

  // Memoized hill height calculation function (matches terrain shader)
  const getHillHeight = useMemo(() => {
    // Pre-calculate constants outside the function
    const hillHeight = 8.0;
    const freq1 = 0.01;
    const freq2 = 0.005;
    const freq3 = 0.003;
    const amp1 = hillHeight * 0.8;
    const amp2 = hillHeight * 0.6;
    const amp3 = hillHeight * 0.4;
    
    return (x: number, z: number) => {
      // Match shader exactly: plane rotation [-π/2,0,0] means shader position.y = world -z
      const negZ = -z;
      const hill1 = Math.sin(x * freq1) * Math.cos(negZ * freq1) * amp1;
      const hill2 = Math.sin(x * freq2 + 1.5) * Math.cos(negZ * freq2 + 2.0) * amp2;
      const hill3 = Math.sin(x * freq3 + 3.0) * Math.cos(negZ * freq3 + 1.0) * amp3;
      
      return hill1 + hill2 + hill3;
    };
  }, []); // Empty dependency array - constants don't change

  // Position grass instances on mount with performance optimizations
  useEffect(() => {
    if (meshRef.current) {
      const dummy = new THREE.Object3D();
      
      // Batch matrix updates for better performance
      const matrices: THREE.Matrix4[] = [];
      
      for (let i = 0; i < instances; i++) {
        // Random position within the field
        const x = (Math.random() - 0.5) * width;
        const z = (Math.random() - 0.5) * depth;
        const y = getHillHeight(x, z) + 0.2; // Position grass slightly above hills surface
        
        dummy.position.set(x, y, z);
        
        // Random scale and rotation
        dummy.scale.setScalar(0.5 + Math.random() * 0.5);
        dummy.rotation.y = Math.random() * Math.PI;
        
        dummy.updateMatrix();
        matrices.push(dummy.matrix.clone());
      }
      
      // Apply all matrices at once
      for (let i = 0; i < matrices.length; i++) {
        meshRef.current.setMatrixAt(i, matrices[i]);
      }
      
      meshRef.current.instanceMatrix.needsUpdate = true;
      // Enable frustum culling for better performance
      meshRef.current.frustumCulled = true;
    }
  }, [instances, width, depth, getHillHeight]);

  // Optimized wind animation with reduced update frequency
  useFrame((state) => {
    if (materialRef.current) {
      // Update time uniform (this is lightweight)
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * windStrength;
    }
  });

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[grassGeometry, grassMaterial, instances]}
      material={grassMaterial}
      castShadow={false} // Disable shadow casting for performance
      receiveShadow={false} // Disable shadow receiving for performance
      onUpdate={(self) => {
        materialRef.current = self.material as THREE.ShaderMaterial;
        // Set render order to ensure grass renders properly with transparent objects
        self.renderOrder = 1;
      }}
    />
  );
});

export default Grass;