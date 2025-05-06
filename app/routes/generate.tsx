import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";
import { Link, useSearchParams } from "react-router";

const ObjViewer = lazy(() => import("~/components/ObjViewer"));

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "나의 작고 귀여운 캐릭터" },
  ];
}

export default function Generate() {
  const API_BASE = import.meta.env.VITE_DREAMGAUSSIAN_URL;

  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const prompt = searchParams.get("prompt");
  const hasStartedRef = useRef(false);

  const [objUrl, setObjUrl] = useState<string | null>(null);
  const [mtlUrl, setMtlUrl] = useState<string | null>(null);
  const [albedoUrl, setAlbedoUrl] = useState<string | null>(null);

  const [objBlob, setObjBlob] = useState<Blob | null>(null);
  const [mtlBlob, setMtlBlob] = useState<Blob | null>(null);
  const [albedoBlob, setAlbedoBlob] = useState<Blob | null>(null);

  const [objFilename, setObjFilename] = useState<String | null>(null);
  const [mtlFilename, setMtlFilename] = useState<String | null>(null);
  const [albedoFilename, setAlbedoFilename] = useState<String | null>(null);

  // Request generating 3D object
  useEffect(() => {
    // 한 번만 실행되도록
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    async function startTask() {
      if (prompt) {
        // Request with text

        const formData = new URLSearchParams();
        formData.append("prompt", prompt);

        const res = await fetch(`${API_BASE}/text-to-3d?mode=test`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });
        const data = await res.json();
        setTaskId(data.task_id);
      } else {
        // Request with image

        // Input image
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = async () => {
          if (!fileInput.files?.[0]) return;  // TODO: exception handling
          const formData = new FormData();
          formData.append("file", fileInput.files[0]);

          const res = await fetch(`${API_BASE}/image-to-3d?mode=test`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          setTaskId(data.task_id);
        };
        fileInput.click();
      }
    }

    startTask();
  }, []);

  // Connect websocket
  useEffect(() => {
    if (!taskId) return;

    const ws = new WebSocket(`${API_BASE.replace('http', 'ws')}/image-to-3d/ws`);
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

        const objEndpoint = `${API_BASE}/image-to-3d?task_id=${taskId}&type=obj`;
        const mtlEndpoint = `${API_BASE}/image-to-3d?task_id=${taskId}&type=mtl`;
        const albedoEndpoint = `${API_BASE}/image-to-3d?task_id=${taskId}&type=albedo`;

        setObjUrl(objEndpoint);
        setMtlUrl(mtlEndpoint);
        setAlbedoUrl(albedoEndpoint);

        setObjFilename(`${taskId}_mesh.obj`)
        setMtlFilename(`${taskId}_mesh.mtl`)
        setAlbedoFilename(`${taskId}_mesh_albedo.png`)

        // Download generated object
        Promise.all([
          fetch(objEndpoint).then(res => res.blob()),
          fetch(mtlEndpoint).then(res => res.blob()),
          fetch(albedoEndpoint).then(res => res.blob()),
        ])
          .then(([objB, mtlB, albB]) => {
            setObjBlob(objB);
            setMtlBlob(mtlB);
            setAlbedoBlob(albB);
          });
      }
    };
    ws.onerror = () => ws.close();
    return () => ws.close();
  }, [taskId]);

  return (
    <main className="flex h-screen bg-gray-100 text-gray-800 font-sans">
      {/* 왼쪽 패널 */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        {!objUrl || !mtlUrl || !albedoUrl ? (
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600" />
        ) : (
          <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600" />}>
            <ObjViewer objUrl={objUrl} mtlUrl={mtlUrl} albedoUrl={albedoUrl} />
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
              <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">
                2
              </div>
              <span className="mt-2 text-sm font-medium text-gray-500">뼈대 생성</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">
                3
              </div>
              <span className="mt-2 text-sm font-medium text-gray-500">미리보기</span>
            </div>
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="flex flex-1 flex-col justify-center items-center space-y-8">
          {!objUrl ? (
            <div className="w-full max-w-md text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">
                모델 생성 중...
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
              {/* TODO: 진행률이 나은지 남은시간이 나은지 비교해서 반영하기 */}
              {/* <p className="text-sm font-medium text-gray-700">
              남은 시간: {minutes}분 {seconds}초
            </p> */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">모델 생성 완료!</h2>
              <a
                href={objUrl}
                download="model.obj"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                .obj 파일 다운로드
              </a>

              <Link
                to="/rig"
                state={{ objBlob, mtlBlob, albedoBlob, objFilename, mtlFilename, albedoFilename }}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
              >
                뼈대 생성하러 가기 →
              </Link>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
