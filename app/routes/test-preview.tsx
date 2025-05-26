import { useEffect, useState } from "react";
import FbxViewer from "../components/FbxViewer";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "나의 작고 귀여운 캐릭터" },
  ];
}

interface Keypoint3D {
  x: number;
  y: number;
  z: number;
  score?: number;
}

function makePose3d(t: number): Keypoint3D[] {
  const pose = Array.from({ length: 33 });
  pose[11] = { x: 0, y: Math.sin(t), z: 0, score: 1 }; // LeftUpperArm의 y를 "회전 각도(라디안)"로 사용
  // 필요하다면 나머지 키포인트도 추가 정의
  return pose;
}

export default function Generate() {
  const [pose3d, setPose3d] = useState<Keypoint3D[]>();

  useEffect(() => {
    let t = 0;
    let frameId: number;
    function animate() {
      t += 0.05;
      setPose3d(makePose3d(t));
      frameId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <main className="flex h-screen bg-gray-100 text-gray-800 font-sans">
      {/* 왼쪽 패널 */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <FbxViewer fbxUrl="/5fec2ff338fe467cb36cd7256fe7321f.fbx" pose3d={pose3d} />
      </div>

      {/* 오른쪽 패널 */}
      <div className="w-1/2 bg-gray-50 flex flex-col px-12 py-12">
        {/* 현재 단계 표시 */}
        <div className="w-full max-w-md mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <span className="mt-2 text-sm font-medium text-gray-800">모델 생성</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <span className="mt-2 text-sm font-medium text-gray-500">뼈대 생성</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <span className="mt-2 text-sm font-medium text-gray-500">미리보기</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center items-center space-y-8">
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">캐릭터 생성 완료!</h2>
            <a
              download="model.fbx"
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              .fbx 파일 다운로드
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
