import React from "react";
import { motion } from "framer-motion";

interface KineticTextProps {
  text: string;
  className?: string;
}

export function KineticText({ text, className = "" }: KineticTextProps) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.1 * i },
    }),
  };

  const childVariants = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 150,
      },
    },
    hidden: {
      opacity: 0,
      y: 40,
      rotateX: -90,
      scale: 0.8,
    },
  };

  return (
    <motion.div
      className={`inline-flex flex-wrap justify-center items-baseline overflow-visible py-3 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex items-baseline whitespace-nowrap mr-[0.35em]">
          {Array.from(word).map((char, charIndex) => (
            <motion.span
              key={charIndex}
              variants={childVariants}
              whileHover={{
                scale: 1.08,
                color: "#FF6D1F",
                textShadow: "0 0 25px rgba(255, 109, 31, 0.7)",
                transition: { duration: 0.15 },
              }}
              className="inline-block text-[#222222] font-extrabold cursor-default select-none transition-all duration-300 leading-normal pb-1"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}
