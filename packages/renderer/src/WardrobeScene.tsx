import { useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { DoubleSide, MeshStandardMaterial, Quaternion, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { GarmentShell } from "@cw/garments";
import type {
  MannequinBodyModel,
  MannequinLinearGuide,
  MannequinPoint,
  MannequinRingGuide
} from "@cw/measurement";
import { AssetMannequin } from "./AssetMannequin";
import { buildMannequinSurfaceGeometry } from "./mannequinSurface";

export type CameraPreset = "front" | "side" | "back" | "reset";
export type WardrobeSceneMode = "outfit" | "bodyProfile";

interface WardrobeSceneProps {
  body: MannequinBodyModel;
  cameraPreset: CameraPreset;
  garmentShells: GarmentShell[];
  visualMode?: WardrobeSceneMode;
}

export function WardrobeScene({ body, cameraPreset, garmentShells, visualMode = "outfit" }: WardrobeSceneProps) {
  const cameraDistance = getCameraDistance(body);

  return (
    <Canvas
      className="scene-canvas"
      camera={{ fov: 38, position: [0, body.heightMeters * 0.72, cameraDistance] }}
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
    >
      <color attach="background" args={["#020202"]} />
      <ambientLight intensity={0.68} />
      <directionalLight intensity={2.15} position={[2.5, 4, 3]} />
      <spotLight angle={0.4} intensity={1.35} penumbra={0.8} position={[-3, 3, 4]} />
      <AssetMannequin body={body} fallback={<ProceduralMannequin body={body} />} />
      {visualMode === "bodyProfile" ? <MeasurementGuides body={body} /> : null}
      {visualMode === "outfit" ? <GarmentLayers body={body} shells={garmentShells} /> : null}
      <Grid
        args={[5, 5]}
        cellColor="#24211d"
        cellSize={0.5}
        fadeDistance={4.5}
        fadeStrength={1.6}
        position={[0, 0, 0]}
        sectionColor="#5e4931"
      />
      <CameraController body={body} preset={cameraPreset} />
    </Canvas>
  );
}

function CameraController({ body, preset }: { body: MannequinBodyModel; preset: CameraPreset }) {
  const { camera } = useThree();
  const controls = useRef<OrbitControlsImpl | null>(null);
  const distance = getCameraDistance(body);
  const targetY = body.heightMeters * 0.54;
  const cameraY = body.heightMeters * 0.66;

  useEffect(() => {
    const nextPosition: Record<CameraPreset, [number, number, number]> = {
      front: [0, cameraY, distance],
      side: [distance, cameraY, 0],
      back: [0, cameraY, -distance],
      reset: [0, cameraY, distance]
    };

    camera.position.set(...nextPosition[preset]);
    controls.current?.target.set(0, targetY, 0);
    controls.current?.update();
  }, [camera, cameraY, distance, preset, targetY]);

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      enablePan={false}
      maxDistance={distance * 1.6}
      minDistance={Math.max(1.1, body.heightMeters * 0.74)}
    />
  );
}

function ProceduralMannequin({ body }: { body: MannequinBodyModel }) {
  const surface = useMemo(() => buildMannequinSurfaceGeometry(body), [body]);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#eeece3",
        metalness: 0.02,
        roughness: 0.78,
        side: DoubleSide
      }),
    []
  );

  useEffect(
    () => () => {
      Object.values(surface).forEach((geometry) => geometry.dispose());
    },
    [surface]
  );

  useEffect(
    () => () => {
      material.dispose();
    },
    [material]
  );

  return (
    <group position={[0, 0.02, 0]}>
      {Object.entries(surface).map(([key, geometry]) => (
        <mesh geometry={geometry} key={key} material={material} />
      ))}
    </group>
  );
}

function SegmentCapsule({
  color,
  end,
  material = "standard",
  opacity = 1,
  radius,
  start
}: {
  color: string;
  end: MannequinPoint;
  material?: "standard" | "basic";
  opacity?: number;
  radius: number;
  start: MannequinPoint;
}) {
  const segment = useMemo(() => {
    const startVector = toVector(start);
    const endVector = toVector(end);
    const direction = endVector.clone().sub(startVector);
    const length = Math.max(direction.length(), 0.001);
    const midpoint = startVector.clone().add(endVector).multiplyScalar(0.5);
    const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize());

    return { length, midpoint, quaternion };
  }, [end.x, end.y, end.z, start.x, start.y, start.z]);

  return (
    <mesh position={segment.midpoint} quaternion={segment.quaternion}>
      <capsuleGeometry args={[radius, Math.max(0.001, segment.length - radius * 2), 18, 24]} />
      {material === "basic" ? (
        <meshBasicMaterial color={color} opacity={opacity} transparent={opacity < 1} />
      ) : (
        <meshStandardMaterial color={color} opacity={opacity} roughness={0.9} transparent={opacity < 1} />
      )}
    </mesh>
  );
}

function Foot({ center, dimensions }: { center: MannequinPoint; dimensions: MannequinBodyModel["dimensions"] }) {
  return (
    <mesh position={toArray(center)} scale={[dimensions.footWidth, dimensions.footHeight, dimensions.footLength * 0.5]}>
      <sphereGeometry args={[1, 24, 14]} />
      <meshStandardMaterial color="#d8d1c4" roughness={0.86} />
    </mesh>
  );
}

