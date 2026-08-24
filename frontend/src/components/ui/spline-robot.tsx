import React, { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineRobotProps {
  scene?: string;
  className?: string;
}

export function SplineRobot({
  scene = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode",
  className = "w-full h-full",
}: SplineRobotProps) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <Suspense
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#FAF3E1]/60">
            <div className="w-10 h-10 rounded-full border-2 border-[#FF6D1F] border-t-transparent animate-spin" />
            <span className="text-xs font-mono tracking-widest text-[#FF6D1F] uppercase">
              INITIALIZING 3D ROBOT // SPLINE...
            </span>
          </div>
        }
      >
        <Spline
          scene={scene}
          className="w-full h-full flex items-center justify-center"
        />
      </Suspense>
    </div>
  );
}
