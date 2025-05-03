import { useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-ignore
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface ObjViewerProps {
  objBlob: Blob;
}

export default function ObjViewer({ objBlob }: ObjViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const animateIdRef = useRef<number | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = mountRef.current!;
    const { width, height } = container.getBoundingClientRect();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 10;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1).normalize();
    scene.add(light);

    const animate = () => {
      animateIdRef.current = requestAnimationFrame(animate);
      controls.update();
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

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !mountRef.current) return;
      const { width, height } = mountRef.current.getBoundingClientRect();
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animateIdRef.current) {
        cancelAnimationFrame(animateIdRef.current);
      }
      renderer.dispose();
      container.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, [objBlob]);

  return <div ref={mountRef} className="w-full h-full" />;
}
