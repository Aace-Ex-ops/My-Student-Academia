import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DoodleProps {
  initialX: number;
  initialY: number;
  rotation?: number;
  scale?: number;
  label: string;
  badgeText?: string;
  children: React.ReactNode;
}

function FloatingDoodleItem({
  initialX,
  initialY,
  rotation = 0,
  scale = 1,
  label,
  badgeText,
  children,
}: DoodleProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 1000);
    setTimeout(() => setIsClicked(false), 400);
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
      whileDrag={{ scale: 1.3, zIndex: 50, cursor: "grabbing" }}
      whileHover={{ scale: 1.25, rotate: rotation + 8, zIndex: 40 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: [0, -12, 0],
        rotate: [rotation - 3, rotation + 3, rotation - 3],
      }}
      transition={{
        y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 0.8 },
      }}
      onClick={handleClick}
      style={{ left: `${initialX}%`, top: `${initialY}%` }}
      className="absolute cursor-grab select-none z-20 group hidden md:block"
    >
      {/* Interactive Tooltip on Hover */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#222222] text-[#FAF3E1] text-[10px] font-black px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
        {label}
      </div>

      {/* Sparkle Burst effect on click */}
      <AnimatePresence>
        {showSparkle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1.5, y: -20 }}
            exit={{ opacity: 0 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg pointer-events-none z-30"
          >
            ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doodle SVG Container */}
      <div
        className={`p-3.5 rounded-2xl bg-[#FFFFFF]/90 backdrop-blur-md border border-[#F5E7C6] shadow-lg shadow-[#222222]/5 group-hover:border-[#FF6D1F] transition-colors relative ${
          isClicked ? "animate-ping" : ""
        }`}
      >
        {badgeText && (
          <span className="absolute -top-2 -right-2 bg-[#FF6D1F] text-[#FAF3E1] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
            {badgeText}
          </span>
        )}
        <div style={{ transform: `scale(${scale})` }}>{children}</div>
      </div>
    </motion.div>
  );
}

