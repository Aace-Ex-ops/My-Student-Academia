"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroTextProps {
  text?: string;
  className?: string;
  fontSizeClass?: string;
  sliceColor?: string;
}

export default function HeroText({
  text = "My Student Academia",
  className = "",
  fontSizeClass = "text-3xl sm:text-5xl md:text-6xl lg:text-7xl",
  sliceColor = "text-[#FF6D1F]",
}: HeroTextProps) {
  const [count, setCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const words = text.split(" ");

  const handleMouseEnter = () => {
    if (!isHovered) {
      setIsHovered(true);
      setCount((c) => c + 1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full transition-colors duration-700 py-4 cursor-pointer select-none",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Text Container */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            className="flex flex-wrap justify-center items-center gap-x-[0.3em] gap-y-[0.1em] w-full"
          >
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-flex items-center whitespace-nowrap">
                {Array.from(word).map((char, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden group px-[1px]"
                  >
                    {/* Main Character */}
                    <motion.span
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ delay: (wordIndex * 5 + i) * 0.03 + 0.2, duration: 0.7 }}
                      className={cn(
                        "leading-none font-black text-[#222222] tracking-tighter inline-block",
                        fontSizeClass
                      )}
                    >
                      {char}
                    </motion.span>

                    {/* Top Slice Layer */}
                    <motion.span
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={{ x: "100%", opacity: [0, 1, 0] }}
                      transition={{
                        duration: 0.7,
                        delay: (wordIndex * 5 + i) * 0.03,
                        ease: "easeInOut",
                      }}
                      className={cn(
                        "absolute inset-0 leading-none font-black z-10 pointer-events-none tracking-tighter inline-block",
                        fontSizeClass,
                        sliceColor
                      )}
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% 35%, 0 35%)" }}
                    >
                      {char}
                    </motion.span>

                    {/* Middle Slice Layer */}
                    <motion.span
                      initial={{ x: "100%", opacity: 0 }}
                      animate={{ x: "-100%", opacity: [0, 1, 0] }}
                      transition={{
                        duration: 0.7,
                        delay: (wordIndex * 5 + i) * 0.03 + 0.1,
                        ease: "easeInOut",
                      }}
                      className={cn(
                        "absolute inset-0 leading-none font-black text-[#222222] z-10 pointer-events-none tracking-tighter inline-block",
                        fontSizeClass
                      )}
                      style={{
                        clipPath: "polygon(0 35%, 100% 35%, 100% 65%, 0 65%)",
                      }}
                    >
                      {char}
                    </motion.span>

                    {/* Bottom Slice Layer */}
                    <motion.span
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={{ x: "100%", opacity: [0, 1, 0] }}
                      transition={{
                        duration: 0.7,
                        delay: (wordIndex * 5 + i) * 0.03 + 0.2,
                        ease: "easeInOut",
                      }}
                      className={cn(
                        "absolute inset-0 leading-none font-black z-10 pointer-events-none tracking-tighter inline-block",
                        fontSizeClass,
                        sliceColor
                      )}
                      style={{
                        clipPath: "polygon(0 65%, 100% 65%, 100% 100%, 0 100%)",
                      }}
                    >
                      {char}
                    </motion.span>
                  </div>
                ))}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
