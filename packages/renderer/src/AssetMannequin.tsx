import { type ReactNode, useEffect, useMemo, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DoubleSide, Group, Mesh, MeshStandardMaterial, Object3D } from "three";
import type { MannequinBodyModel } from "@cw/measurement";
import { createMannequinAssetControls } from "./mannequinRigAdapter";

interface AssetMannequinProps {
  body: MannequinBodyModel;
  fallback: ReactNode;
}

export function AssetMannequin({ body, fallback }: AssetMannequinProps) {
  const controls = useMemo(() => createMannequinAssetControls(body), [body]);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#eee9dd",
        metalness: 0.01,
        roughness: 0.82,
        side: DoubleSide
      }),
    []
  );
  const [scene, setScene] = useState<Group | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const loader = new GLTFLoader();
    let isDisposed = false;

    setScene(null);
    setFailed(false);

    loader.load(
      controls.assetUrl,
      (gltf) => {
        if (isDisposed) {
          return;
        }

        prepareScene(gltf.scene, material);
        setScene(gltf.scene);
      },
      undefined,
      () => {
        if (!isDisposed) {
          setFailed(true);
        }
      }
    );

    return () => {
      isDisposed = true;
    };
  }, [controls.assetUrl, material]);

  useEffect(
    () => () => {
      material.dispose();
    },
    [material]
  );

  if (failed || !scene) {
    return <>{fallback}</>;
  }

  return (
    <group position={controls.position} scale={controls.scale}>
      <primitive object={scene} />
    </group>
  );
}

function prepareScene(scene: Group, material: MeshStandardMaterial) {
  scene.traverse((object) => {
    if (!isMesh(object)) {
      return;
    }

    object.material = material;
    object.frustumCulled = false;
  });
}

function isMesh(object: Object3D): object is Mesh {
  return (object as Mesh).isMesh === true;
}
