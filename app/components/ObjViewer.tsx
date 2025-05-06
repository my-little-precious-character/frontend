import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Preload } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

interface ObjViewerProps {
  objUrl: string;     // e.g. "http://localhost:8000/result/ID_mesh.obj"
  mtlUrl: string;     // e.g. "http://localhost:8000/result/ID_mesh.mtl"
  albedoUrl: string;  // e.g. "http://localhost:8000/result/ID_mesh_albedo.png"
}

function Model({ objUrl }) {
  const obj = useLoader(OBJLoader, objUrl)
  return <primitive object={obj} dispose={null} />
}

export default function ObjViewer({ objUrl, mtlUrl, albedoUrl }: ObjViewerProps) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <Suspense fallback={null}>
        <Model objUrl={objUrl} />
        <Preload all />
      </Suspense>
      <OrbitControls />
    </Canvas>
  )
}
