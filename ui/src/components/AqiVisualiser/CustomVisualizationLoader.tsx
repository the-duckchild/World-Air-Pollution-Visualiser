import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

interface CustomLoaderProps {
  width?: string;
  height?: string;
}

export function CustomVisualizationLoader({ 
  width = "75vw", 
  height = "50vh" 
}: CustomLoaderProps) {
  const { progress } = useProgress();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate initialization time
    const timer = setTimeout(() => setIsReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isReady && progress === 100) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        border: "5px solid #ffffff",
        borderRadius: "25px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(248, 249, 250, 0.95)",
        zIndex: 1000,
        backdropFilter: "blur(5px)"
      }}
    >
      {/* Animated spinner */}
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
      
      {/* Loading text */}
      <h3 
        style={{
          color: "#495057",
          fontSize: "var(--font-size-lg)",
          lineHeight: "var(--line-height-tight)",
          fontWeight: "600",
          margin: "0 0 8px 0",
          textAlign: "center",
        }}
      >
        Loading 3D Visualization
      </h3>
      
      <p 
        style={{
          color: "#6c757d",
          fontSize: "var(--font-size-sm)",
          lineHeight: "var(--line-height-normal)",
          margin: "0 0 16px 0",
          textAlign: "center",
        }}
      >
        Preparing environment and particles...
      </p>

      {/* Progress bar */}
      <div style={{
        width: "200px",
        height: "4px",
        backgroundColor: "#e9ecef",
        borderRadius: "2px",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${Math.max(progress, 20)}%`,
          height: "100%",
          backgroundColor: "#007bff",
          transition: "width 0.3s ease"
        }} />
      </div>
      
      <p style={{
        color: "#6c757d",
        fontSize: "var(--font-size-sm)",
        lineHeight: "var(--line-height-normal)",
        margin: "8px 0 0 0"
      }}>
        {Math.round(Math.max(progress, 20))}%
      </p>
      
      {/* Add CSS keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}