import { useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-ignore
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

interface ObjViewerProps {
  objBlob: Blob;
}

export default function ObjViewer({ objBlob }: ObjViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const animateIdRef = useRef<number | null>(null); // ✅ 애니메이션 추적

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(500, 500);
    mountRef.current!.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1).normalize();
    scene.add(light);

    // ✅ 단일 애니메이션 루프 정의
    const animate = () => {
      animateIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate(); // 최초 실행

    const reader = new FileReader();
    reader.onload = () => {
      const objText = reader.result as string;
      const loader = new OBJLoader();
      const obj = loader.parse(objText);

      if (modelRef.current) {
        scene.remove(modelRef.current);
      }

      scene.add(obj);
      modelRef.current = obj;
    };
    reader.readAsText(objBlob);

    return () => {
      // ✅ 렌더 루프 중지
      if (animateIdRef.current) {
        cancelAnimationFrame(animateIdRef.current);
      }
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [objBlob]);

  return <div ref={mountRef} />;
}
