import { Clouds, Cloud } from "@react-three/drei";
import { useRef, useState, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const CloudPattern = memo(function CloudPattern() {
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
    cloudGroup1,
    cloudGroup2,
    cloudGroup3,
    cloudGroup4,
    cloudGroup5,
    cloudGroup6,
    cloudGroup7,
    cloudGroup8,
    cloudGroup9,
    cloudGroup10,
  ];

  // Default canvas width in viewport width units (must match --canvas-width in CSS)
  const DEFAULT_CANVAS_WIDTH_VW = 75;

  // Generate random initial positions and properties for each cloud group
  const [cloudConfigs] = useState(() => {
    // NOTE: Cloud positioning depends on the `--canvas-width` CSS custom property.
    // This code defensively reads the value at runtime and falls back to
    // DEFAULT_CANVAS_WIDTH_VW if CSS is not yet loaded, the property is missing,
    // or it uses unexpected units. AqiVisualiser.tsx should import the CSS that
    // defines `--canvas-width` before this component is initialized.

    const isBrowser =
      typeof window !== "undefined" && typeof document !== "undefined";

    // Start with a default canvas width in pixels based on DEFAULT_CANVAS_WIDTH_VW.
    // When not in a browser (e.g. SSR/tests), we use a fixed 1024px viewport width
    // to avoid touching `window` while keeping the same proportional behavior.
    const defaultViewportWidth = isBrowser ? window.innerWidth : 1024;
    let initialCanvasWidth =
      defaultViewportWidth * (DEFAULT_CANVAS_WIDTH_VW / 100);

    if (isBrowser) {
      let canvasWidthValue = "";
      try {
        canvasWidthValue = getComputedStyle(document.documentElement)
          .getPropertyValue("--canvas-width")
          .trim();
      } catch {
        // If getComputedStyle fails for any reason, we keep the default width.
      }

      if (canvasWidthValue) {
        // Parse the value and unit - expects 'vw' units as defined in CSS
        // Regex ensures valid decimal number format (e.g., "75vw", "75.5vw")
        const match = canvasWidthValue.match(/^(\d+(?:\.\d+)?)(vw)$/);

        if (match) {
          const vwValue = parseFloat(match[1]);
          // Validate the parsed value is a valid number
          if (!isNaN(vwValue) && isFinite(vwValue) && vwValue > 0) {
            initialCanvasWidth = window.innerWidth * (vwValue / 100);
          }
          // If invalid, we silently keep the default based on DEFAULT_CANVAS_WIDTH_VW.
        }
        // If units are unexpected or the value doesn't match, we keep the default.
      }
    }
    // Calculate safe Z range: not behind camera (65) and not in fog (starts at 200)
    const maxSafeZ = Math.min(150, initialCanvasWidth * 0.3); // Scale with canvas width, max 150
    const minSafeZ = -maxSafeZ; // Symmetric range in front of camera

    return Array.from({ length: 10 }, (_, index) => ({
      id: index,
      initialX: Math.random() * initialCanvasWidth - initialCanvasWidth / 2, // Random X across canvas width
      initialY: Math.random() * 60 + 10, // Random Y between 10 and 70
      initialZ: Math.random() * (maxSafeZ - minSafeZ) + minSafeZ, // Random Z based on canvas width, safe from camera/fog
      speed: Math.random() * 9 + 1, 
      seed: index + 1,
      scale: (Math.random() * 1.5 + 0.8) * 2,
      volume: Math.random() * 8 + 5,
      color: (() => {
        const rand = Math.random();
        if (rand > 0.6) return "white";
        if (rand > 0.3) return "lightgrey";
        return "#E0E0E0"; // Light gray instead of dark grey
      })(),
      fade: Math.random() * 30 + 70, // Random fade between 70 and 100 (lighter overall)
    }));
  });

  const driftSpeed = 6; // Base drift speed

  useFrame((state, delta) => {
    const canvasWidth = state.size.width;
    const leftEdge = -(canvasWidth / 2) - 50; // Extra padding for smooth reset
    const rightEdge = canvasWidth / 2 + 50;

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
          position={[config.initialX, config.initialY, config.initialZ]}>
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
              position={[
                Math.random() * 10 - 5,
                Math.random() * 5 - 2.5,
                Math.random() * 10 - 5,
              ]}
            />
          </Clouds>
        </group>
      ))}
    </>
  );
});