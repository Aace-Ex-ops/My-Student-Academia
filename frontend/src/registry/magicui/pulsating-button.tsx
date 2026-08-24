import React from "react";

interface PulsatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulseColor?: string;
  duration?: string;
  children: React.ReactNode;
}

export function PulsatingButton({
  className = "",
  pulseColor = "#FF6D1F",
  duration = "2s",
  children,
  ...props
}: PulsatingButtonProps) {
  return (
    <button
      className={`relative flex items-center justify-center px-8 py-3.5 text-center font-bold text-[#FAF3E1] bg-[#FF6D1F] hover:bg-[#e65c10] rounded-xl shadow-lg shadow-[#FF6D1F]/30 transition-all duration-300 transform active:scale-95 group overflow-hidden ${className}`}
      {...props}
    >
      <div className="relative z-10 flex items-center gap-2 font-semibold tracking-wide">
        {children}
      </div>
      <span
        className="absolute inset-0 rounded-xl animate-ping opacity-35 pointer-events-none"
        style={{
          backgroundColor: pulseColor,
          animationDuration: duration,
        }}
      />
      <span className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#FF6D1F] via-[#F5E7C6] to-[#FF6D1F] opacity-0 group-hover:opacity-50 blur transition-all duration-500 pointer-events-none" />
    </button>
  );
}
