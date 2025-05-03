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
  const mountRef = useRef<HTMLDivElement>(null); // Container reference
  const modelRef = useRef<THREE.Object3D | null>(null); // Current loaded model reference
  const animateIdRef = useRef<number | null>(null); // RequestAnimationFrame ID for cleanup

  useEffect(() => {
    // Create scene and set background color
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Get container size
    const container = mountRef.current!;
    const { width, height } = container.getBoundingClientRect();

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 10;

    // Create renderer and append to container
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Add orbit controls for mouse interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add directional light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1).normalize();
    scene.add(light);

    // Animation loop
    const animate = () => {
      animateIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Load and parse the OBJ model from Blob
    const reader = new FileReader();
    reader.onload = () => {
      const objText = reader.result as string;
      const loader = new OBJLoader();
      const obj = loader.parse(objText);

      // Remove previous model if exists
      if (modelRef.current) {
        scene.remove(modelRef.current);
      }

      // Add new model to the scene
      scene.add(obj);
      modelRef.current = obj;
    };
    reader.readAsText(objBlob);

    // Cleanup on unmount or blob change
    return () => {
      if (animateIdRef.current) {
        cancelAnimationFrame(animateIdRef.current);
      }
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [objBlob]);

  // Viewer container
  return <div ref={mountRef} className="w-full h-full" />;
}
