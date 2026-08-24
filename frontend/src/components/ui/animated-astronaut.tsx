import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface AstronautProps {
  mode?: "scholar" | "explorer";
  className?: string;
}

export function AnimatedAstronaut({ mode = "scholar", className }: AstronautProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const astroRef = useRef<SVGSVGElement>(null);
  const armRef = useRef<SVGPathElement>(null);
  const diplomaRef = useRef<SVGGElement>(null);
  const laptopRef = useRef<SVGGElement>(null);
  const thrusterRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Zero-G Floating Sine Wave
      if (astroRef.current) {
        gsap.to(astroRef.current, {
          y: -18,
          rotation: 4,
          duration: 3.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // 2. Arm & Item Zero-G Drift
      if (diplomaRef.current) {
        gsap.to(diplomaRef.current, {
          y: -8,
          rotation: -8,
          duration: 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 0.3,
        });
      }

      if (laptopRef.current) {
        gsap.to(laptopRef.current, {
          y: -6,
          rotation: 6,
          duration: 2.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 0.2,
        });
      }

      // 3. Thruster Flame Pulse
      if (thrusterRef.current) {
        gsap.to(thrusterRef.current, {
          scale: 1.4,
          opacity: 0.9,
          duration: 0.4,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // 4. Mouse Interactive Parallax Tilt
      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current || !astroRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

        gsap.to(astroRef.current, {
          rotationY: x * 20,
          rotationX: -y * 20,
          x: x * 15,
          y: y * 12,
          duration: 0.6,
          ease: "power2.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, containerRef);

    return () => ctx.revert();
  }, [mode]);

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center ${className || "w-80 h-80"}`}>
      
      {/* Jetpack Glow Flare */}
      <div className="absolute w-40 h-40 bg-[#FF6D1F]/20 rounded-full blur-[60px] pointer-events-none" />

      <svg
        ref={astroRef}
        viewBox="0 0 320 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl will-change-transform"
      >
        {/* Background Orbit Ring */}
        <ellipse cx="160" cy="170" rx="130" ry="60" stroke="#F5E7C6" strokeWidth="2" strokeDasharray="8 6" opacity="0.3" transform="rotate(-15 160 170)" />

        {/* Jetpack Backpack */}
        <rect x="90" y="125" width="40" height="90" rx="14" fill="#1C1C1E" stroke="#3A3A3C" strokeWidth="3" />
        <rect x="98" y="140" width="24" height="40" rx="8" fill="#FF6D1F" />
        
        {/* Jetpack Thruster Nozzle & Flame */}
        <path d="M100 215L110 235L120 215" fill="#3A3A3C" />
        <circle ref={thrusterRef} cx="110" cy="242" r="10" fill="#FF6D1F" opacity="0.75" />
        <circle cx="110" cy="245" r="5" fill="#FFE58F" />

        {/* Space Suit Body */}
        <path
          d="M120 135C120 120 135 110 160 110C185 110 200 120 200 135L208 220C208 235 195 245 180 245H140C125 245 112 235 112 220L120 135Z"
          fill="#FAF3E1"
          stroke="#1C1C1E"
          strokeWidth="4"
        />

        {/* Chest Panel Control Console */}
        <rect x="135" y="145" width="50" height="35" rx="8" fill="#1C1C1E" />
        <circle cx="148" cy="158" r="4" fill="#FF6D1F" />
        <circle cx="162" cy="158" r="4" fill="#52C41A" />
        <circle cx="174" cy="158" r="4" fill="#1890FF" />
        <rect x="145" y="168" width="30" height="4" rx="2" fill="#F5E7C6" opacity="0.6" />

        {/* Suit Belt */}
        <rect x="125" y="210" width="70" height="10" rx="4" fill="#3A3A3C" />
        <rect x="152" y="208" width="16" height="14" rx="3" fill="#FF6D1F" />

        {/* Legs with Space Boots */}
        <path d="M135 245L130 285C130 292 135 298 142 298H150C155 298 158 292 158 285L158 245" fill="#FAF3E1" stroke="#1C1C1E" strokeWidth="4" />
        <rect x="125" y="285" width="28" height="14" rx="6" fill="#1C1C1E" />

        <path d="M185 245L190 285C190 292 185 298 178 298H170C165 298 162 292 162 285L162 245" fill="#FAF3E1" stroke="#1C1C1E" strokeWidth="4" />
        <rect x="168" y="285" width="28" height="14" rx="6" fill="#1C1C1E" />

        {/* Space Helmet */}
        <circle cx="160" cy="78" r="44" fill="#FAF3E1" stroke="#1C1C1E" strokeWidth="4" />
        
        {/* Iridescent Visor with Cosmic Gold & Orange Reflection */}
        <ellipse cx="160" cy="78" rx="32" ry="26" fill="url(#visorGradient)" stroke="#FF6D1F" strokeWidth="3" />
        <ellipse cx="152" cy="70" rx="16" ry="8" fill="#FFFFFF" opacity="0.45" transform="rotate(-15 152 70)" />

        {/* Helmet Antenna */}
        <line x1="160" y1="34" x2="160" y2="18" stroke="#FF6D1F" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="160" cy="14" r="5" fill="#FF6D1F" />

        {/* Mode Specific Equipment */}
        {mode === "scholar" ? (
          /* Scholar Astronaut: Graduation Cap + Glowing Diploma */
          <>
            {/* Mortarboard Graduation Cap on Helmet */}
            <polygon points="160,18 215,34 160,50 105,34" fill="#1C1C1E" stroke="#FF6D1F" strokeWidth="2" />
            <polygon points="160,22 205,34 160,46 115,34" fill="#FF6D1F" />
            <rect x="140" y="38" width="40" height="10" rx="3" fill="#1C1C1E" />
            <path d="M205,34 L205,56" stroke="#FF6D1F" strokeWidth="3" strokeLinecap="round" />
            <circle cx="205" cy="58" r="3.5" fill="#FFE58F" />

            {/* Left Arm Floating */}
            <path d="M122 140L95 170L85 155" stroke="#FAF3E1" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M122 140L95 170L85 155" stroke="#1C1C1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Right Arm Holding Glowing Diploma */}
            <path d="M198 140L230 155L245 130" stroke="#FAF3E1" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M198 140L230 155L245 130" stroke="#1C1C1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Floating Diploma Scroll */}
            <g ref={diplomaRef}>
              <rect x="235" y="105" width="28" height="38" rx="6" fill="#FAF3E1" stroke="#1C1C1E" strokeWidth="3" transform="rotate(-15 235 105)" />
              <rect x="242" y="118" width="20" height="8" rx="3" fill="#FF6D1F" transform="rotate(-15 242 118)" />
              <circle cx="252" cy="122" r="2.5" fill="#FFE58F" />
            </g>
          </>
        ) : (
          /* Explorer Astronaut: Floating Tech Laptop */
          <>
            {/* Left Arm */}
            <path d="M122 140L100 175L120 195" stroke="#FAF3E1" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M122 140L100 175L120 195" stroke="#1C1C1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Right Arm */}
            <path d="M198 140L220 175L200 195" stroke="#FAF3E1" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M198 140L220 175L200 195" stroke="#1C1C1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Floating Space Laptop */}
            <g ref={laptopRef}>
              <polygon points="120,200 200,200 190,225 130,225" fill="#1C1C1E" stroke="#FF6D1F" strokeWidth="2" />
              <rect x="130" y="165" width="60" height="35" rx="5" fill="#FAF3E1" stroke="#1C1C1E" strokeWidth="3" />
              <rect x="136" y="172" width="18" height="8" rx="2" fill="#FF6D1F" />
              <rect x="158" y="172" width="26" height="4" rx="1.5" fill="#1C1C1E" />
              <rect x="136" y="184" width="48" height="10" rx="2" fill="#F5E7C6" />
            </g>
          </>
        )}

        {/* Floating Space Stars / Dust */}
        <path d="M60 70L63 76L70 78L63 80L60 86L57 80L50 78L57 76Z" fill="#FF6D1F" />
        <path d="M260 85L262 89L267 91L262 93L260 97L258 93L253 91L258 89Z" fill="#FFE58F" />
        <path d="M275 220L277 223L282 225L277 227L275 230L273 227L268 225L273 223Z" fill="#FF6D1F" />

        {/* Visor Linear Gradient */}
        <defs>
          <linearGradient id="visorGradient" x1="128" y1="52" x2="192" y2="104" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1C1C1E" />
            <stop offset="0.5" stopColor="#FF6D1F" />
            <stop offset="1" stopColor="#F5E7C6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
