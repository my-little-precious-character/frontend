import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";
import { Link, useLocation } from "react-router";

const FbxViewer = lazy(() => import("~/components/FbxViewer"));

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "나의 작고 귀여운 캐릭터" },
  ];
}

export default function Generate() {
  const API_BASE = import.meta.env.VITE_RIGNET_URL;
  const RIGNET_MODE = import.meta.env.VITE_RIGNET_MODE;

  const location = useLocation();
  const objBlob = location.state?.objBlob;
  const mtlBlob = location.state?.mtlBlob;
  const albedoBlob = location.state?.albedoBlob;
  const prevTaskId = location.state?.taskId;

  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const hasStartedRef = useRef(false);
  const [fbxUrl, setFbxUrl] = useState<string | null>(null);

  // Request rigging
  useEffect(() => {
    // 한 번만 실행되도록
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    async function startTask() {
      if (objBlob) {
        const formData = new FormData();
        formData.append("obj", objBlob);
        formData.append("mtl", mtlBlob);
        formData.append("albedo", albedoBlob);
        formData.append("prev_task_id", prevTaskId);

        const res = await fetch(`${API_BASE}/rigging?mode=${RIGNET_MODE}`, {
          method: "POST",
          body: formData,
        });

        if(!res.ok) {
          const error = await res.json();
          console.error("뼈대 생성 요청 실패:", error);
          setProgress(0);
          setTaskId(null);
          return;
        }

        const data = await res.json();
        setTaskId(data.task_id);
      } else {
        alert("3D 모델이 없습니다. 먼저 모델을 생성해주세요.");
      }
    }

    startTask();
  }, []);

  // Connect websocket
  useEffect(() => {
    if (!taskId) return;

    const ws = new WebSocket(`${API_BASE.replace('http', 'ws')}/rigging/ws`);
    ws.onopen = () => {
      ws.send(taskId);
    };
    ws.onmessage = (event) => {
      const status = event.data;
      const match = /processing.*?(\d+)%/.exec(status);
      if (match) {
        setProgress(parseInt(match[1], 10));
      } else if (status.includes("done")) {
        setProgress(100);
        ws.close();

        // Download and save rigged object
        setFbxUrl(`${API_BASE}/rigging?task_id=${taskId}`);
      }
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [taskId]);

  return (
    <main className="flex h-screen bg-gray-100 text-gray-800 font-sans">
      {/* 왼쪽 패널 */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        {!fbxUrl ? (
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600" />
        ) : (
          <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600" />}>
            <FbxViewer fbxUrl={fbxUrl} />
          </Suspense>
        )}
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
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="flex flex-1 flex-col justify-center items-center space-y-8">
          {!fbxUrl ? (
            <div className="w-full max-w-md text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">
                뼈대 생성 중...
              </h2>

              <div className="w-full bg-white h-4 rounded-full overflow-hidden border border-gray-300">
                <div
                  className="h-full bg-orange-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-sm font-medium text-gray-700">
                진행률: {progress}%
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">뼈대 생성 완료!</h2>
              <a
                href={`${API_BASE}/rigging?task_id=${taskId}`}
                download="model.fbx"
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
              >
                .fbx 파일 다운로드
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