export function InteractiveDoodles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden max-w-7xl mx-auto">
      {/* Enable pointer events only for the draggable doodles */}
      <div className="relative w-full h-full pointer-events-auto">
        
        {/* 1. Astronaut Floating Doodle (Top Left) */}
        <FloatingDoodleItem initialX={4} initialY={14} rotation={-8} label="Drag me! 👨‍🚀 Astronaut" badgeText="Float">
          <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="24" r="14" stroke="#222222" strokeWidth="3" fill="#FAF3E1" />
            <path d="M22 24C22 18.5 26.5 14 32 14C37.5 14 42 18.5 42 24" stroke="#FF6D1F" strokeWidth="3" strokeLinecap="round" />
            <rect x="20" y="38" width="24" height="20" rx="6" stroke="#222222" strokeWidth="3" fill="#FFFFFF" />
            <circle cx="32" cy="48" r="4" fill="#FF6D1F" />
            <path d="M14 42L20 40M50 42L44 40" stroke="#222222" strokeWidth="3" strokeLinecap="round" />
            <path d="M12 14L16 18M52 14L48 18" stroke="#FF6D1F" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </FloatingDoodleItem>

        {/* 2. Graduation Mortarboard Cap Doodle (Top Right) */}
        <FloatingDoodleItem initialX={88} initialY={16} rotation={12} label="Graduation Ready! 🎓" badgeText="2026">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 12L58 24L32 36L6 24L32 12Z" stroke="#222222" strokeWidth="3.5" fill="#FAF3E1" strokeLinejoin="round" />
            <path d="M16 29V44C16 44 23 48 32 48C41 48 48 44 48 44V29" stroke="#222222" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M50 25.5V42" stroke="#FF6D1F" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="50" cy="44" r="3" fill="#FF6D1F" />
          </svg>
        </FloatingDoodleItem>

        {/* 3. Space Rocket Launch Doodle (Mid Left) */}
        <FloatingDoodleItem initialX={6} initialY={52} rotation={-15} label="Launch Career! 🚀" badgeText="Boost">
          <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8C32 8 46 18 46 36L32 46L18 36C18 18 32 8 32 8Z" stroke="#222222" strokeWidth="3.5" fill="#FFFFFF" strokeLinejoin="round" />
            <circle cx="32" cy="26" r="5" stroke="#FF6D1F" strokeWidth="3" fill="#FAF3E1" />
            <path d="M18 36L10 44L18 46M46 36L54 44L46 46" stroke="#222222" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M26 46L32 58L38 46" stroke="#FF6D1F" strokeWidth="3.5" strokeLinecap="round" fill="#FF6D1F" />
          </svg>
        </FloatingDoodleItem>

        {/* 4. Idea Spark Lightbulb Doodle (Mid Right) */}
        <FloatingDoodleItem initialX={89} initialY={50} rotation={10} label="Creative Ideas! 💡" badgeText="Idea">
          <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 10C21 10 16 18 16 28C16 34 20 39 22 43H42C44 39 48 34 48 28C48 18 43 10 32 10Z" stroke="#222222" strokeWidth="3.5" fill="#FAF3E1" strokeLinejoin="round" />
            <path d="M24 49H40M27 55H37" stroke="#222222" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M32 2V6M10 20L14 22M54 20L50 22M12 38L16 36M52 38L48 36" stroke="#FF6D1F" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </FloatingDoodleItem>

        {/* 5. Textbooks Stack Doodle (Bottom Left) */}
        <FloatingDoodleItem initialX={10} initialY={78} rotation={6} label="Knowledge Hub 📚">
          <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="14" width="44" height="12" rx="3" stroke="#222222" strokeWidth="3" fill="#FF6D1F" />
            <rect x="10" y="28" width="44" height="12" rx="3" stroke="#222222" strokeWidth="3" fill="#FAF3E1" />
            <rect x="10" y="42" width="44" height="12" rx="3" stroke="#222222" strokeWidth="3" fill="#FFFFFF" />
            <path d="M18 14V26M18 28V40M18 42V54" stroke="#222222" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </FloatingDoodleItem>

        {/* 6. Gold Trophy & Achievement Doodle (Bottom Right) */}
        <FloatingDoodleItem initialX={85} initialY={76} rotation={-10} label="Academic Excellence 🏆" badgeText="Top">
          <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 12H46V28C46 35.7 39.7 42 32 42C24.3 42 18 35.7 18 28V12Z" stroke="#222222" strokeWidth="3.5" fill="#FAF3E1" />
            <path d="M18 18H10C7.8 18 6 19.8 6 22V26C6 30.4 9.6 34 14 34H18M46 18H54C56.2 18 58 19.8 58 22V26C58 30.4 54.4 34 50 34H46" stroke="#222222" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 42V50M22 56H42" stroke="#222222" strokeWidth="3.5" strokeLinecap="round" />
            <polygon points="32,20 34,24 38,25 35,28 36,32 32,30 28,32 29,28 26,25 30,24" fill="#FF6D1F" stroke="#FF6D1F" strokeWidth="1" />
          </svg>
        </FloatingDoodleItem>

        {/* 7. Saturn Orbit Doodle (Center Top Left) */}
        <FloatingDoodleItem initialX={26} initialY={8} rotation={15} label="Cosmic Galaxy 🪐">
          <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="16" stroke="#222222" strokeWidth="3.5" fill="#FF6D1F" />
            <ellipse cx="32" cy="32" rx="28" ry="8" stroke="#222222" strokeWidth="3" fill="none" transform="rotate(-20 32 32)" />
            <circle cx="48" cy="18" r="2" fill="#FF6D1F" />
            <circle cx="16" cy="46" r="3" fill="#222222" />
          </svg>
        </FloatingDoodleItem>

        {/* 8. Timetable Clock Doodle (Center Top Right) */}
        <FloatingDoodleItem initialX={72} initialY={10} rotation={-6} label="Schedule Planner ⏱️">
          <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="34" r="20" stroke="#222222" strokeWidth="3.5" fill="#FFFFFF" />
            <path d="M32 22V34L40 40" stroke="#FF6D1F" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M26 8L38 8M32 8V14" stroke="#222222" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </FloatingDoodleItem>

      </div>
    </div>
  );
}
