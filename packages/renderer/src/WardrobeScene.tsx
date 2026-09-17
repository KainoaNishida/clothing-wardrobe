import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { GarmentShell } from "@cw/garments";
import type { MannequinParameters } from "@cw/measurement";

export type CameraPreset = "front" | "side" | "back" | "reset";

interface WardrobeSceneProps {
  cameraPreset: CameraPreset;
  garmentShells: GarmentShell[];
  mannequin: MannequinParameters;
}

export function WardrobeScene({ cameraPreset, garmentShells, mannequin }: WardrobeSceneProps) {
  return (
    <Canvas
      className="scene-canvas"
      camera={{ fov: 38, position: [0, 1.55, 4.2] }}
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
    >
      <color attach="background" args={["#020202"]} />
      <ambientLight intensity={0.65} />
      <directionalLight intensity={2.2} position={[2.5, 4, 3]} />
      <spotLight angle={0.4} intensity={1.4} penumbra={0.8} position={[-3, 3, 4]} />
      <Mannequin mannequin={mannequin} />
      <GarmentLayers shells={garmentShells} />
      <Grid
        args={[5, 5]}
        cellColor="#24211d"
        cellSize={0.5}
        fadeDistance={4.5}
        fadeStrength={1.6}
        position={[0, 0, 0]}
        sectionColor="#5e4931"
      />
      <CameraController preset={cameraPreset} />
    </Canvas>
  );
}

function CameraController({ preset }: { preset: CameraPreset }) {
  const { camera } = useThree();
  const controls = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    const nextPosition: Record<CameraPreset, [number, number, number]> = {
      front: [0, 1.55, 4.2],
      side: [4.2, 1.55, 0],
      back: [0, 1.55, -4.2],
      reset: [0, 1.55, 4.2]
    };

    camera.position.set(...nextPosition[preset]);
    controls.current?.target.set(0, 1.18, 0);
    controls.current?.update();
  }, [camera, preset]);

  return <OrbitControls ref={controls} enableDamping enablePan={false} maxDistance={6.5} minDistance={2.1} />;
}

function Mannequin({ mannequin }: { mannequin: MannequinParameters }) {
  const torsoHeight = Math.max(0.72, mannequin.torsoLengthMeters);
  const legHeight = Math.max(0.72, mannequin.legLengthMeters);
  const shoulderWidth = Math.max(0.34, mannequin.shoulderWidthMeters);
  const chestRadius = Math.max(0.16, mannequin.chestRadiusMeters * 0.92);
  const waistRadius = Math.max(0.13, mannequin.waistRadiusMeters * 0.9);
  const hipRadius = Math.max(0.16, mannequin.hipRadiusMeters * 0.92);

  return (
    <group position={[0, 0.03, 0]}>
      <mesh position={[0, legHeight + torsoHeight + 0.18, 0]}>
        <sphereGeometry args={[0.16, 32, 24]} />
        <meshStandardMaterial color="#d8d1c4" roughness={0.88} />
      </mesh>
      <mesh position={[0, legHeight + torsoHeight * 0.48, 0]}>
        <capsuleGeometry args={[chestRadius, torsoHeight * 0.72, 24, 32]} />
        <meshStandardMaterial color="#bdb4a6" roughness={0.9} />
      </mesh>
      <mesh position={[0, legHeight + 0.18, 0]} scale={[hipRadius / 0.18, 0.72, 0.9]}>
        <sphereGeometry args={[0.18, 32, 18]} />
        <meshStandardMaterial color="#bdb4a6" roughness={0.9} />
      </mesh>
      <mesh position={[0, legHeight + torsoHeight * 0.86, 0]} scale={[shoulderWidth, 0.035, 0.05]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d8d1c4" roughness={0.86} />
      </mesh>
      <Limb x={-shoulderWidth * 0.58} y={legHeight + torsoHeight * 0.52} length={0.62} />
      <Limb x={shoulderWidth * 0.58} y={legHeight + torsoHeight * 0.52} length={0.62} />
      <Leg x={-waistRadius * 0.55} height={legHeight} />
      <Leg x={waistRadius * 0.55} height={legHeight} />
    </group>
  );
}

function Limb({ length, x, y }: { length: number; x: number; y: number }) {
  return (
    <mesh position={[x, y, 0]} rotation={[0, 0, 0.12 * Math.sign(x)]}>
      <capsuleGeometry args={[0.045, length, 16, 24]} />
      <meshStandardMaterial color="#bdb4a6" roughness={0.9} />
    </mesh>
  );
}

function Leg({ height, x }: { height: number; x: number }) {
  return (
    <mesh position={[x, height * 0.48, 0]}>
      <capsuleGeometry args={[0.06, height * 0.86, 16, 24]} />
      <meshStandardMaterial color="#bdb4a6" roughness={0.9} />
    </mesh>
  );
}

function GarmentLayers({ shells }: { shells: GarmentShell[] }) {
  return (
    <group>
      {shells.map((shell) => {
        if (shell.category === "tops") {
          return <TorsoShell color={shell.color} key={shell.id} y={1.42} />;
        }
        if (shell.category === "outerwear") {
          return <OuterwearShell color={shell.color} key={shell.id} />;
        }
        if (shell.category === "pants") {
          return <PantsShell color={shell.color} key={shell.id} />;
        }
        if (shell.category === "shoes") {
          return <ShoesShell color={shell.color} key={shell.id} />;
        }
        return <AccessoryShell color={shell.color} key={shell.id} />;
      })}
    </group>
  );
}

function TorsoShell({ color, y }: { color: string; y: number }) {
  return (
    <mesh position={[0, y, 0]} scale={[0.46, 0.54, 0.2]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.82} />
    </mesh>
  );
}

function OuterwearShell({ color }: { color: string }) {
  return (
    <mesh position={[0, 1.45, -0.01]} scale={[0.54, 0.68, 0.24]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.78} transparent opacity={0.88} />
    </mesh>
  );
}

function PantsShell({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[-0.095, 0.62, 0]} scale={[0.14, 0.8, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.86} />
      </mesh>
      <mesh position={[0.095, 0.62, 0]} scale={[0.14, 0.8, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.86} />
      </mesh>
    </group>
  );
}

function ShoesShell({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[-0.11, 0.08, 0.04]} scale={[0.18, 0.055, 0.32]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh position={[0.11, 0.08, 0.04]} scale={[0.18, 0.055, 0.32]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
    </group>
  );
}

function AccessoryShell({ color }: { color: string }) {
  return (
    <mesh position={[0, 1.03, 0.015]} scale={[0.44, 0.035, 0.21]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.64} />
    </mesh>
  );
}
