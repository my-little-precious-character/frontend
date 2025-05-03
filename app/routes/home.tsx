import { useState } from "react";
import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "나의 작고 귀여운 캐릭터" },
  ];
}

export default function Home() {
  const [prompt, setPrompt] = useState("");

  const handleGenerateWithText = () => {
    // 생성 로직
    console.log("Generating with prompt:", prompt);
  };

  const handleGenerateWithImage = () => {
    // 생성 로직
    console.log("Generating with image");
  };

  return (
    <main className="flex h-screen bg-gray-100 text-gray-800 font-sans">
      {/* 왼쪽 패널 */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <img
          src="/sample.obj.preview.png"
          alt="Generated Character"
          className="h-96 object-contain rounded-xl"
        />
      </div>

      {/* 오른쪽 패널 */}
      <div className="w-1/2 bg-gray-50 flex flex-col justify-center items-center px-12 space-y-12">
        {/* 텍스트 기반 생성 */}
        <div className="w-full max-w-md space-y-4 text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            텍스트로 3D 모델 제작
          </h2>
          <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="체크무늬 셔츠를 입은 공대생"
              className="flex-1 px-4 py-2 text-sm focus:outline-none"
            />
            <Link
              to={`/generate?prompt=${encodeURIComponent(prompt)}`}
              className="bg-orange-600 px-5 text-white text-sm hover:bg-orange-700 transition flex items-center"
            >
              생성하기
            </Link>
          </div>
        </div>

        {/* 구분선 */}
        <div className="w-full max-w-md flex items-center gap-4 text-gray-400">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="text-sm whitespace-nowrap">or</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* 이미지 기반 생성 */}
        <div className="w-full max-w-md space-y-4 text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            이미지로 3D 모델 제작
          </h2>
          <Link
            to="/generate"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition font-medium block text-center"
          >
            이미지 업로드
          </Link>
        </div>
      </div>
    </main>
  );
}
