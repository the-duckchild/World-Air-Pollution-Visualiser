import { PerspectiveCamera, OrbitControls, Edges } from "@react-three/drei";


export const AqiVisualiser = () => {

    const aspect = 800 / 600;

  return (
    <>
      <ambientLight color={0xffffff} intensity={1} />
      {/* <directionalLight color="white" intensity={0.7} position={[0, 3, 5]} /> */}
      <OrbitControls />
      <PerspectiveCamera makeDefault fov={45} aspect={aspect} near={1} far={1000} position={[0, 0, 50]} />
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
        <mesh></mesh>
      </mesh>
    </>
  );
};

