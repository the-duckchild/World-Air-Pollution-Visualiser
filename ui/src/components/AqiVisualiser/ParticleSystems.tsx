import { useRef, useMemo } from "react";
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three';

interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
}

interface ParticleSystemProps {
    count: number;
    color: string;
    bounds: {x: number, y: number, z: number};
    allParticles: React.RefObject<Map<string, Particle[]>>;
    systemId: string;
}

export function ParticleSystem({ count, color, bounds, allParticles, systemId}: ParticleSystemProps){

    const meshRef = useRef<THREE.InstancedMesh>(null)

    const particles = useMemo(() => {
    const particleArray: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particleArray.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * bounds.x * 0.99,
          (Math.random() - 0.5) * bounds.y * 0.99,
          (Math.random() - 0.5) * bounds.z * 0.99,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.06,
          (Math.random() - 0.5) * 0.06,
          (Math.random() - 0.5) * 0.06
        ),
      });
    }
    allParticles.current.set(systemId, particleArray);
    return particleArray;
  }, [count, bounds, systemId, allParticles]);

    const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
    const particleRadius = 0.2;

      useFrame(() => {
    if (!meshRef.current) return;

    // Update particle positions and handle collisions
    particles.forEach((particle: Particle, i: number) => {
      // Update position
      particle.position.add(particle.velocity);

      // Bounce off boundary walls
      const halfBounds = {
        x: bounds.x / 2,
        y: bounds.y / 2,
        z: bounds.z / 2,
      };

      if (Math.abs(particle.position.x) > halfBounds.x - particleRadius) {
        particle.velocity.x *= -1;
        particle.position.x = Math.sign(particle.position.x) * (halfBounds.x - particleRadius);
      }
      if (Math.abs(particle.position.y) > halfBounds.y - particleRadius) {
        particle.velocity.y *= -1;
        particle.position.y = Math.sign(particle.position.y) * (halfBounds.y - particleRadius);
      }
      if (Math.abs(particle.position.z) > halfBounds.z - particleRadius) {
        particle.velocity.z *= -1;
        particle.position.z = Math.sign(particle.position.z) * (halfBounds.z - particleRadius);
      }

      // Check collisions with all other particles from all systems
      allParticles.current.forEach((otherSystemParticles, otherSystemId) => {
        otherSystemParticles.forEach((other, j) => {
          // Skip self
          if (otherSystemId === systemId && i === j) return;

          const distance = particle.position.distanceTo(other.position);
          const minDistance = particleRadius * 2;

          if (distance < minDistance && distance > 0) {
            // Calculate collision response
            const normal = new THREE.Vector3()
              .subVectors(particle.position, other.position)
              .normalize();

            // Separate particles
            const overlap = minDistance - distance;
            particle.position.add(normal.clone().multiplyScalar(overlap / 2));
            other.position.sub(normal.clone().multiplyScalar(overlap / 2));

            // Exchange velocity components along collision normal
            const relativeVelocity = new THREE.Vector3().subVectors(
              particle.velocity,
              other.velocity
            );
            const speed = relativeVelocity.dot(normal);

            if (speed < 0) return;

            particle.velocity.sub(normal.clone().multiplyScalar(speed));
            other.velocity.add(normal.clone().multiplyScalar(speed));
          }
        });
      });

      // Update instance matrix
      tempMatrix.setPosition(particle.position);
      meshRef.current!.setMatrixAt(i, tempMatrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

    return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[particleRadius, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </instancedMesh>
  );
}