function MeasurementGuides({ body }: { body: MannequinBodyModel }) {
  const { guides } = body;

  return (
    <group position={[0, 0.025, 0]}>
      <GuideSegment guide={guides.height} />
      <GuideSegment guide={guides.inseam} />
      <GuideSegment guide={guides.shoulders} zOffset={0.035} />
      <GuideSegment guide={guides.arm} zOffset={0.035} />
      <GuideSegment guide={guides.foot} zOffset={0.035} />
      <GuideRing guide={guides.chest} />
      <GuideRing guide={guides.waist} />
      <GuideRing guide={guides.hips} />
    </group>
  );
}

function GuideSegment({ guide, zOffset = 0 }: { guide: MannequinLinearGuide; zOffset?: number }) {
  return (
    <SegmentCapsule
      color="#f0b66d"
      end={offsetGuidePoint(guide.end, zOffset)}
      material="basic"
      opacity={0.68}
      radius={0.006}
      start={offsetGuidePoint(guide.start, zOffset)}
    />
  );
}

function GuideRing({ guide }: { guide: MannequinRingGuide }) {
  return (
    <mesh
      position={toArray(guide.center)}
      rotation={[Math.PI / 2, 0, 0]}
      scale={[guide.radiusX * 1.05, guide.radiusZ * 1.05, 1]}
    >
      <torusGeometry args={[1, 0.018, 12, 96]} />
      <meshBasicMaterial color="#f0b66d" opacity={0.52} transparent />
    </mesh>
  );
}

function GarmentLayers({ body, shells }: { body: MannequinBodyModel; shells: GarmentShell[] }) {
  return (
    <group>
      {shells.map((shell) => {
        if (shell.category === "tops") {
          return <TorsoShell body={body} color={shell.color} key={shell.id} />;
        }
        if (shell.category === "outerwear") {
          return <OuterwearShell body={body} color={shell.color} key={shell.id} />;
        }
        if (shell.category === "pants") {
          return <PantsShell body={body} color={shell.color} key={shell.id} />;
        }
        if (shell.category === "shoes") {
          return <ShoesShell body={body} color={shell.color} key={shell.id} />;
        }
        return <AccessoryShell body={body} color={shell.color} key={shell.id} />;
      })}
    </group>
  );
}

function TorsoShell({ body, color }: { body: MannequinBodyModel; color: string }) {
  const { dimensions, landmarks } = body;
  const y = lerp(landmarks.waist.y, landmarks.chest.y, 0.55);

  return (
    <mesh
      position={[0, y, 0.012]}
      scale={[dimensions.chestRadiusX * 2.38, dimensions.torsoLength * 0.46, dimensions.chestRadiusZ * 2.16]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.82} />
    </mesh>
  );
}

function OuterwearShell({ body, color }: { body: MannequinBodyModel; color: string }) {
  const { dimensions, landmarks } = body;
  const y = lerp(landmarks.pelvis.y, landmarks.chest.y, 0.58);

  return (
    <mesh
      position={[0, y, 0]}
      scale={[dimensions.shoulderWidth * 1.08, dimensions.torsoLength * 0.62, dimensions.chestRadiusZ * 2.42]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} opacity={0.88} roughness={0.78} transparent />
    </mesh>
  );
}

function PantsShell({ body, color }: { body: MannequinBodyModel; color: string }) {
  const { dimensions, landmarks } = body;
  const y = (landmarks.crotch.y + landmarks.leftAnkle.y) * 0.5;
  const height = (landmarks.crotch.y - landmarks.leftAnkle.y) * 0.88;
  const legWidth = dimensions.thighRadius * 2.2;
  const depth = dimensions.hipRadiusZ * 1.5;

  return (
    <group>
      <mesh position={[landmarks.leftAnkle.x, y, 0.01]} scale={[legWidth, height, depth]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.86} />
      </mesh>
      <mesh position={[landmarks.rightAnkle.x, y, 0.01]} scale={[legWidth, height, depth]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.86} />
      </mesh>
    </group>
  );
}

function ShoesShell({ body, color }: { body: MannequinBodyModel; color: string }) {
  const { dimensions, landmarks } = body;

  return (
    <group>
      <mesh position={toArray(landmarks.leftFootCenter)} scale={[dimensions.footWidth * 1.25, 0.055, dimensions.footLength * 0.54]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh position={toArray(landmarks.rightFootCenter)} scale={[dimensions.footWidth * 1.25, 0.055, dimensions.footLength * 0.54]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
    </group>
  );
}

function AccessoryShell({ body, color }: { body: MannequinBodyModel; color: string }) {
  const { dimensions, landmarks } = body;

  return (
    <mesh
      position={[0, landmarks.waist.y, dimensions.waistRadiusZ + 0.02]}
      scale={[dimensions.waistRadiusX * 2.18, 0.035, dimensions.waistRadiusZ * 0.34]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.64} />
    </mesh>
  );
}

function getCameraDistance(body: MannequinBodyModel) {
  return Math.max(3.2, body.heightMeters * 2.35);
}

function toArray(point: MannequinPoint): [number, number, number] {
  return [point.x, point.y, point.z];
}

function toVector(point: MannequinPoint) {
  return new Vector3(point.x, point.y, point.z);
}

function offsetGuidePoint(point: MannequinPoint, zOffset: number): MannequinPoint {
  return {
    ...point,
    z: point.z + zOffset
  };
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}
