import { useEffect, useRef } from "react";
import * as THREE from "three";
// @ts-ignore
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface FbxViewerProps {
  fbxBlob: Blob;
}

export default function FbxViewer({ fbxBlob }: FbxViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const animateIdRef = useRef<number | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = mountRef.current!;
    const { width, height } = container.getBoundingClientRect();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(100, 100, 200);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Ambient light (soft, omnidirectional)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Directional light (strong shadows, main light source)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(50, 150, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Hemisphere light (more natural outdoor feel)
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 0.6);
    hemisphereLight.position.set(0, 200, 0);
    scene.add(hemisphereLight);

    // Soft shadow settings
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;

    const animate = () => {
      animateIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const loader = new FBXLoader();
    const url = URL.createObjectURL(fbxBlob);
    loader.load(url, (fbx) => {
      if (modelRef.current) scene.remove(modelRef.current);
      fbx.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(fbx);
      modelRef.current = fbx;
    });

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !mountRef.current) return;
      const { width, height } = mountRef.current.getBoundingClientRect();
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animateIdRef.current) cancelAnimationFrame(animateIdRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
      URL.revokeObjectURL(url);
    };
  }, [fbxBlob]);

  return <div ref={mountRef} className="w-full h-full" />;
}
