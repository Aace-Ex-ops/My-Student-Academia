import React from "react";
import { cn } from "@/lib/utils";

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center border-0 p-[2px] font-bold text-sm text-[#222222] rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer",
        className
      )}
      {...props}
    >
      {/* Animated Rainbow Border Layer */}
      <span
        className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FF6D1F_0%,#FBC02D_25%,#FF6D1F_50%,#C62828_75%,#FF6D1F_100%)] opacity-80 group-hover:opacity-100 transition-opacity"
      />
      {/* Inner Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#FAF3E1] group-hover:bg-[#FFFFFF] text-[#222222] font-extrabold transition-colors duration-200">
        {children}
      </span>
    </button>
  );
}
