import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Preload, Center } from '@react-three/drei';
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// @ts-ignore
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { TextureLoader, MeshStandardMaterial } from 'three';

interface ObjViewerProps {
  objUrl: string;     // e.g. "http://localhost:8000/result/ID_mesh.obj"
  mtlUrl: string;     // e.g. "http://localhost:8000/result/ID_mesh.mtl"
  albedoUrl: string;  // e.g. "http://localhost:8000/result/ID_mesh_albedo.png"
}

function Model({ objUrl, mtlUrl, albedoUrl }: ObjViewerProps) {
  // Load materials if provided
  const materials = useLoader(MTLLoader, mtlUrl);
  materials.preload();

  // Load albedo texture if provided
  const albedoTexture = useLoader(TextureLoader, albedoUrl);

  // Load OBJ and attach materials
  const obj = useLoader(
    OBJLoader,
    objUrl,
    loader => {
      loader.setMaterials(materials);
    }
  );

  // Override mesh materials with albedo texture
  useEffect(() => {
    if (obj && albedoTexture) {
      obj.traverse(child => {
        if ((child as any).isMesh) {
          (child as any).material = new MeshStandardMaterial({
            map: albedoTexture,
            color: (child as any).material.color || undefined,
            metalness: (child as any).material.metalness || 0,
            roughness: (child as any).material.roughness || 1
          });
        }
      });
    }
  }, [obj, albedoTexture]);

  return <primitive object={obj} dispose={null} />;
}

export default function ObjViewer({ objUrl, mtlUrl, albedoUrl }: ObjViewerProps) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <Suspense fallback={null}>
        <Center>
          <Model objUrl={objUrl} mtlUrl={mtlUrl} albedoUrl={albedoUrl} />
        </Center>
        <Preload all />
      </Suspense>
      <OrbitControls makeDefault />
    </Canvas>
  );
}
