import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useFBX } from "@react-three/drei";
import * as THREE from "three";

interface FbxViewerProps {
  fbxUrl: string;
}

function Model({ url }: { url: string }) {
  // Drei의 useFBX 훅으로 FBX 로드
  const fbx = useFBX(url);

  // traverse로 그림자 설정
  fbx.traverse((child: THREE.Object3D) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  return <primitive object={fbx} />;
}

export default function FbxViewer({ fbxUrl }: FbxViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ fov: 75, position: [100, 100, 200], near: 0.1, far: 1000 }}
      >
        {/* 부드러운 앰비언트 라이트 */}
        <ambientLight intensity={0.5} />
        {/* 주광원: 방향성 라이트 */}
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
        {/* 헤미스피어 라이트로 자연스러운 하늘/지면 반사 */}
        <hemisphereLight
          skyColor={0xaaaaaa}
          groundColor={0x444444}
          intensity={0.6}
          position={[0, 200, 0]}
        />

        {/* OrbitControls (드래그로 회전/줌/팬) */}
        <OrbitControls enableDamping dampingFactor={0.05} />

        {/* Model 로딩은 Suspense로 감싸기 */}
        <Suspense fallback={null}>
          <Model url={fbxUrl} />
        </Suspense>
      </Canvas>
    </div>
  );
}
