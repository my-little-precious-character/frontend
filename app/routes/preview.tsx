import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";
import { useLocation } from "react-router";
import FbxViewer from "~/components/FbxViewer";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "나의 작고 귀여운 캐릭터" },
  ];
}

export default function Generate() {
  const location = useLocation();
  const fbxUrl = location.state?.fbxUrl;

  return (
    <main className="flex h-screen bg-gray-100 text-gray-800 font-sans">
      {/* 왼쪽 패널 */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        OpenPose {/* TODO: */}
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

        <div className="flex flex-1 flex-col justify-center items-center space-y-8">
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">캐릭터 생성 완료!</h2>
            <a
              href={fbxUrl}
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
