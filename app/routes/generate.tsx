import { useEffect, useState } from "react";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "나의 작고 귀여운 캐릭터" },
  ];
}

export default function Generate() {
  const [progress, setProgress] = useState(0);
  const totalSeconds = 10;

  // TODO: websocket 연결
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, (totalSeconds * 10));

    return () => clearInterval(interval);
  }, []);

  const secondsLeft = Math.round((1 - progress / 100) * totalSeconds);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <main className="flex h-screen bg-gray-100 text-gray-800 font-sans">
      {/* 왼쪽 패널 */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600" />
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
              남은 시간: {minutes}분 {seconds}초
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
