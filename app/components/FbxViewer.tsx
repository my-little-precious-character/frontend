import React, { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useFBX } from "@react-three/drei";
import * as THREE from "three";

interface Keypoint3D {
  x: number;
  y: number;
  z: number;
  score?: number;
}

interface FbxViewerProps {
  fbxUrl: string;
  pose3d?: Keypoint3D[];
}

function Model({ url, pose3d }: { url: string; pose3d?: Keypoint3D[] }) {
  const fbx = useFBX(url);

  // 그림자 설정
  React.useEffect(() => {
    fbx.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [fbx]);

  // TODO: 팔 말고 다른 부분도 조정 가능하게 하도
  React.useEffect(() => {
    if (!pose3d) return;
    const bone = fbx.getObjectByName("LeftUpperArm");
    if (bone) {
      const angle = pose3d[11]?.y ?? 0;
      bone.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), angle);
    }
  }, [pose3d, fbx]);

  return <primitive object={fbx} position={[0, -70, 0]} />;
}

export default function FbxViewer({ fbxUrl, pose3d }: FbxViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ fov: 75, position: [100, 100, 200], near: 0.1, far: 1000 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          intensity={1.2}
          position={[50, 150, 100]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.1}
          shadow-camera-far={500}
          shadow-camera-left={-200}
          shadow-camera-right={200}
          shadow-camera-top={200}
          shadow-camera-bottom={-200}
        />
        <hemisphereLight
          skyColor={0xaaaaaa}
          groundColor={0x444444}
          intensity={0.6}
          position={[0, 200, 0]}
        />

        <OrbitControls enableDamping dampingFactor={0.05} />

        <Suspense fallback={null}>
          <Model url={fbxUrl} pose3d={pose3d} />
        </Suspense>
      </Canvas>
    </div>
  );
}
