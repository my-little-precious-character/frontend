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
  const animateIdRef = useRef<number | null>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const container = mountRef.current!;
    const { width, height } = container.getBoundingClientRect();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1).normalize();
    scene.add(light);

    const animate = () => {
      animateIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

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
      if (animateIdRef.current) {
        cancelAnimationFrame(animateIdRef.current);
      }
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [objBlob]);

  return <div ref={mountRef} className="w-full h-full" />;
}
