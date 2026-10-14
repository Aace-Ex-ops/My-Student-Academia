import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AsciiTextAnimationProps {
  text: "WELCOME BACK" | "WELCOME NEW USER" | "WELCOME FACULTY" | "WELCOME ADMIN";
  className?: string;
}

const WELCOME_BACK_ASCII = [
  " __          __  _                               ____             _    ",
  " \\ \\        / / | |                             |  _ \\           | |   ",
  "  \\ \\  /\\  / /__| | ___ ___  _ __ ___   ___     | |_) | __ _  ___| | __",
  "   \\ \\/  \\/ / _ \\ |/ __/ _ \\| '_ ` _ \\ / _ \\    |  _ < / _` |/ __| |/ /",
  "    \\  /\\  /  __/ | (_| (_) | | | | | |  __/    | |_) | (_| | (__|   < ",
  "     \\/  \\/ \\___|_|\\___\\___/|_| |_| |_|\\___|    |____/ \\__,_|\\___|_|\\_\\",
];

const WELCOME_NEW_USER_ASCII = [
  " __          __  _                                _   _                 _    _               ",
  " \\ \\        / / | |                              | \\ | |               | |  | |              ",
  "  \\ \\  /\\  / /__| | ___ ___  _ __ ___   ___      |  \\| | _____      __ | |  | |___  ___ _ __ ",
  "   \\ \\/  \\/ / _ \\ |/ __/ _ \\| '_ ` _ \\ / _ \\     | . ` |/ _ \\ \\ /\\ / / | |  | / __|/ _ \\ '__|",
  "    \\  /\\  /  __/ | (_| (_) | | | | | |  __/     | |\\  |  __/\\ V  V /  | |__| \\__ \\  __/ |   ",
  "     \\/  \\/ \\___|_|\\___\\___/|_| |_| |_|\\___|     |_| \\_|\\___| \\_/\\_/    \\____/|___/\\___|_|   ",
];

const WELCOME_FACULTY_ASCII = [
  " __          __  _                               ______               _ _         ",
  " \\ \\        / / | |                             |  ____|             | | |        ",
  "  \\ \\  /\\  / /__| | ___ ___  _ __ ___   ___     | |__ __ _  ___ _   _| | |_ _   _ ",
  "   \\ \\/  \\/ / _ \\ |/ __/ _ \\| '_ ` _ \\ / _ \\    |  __/ _` |/ __| | | | | __| | | |",
  "    \\  /\\  /  __/ | (_| (_) | | | | | |  __/    | | | (_| | (__| |_| | | |_| |_| |",
  "     \\/  \\/ \\___|_|\\___\\___/|_| |_| |_|\\___|    |_|  \\__,_|\\___|\\__,_|_|\\__|\\__, |",
];

const WELCOME_ADMIN_ASCII = [
  " __          __  _                                    _       _           _       ",
  " \\ \\        / / | |                             /\\   | |     | |         (_)      ",
  "  \\ \\  /\\  / /__| | ___ ___  _ __ ___   ___    /  \\  | |   __| |_ __ ___  _ _ __  ",
  "   \\ \\/  \\/ / _ \\ |/ __/ _ \\| '_ ` _ \\ / _ \\  / /\\ \\ | |  / _` | '_ ` _ \\| | '_ \\ ",
  "    \\  /\\  /  __/ | (_| (_) | | | | | |  __/ / ____ \\| | | (_| | | | | | | | | | |",
  "     \\/  \\/ \\___|_|\\___\\___/|_| |_| |_|\\___|/_/    \\_\\_|  \\__,_|_| |_| |_|_|_| |_|",
];

export function AsciiTextAnimation({ text, className = "" }: AsciiTextAnimationProps) {
  let lines = WELCOME_BACK_ASCII;
  if (text === "WELCOME NEW USER") lines = WELCOME_NEW_USER_ASCII;
  else if (text === "WELCOME FACULTY") lines = WELCOME_FACULTY_ASCII;
  else if (text === "WELCOME ADMIN") lines = WELCOME_ADMIN_ASCII;
  const [displayedLines, setDisplayedLines] = useState<string[]>(lines);
  const [glitchIndex, setGlitchIndex] = useState<number | null>(null);

  // Subtle live matrix flicker / scanline shimmer
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly glitch a character momentarily
      setGlitchIndex(Math.floor(Math.random() * lines.length));
      setTimeout(() => setGlitchIndex(null), 120);
    }, 1800);

    return () => clearInterval(interval);
  }, [lines]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`font-mono select-none pointer-events-none leading-none overflow-hidden ${className}`}
      >
        <pre className="text-[7px] sm:text-[9px] md:text-[11px] lg:text-[12px] font-bold tracking-tighter text-[#FF6D1F]/40 drop-shadow-[0_0_12px_rgba(255,109,31,0.35)] transition-all">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`transition-colors duration-150 ${
                glitchIndex === idx
                  ? "text-[#FAF3E1] brightness-150 translate-x-0.5"
                  : "text-[#FF6D1F]/50 hover:text-[#FF6D1F]"
              }`}
            >
              {line}
            </div>
          ))}
        </pre>
      </motion.div>
    </AnimatePresence>
  );
}
