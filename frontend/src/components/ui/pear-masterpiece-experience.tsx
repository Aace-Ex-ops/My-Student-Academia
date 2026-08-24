import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Award,
  Zap,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// 5 Synchronized Chapters matching all 5 Widgets & HUD Indicators
const CHAPTER_DATA = [
  {
    id: 0,
    chapterNum: "CH.01",
    chapterLabel: "Chapter 01",
    kicker: "01 // Registration Engine",
    main: "Multi-slot routine freedom.",
    sub: "Zero schedule overlaps.",
    detail:
      "Select multiple non-overlapping class slots for any course section. Real-time minute-overlap algorithms guarantee zero double-booking across your entire week.",
    tag: "Registration Engine",
    title: "Multi-Slot Routine Freedom",
    metric: "0 Overlaps",
    icon: Calendar,
  },
  {
    id: 1,
    chapterNum: "CH.02",
    chapterLabel: "Chapter 02",
    kicker: "02 // Open Curriculum",
    main: "Recommended preparation.",
    sub: "No barrier prerequisites.",
    detail:
      "Rigid blocking prerequisites are replaced with helpful prep guidance. Every student has direct open registration access to learn what inspires them without locks.",
    tag: "Open Curriculum",
    title: "Prerequisites as Recommended Prep",
    metric: "100% Open",
    icon: Sparkles,
  },
  {
    id: 2,
    chapterNum: "CH.03",
    chapterLabel: "Chapter 03",
    kicker: "03 // Capacity Control",
    main: "Automated waitlist queue.",
    sub: "Instant auto-promotion.",
    detail:
      "When course sections hit max capacity (30 seats), students receive transparent queue positioning with automatic promotion as soon as a seat opens.",
    tag: "Capacity Control",
    title: "Automated Waitlist Queue",
    metric: "< 50ms Auto-Fill",
    icon: ShieldCheck,
  },
  {
    id: 3,
    chapterNum: "CH.04",
    chapterLabel: "Chapter 04",
    kicker: "04 // Student Analytics",
    main: "Performance & routine health.",
    sub: "Live schedule auditing.",
    detail:
      "Real-time auditing of registered credit load, weekly commitment hours, routine consistency index, and dynamic performance feedback on manual slot drops.",
    tag: "Student Analytics",
    title: "Performance & Routine Health",
    metric: "18 Credits Max",
    icon: TrendingUp,
  },
  {
    id: 4,
    chapterNum: "CH.05",
    chapterLabel: "Chapter 05",
    kicker: "05 // Personalization",
    main: "Student persona avatars.",
    sub: "Synced across dashboard.",
    detail:
      "Personalize your identity across Astronaut, Scholar, Techie, and Minimalist personas with live sync to your header dropdown, profile, and term banner.",
    tag: "Personalization",
    title: "Student Avatar Persona Sync",
    metric: "Live Sync",
    icon: Award,
  },
];

export function PearMasterpieceExperience() {
  const navigate = useNavigate();

  // DOM Refs
  const stageRef = useRef<HTMLDivElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const cylinderRef = useRef<HTMLDivElement>(null);

  // Crosshairs
  const crosshairTL = useRef<HTMLDivElement>(null);
  const crosshairTR = useRef<HTMLDivElement>(null);
  const crosshairBL = useRef<HTMLDivElement>(null);
  const crosshairBR = useRef<HTMLDivElement>(null);

  // Synchronized State
  const [activeChapter, setActiveChapter] = useState(0);
  const lastChapIndexRef = useRef(0);
  const scrollTriggerInstanceRef = useRef<ScrollTrigger | null>(null);

  // Drag & Swipe Interaction Tracking
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentRotationYRef = useRef(0);

  // Hardware-Accelerated GSAP Rotation with Direct GPU Pipeline
  const animateCylinderTo = useCallback((targetAngle: number) => {
    if (!cylinderRef.current) return;
    currentRotationYRef.current = targetAngle;
    gsap.to(cylinderRef.current, {
      rotationY: targetAngle,
      duration: 0.6,
      ease: "power3.out",
      force3D: true,
      overwrite: "auto",
    });
  }, []);

  const selectChapter = useCallback(
    (index: number) => {
      const total = CHAPTER_DATA.length;
      const clampedIndex = (index + total) % total;
      lastChapIndexRef.current = clampedIndex;
      setActiveChapter(clampedIndex);
      
      // If ScrollTrigger is active, smoothly animate scroll position to match
      if (scrollTriggerInstanceRef.current && stageRef.current) {
        const start = scrollTriggerInstanceRef.current.start;
        const totalDist = scrollTriggerInstanceRef.current.end - start;
        const targetScroll = start + (clampedIndex / (total - 1)) * totalDist;
        window.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });
      } else {
        animateCylinderTo(-clampedIndex * 72);
      }
    },
    [animateCylinderTo]
  );

  // Interactive Drag / Swipe on the 3D Cylinder
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !cylinderRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 40) {
      const direction = deltaX > 0 ? -1 : 1;
      selectChapter(activeChapter + direction);
      isDraggingRef.current = false;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // 1. ULTRA-GLOSSY THREE.JS 3D WEBGL ENGINE (HARDWARE-ACCELERATED)
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      80
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      precision: "mediump",
      depth: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    container.appendChild(renderer.domElement);

    // 3D Glossy Metallic Torus Knot (36x12 for pure 120 FPS)
    const torusGeometry = new THREE.TorusKnotGeometry(1.5, 0.38, 36, 12, 2, 3);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6d1f,
      emissive: 0x220a00,
      roughness: 0.22,
      metalness: 0.92,
    });
    const mainMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(mainMesh);

    // Inner wireframe core
    const wireGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xf5e7c6,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const wireCore = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireCore);

    // Star dust particles
    const particleCount = 35;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xf5e7c6,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.matrixAutoUpdate = false;
    particleSystem.updateMatrix();
    scene.add(particleSystem);

    // Lighting with warm specular highlights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    ambientLight.matrixAutoUpdate = false;
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff6d1f, 3.8, 30);
    pointLight1.position.set(5, 5, 5);
    pointLight1.matrixAutoUpdate = false;
    pointLight1.updateMatrix();
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf5e7c6, 2.2, 30);
    pointLight2.position.set(-5, -4, 3);
    pointLight2.matrixAutoUpdate = false;
    pointLight2.updateMatrix();
    scene.add(pointLight2);

    let animationFrameId: number;
    let isVisible = true;

    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const elapsedTime = clock.getElapsedTime();

      mainMesh.rotation.x = elapsedTime * 0.14;
      mainMesh.rotation.y = elapsedTime * 0.18;

      wireCore.rotation.x = -elapsedTime * 0.12;
      wireCore.rotation.y = -elapsedTime * 0.15;

      particleSystem.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      torusGeometry.dispose();
      torusMaterial.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // 2. CONTINUOUS LIQUID-SMOOTH GSAP SCROLLTRIGGER (FORCE3D GPU COMPOSITING)
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!stageRef.current || !pinWrapperRef.current || !cylinderRef.current) return;

      const totalChapters = CHAPTER_DATA.length;
      const maxRotationAngle = -((totalChapters - 1) * 72); // -288deg

      // Master Continuous Pinned Scrub Animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top top",
          end: `+=${totalChapters * 380}`,
          pin: pinWrapperRef.current,
          anticipatePin: 1,
          fastScrollEnd: true,
          scrub: 0.4, // Instant & fluid momentum scrub
          onUpdate: (self) => {
            const progress = self.progress;
            const continuousIdx = progress * (totalChapters - 1);
            const nearestIdx = Math.min(totalChapters - 1, Math.max(0, Math.round(continuousIdx)));
            
            if (nearestIdx !== lastChapIndexRef.current) {
              lastChapIndexRef.current = nearestIdx;
              setActiveChapter(nearestIdx);
            }
          },
        },
      });

      scrollTriggerInstanceRef.current = tl.scrollTrigger as ScrollTrigger;

      // CONTINUOUS ROTATION: The 3D cylinder glides smoothly as you scroll!
      tl.to(cylinderRef.current, {
        rotationY: maxRotationAngle,
        ease: "none",
        force3D: true,
      });

      // Animated Crosshair Sparkles
      gsap.to(
        [
          crosshairTL.current,
          crosshairTR.current,
          crosshairBL.current,
          crosshairBR.current,
        ],
        {
          rotation: 360,
          duration: 16,
          repeat: -1,
          ease: "none",
        }
      );
    }, stageRef);

    return () => ctx.revert();
  }, []);

  const currentChapter = CHAPTER_DATA[activeChapter];

  return (
    <div
      ref={stageRef}
      className="relative w-full bg-[#0B0A09] text-[#FAF3E1] font-sans select-none overflow-hidden"
    >
      {/* PINNED MASTER STAGE CONTAINER */}
      <div
        ref={pinWrapperRef}
        className="relative w-full h-screen flex flex-col justify-between p-6 sm:p-12 overflow-hidden"
      >
        {/* THREE.JS BACKGROUND WEBGL CANVAS */}
        <div
          ref={canvasContainerRef}
          className="absolute inset-0 z-0 pointer-events-none opacity-40"
        />

        {/* GLOSSY BLUEPRINT GRID LINES & CROSSHAIRS */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-25">
          <div className="absolute top-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6]/60 to-transparent" />
          <div className="absolute bottom-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6]/60 to-transparent" />
          <div className="absolute top-0 bottom-0 left-8 sm:left-16 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6]/60 to-transparent" />
          <div className="absolute top-0 bottom-0 right-8 sm:right-16 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6]/60 to-transparent" />

          {/* Star Crosshairs at the 4 Blueprint Intersections */}
          <div
            ref={crosshairTL}
            className="absolute top-16 left-8 sm:left-16 -translate-x-1/2 -translate-y-1/2 text-[#FF6D1F] text-sm"
          >
            ✦
          </div>
          <div
            ref={crosshairTR}
            className="absolute top-16 right-8 sm:right-16 translate-x-1/2 -translate-y-1/2 text-[#FF6D1F] text-sm"
          >
            ✦
          </div>
          <div
            ref={crosshairBL}
            className="absolute bottom-16 left-8 sm:left-16 -translate-x-1/2 translate-y-1/2 text-[#FF6D1F] text-sm"
          >
            ✦
          </div>
          <div
            ref={crosshairBR}
            className="absolute bottom-16 right-8 sm:right-16 translate-x-1/2 translate-y-1/2 text-[#FF6D1F] text-sm"
          >
            ✦
          </div>
        </div>

        {/* TOP TELEMETRY HUD BAR (ALL 5 CHAPTERS SYNCHRONIZED) */}
        <div className="relative z-20 flex items-center justify-between w-full border-b border-[#F5E7C6]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF6D1F] animate-ping" />
            <span className="text-xs font-mono font-black text-[#FF6D1F] tracking-widest uppercase">
              MSA_ENGINE // 5_CHAPTER_STAGE
            </span>
          </div>

          {/* Chapter Indicators (CH.01 to CH.05 Synchronized Glass Pill Buttons) */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono font-bold text-[#FAF3E1]/70">
            {CHAPTER_DATA.map((ch, idx) => {
              const isCurrent = activeChapter === idx;
              return (
                <button
                  key={ch.id}
                  onClick={() => selectChapter(idx)}
                  className={`transition-all duration-300 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isCurrent
                      ? "bg-gradient-to-r from-[#FF6D1F] to-[#ff853f] text-[#FAF3E1] font-black shadow-[0_0_20px_rgba(255,109,31,0.5)] scale-105 border border-white/30"
                      : "bg-[#141416]/80 border border-[#F5E7C6]/20 text-[#FAF3E1]/60 hover:text-[#FAF3E1] hover:border-[#FF6D1F]"
                  }`}
                >
                  <span>{ch.chapterNum}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => navigate("/onboarding")}
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-[#FF6D1F] border border-white/20 hover:border-[#FF6D1F] text-xs font-bold transition-all text-[#FAF3E1] cursor-pointer shadow-md active:scale-95"
          >
            <span>Launch Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CENTER MAIN DISPLAY: SCROLLYTELLING TEXT (LEFT) & TRUE 3D CYLINDER CAROUSEL (RIGHT) */}
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto w-full max-w-7xl mx-auto">
          
          {/* LEFT: SMOOTH GLOSSY BEAT HEADLINE */}
          <div className="lg:col-span-5 space-y-6 text-left min-h-[280px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeChapter}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF6D1F]/20 to-transparent border border-[#FF6D1F]/40 text-[#FF6D1F] text-xs font-black uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>{currentChapter.kicker}</span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-4xl sm:text-5xl font-black text-[#FAF3E1] tracking-tight leading-none">
                    {currentChapter.main}
                  </h2>
                  <h3 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6D1F] via-[#ffa166] to-[#FF6D1F] tracking-tight leading-none">
                    {currentChapter.sub}
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-[#FAF3E1]/80 font-medium leading-relaxed max-w-md">
                  {currentChapter.detail}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Interactive Navigation Prompt */}
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-[#FAF3E1]/50">
              <div className="w-6 h-10 rounded-full border border-[#FAF3E1]/30 flex justify-center p-1">
                <div className="w-1.5 h-2 bg-[#FF6D1F] rounded-full animate-bounce" />
              </div>
              <span>Swipe cards, click CH tabs, or scroll to revolve in 3D</span>
            </div>
          </div>

          {/* RIGHT: CONTINUOUS 3D GLOSSY REVOLVING CYLINDER CAROUSEL (5 CARDS WITH SWIPE SUPPORT) */}
          <div
            className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[380px] touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* 3D Perspective Viewport */}
            <div
              className="relative w-full h-[360px] flex items-center justify-center cursor-grab active:cursor-grabbing"
              style={{ perspective: "1300px" }}
            >
              <div
                ref={cylinderRef}
                className="relative w-[300px] sm:w-[340px] h-[260px]"
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
                {CHAPTER_DATA.map((card, idx) => {
                  const cardAngle = (360 / CHAPTER_DATA.length) * idx;
                  const Icon = card.icon;
                  const isActive = activeChapter === idx;

                  return (
                    <div
                      key={card.id}
                      onClick={() => selectChapter(idx)}
                      className={`absolute inset-0 p-6 rounded-3xl flex flex-col justify-between text-left cursor-pointer transition-all duration-500 ease-out ${
                        isActive
                          ? "border-2 border-[#FF6D1F] shadow-[0_0_50px_rgba(255,109,31,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] opacity-100 scale-105 pointer-events-auto"
                          : "border border-white/10 shadow-xl opacity-35 hover:opacity-70 scale-95 pointer-events-auto"
                      }`}
                      style={{
                        transform: `rotateY(${cardAngle}deg) translateZ(285px)`,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,109,31,0.05) 40%, rgba(18,18,22,0.98) 100%)"
                          : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(14,14,16,0.95) 100%)",
                      }}
                    >
                      {/* Top Specular Light Accent for Active Card */}
                      {isActive && (
                        <div className="absolute top-0 left-8 right-8 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                      )}

                      {/* Top Card Bar */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-colors duration-300 ${
                              isActive
                                ? "bg-gradient-to-br from-[#FF6D1F] to-[#e65c10] text-white shadow-[#FF6D1F]/30"
                                : "bg-[#222226] text-[#FAF3E1]/70"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#FF6D1F] uppercase block">
                              {card.chapterLabel}
                            </span>
                            <span className="text-xs font-black text-[#FAF3E1]">
                              {card.tag}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md transition-colors duration-300 ${
                            isActive
                              ? "bg-[#FF6D1F]/20 text-[#FF6D1F] border border-[#FF6D1F]/40 shadow-sm"
                              : "bg-white/5 text-[#FAF3E1]/60"
                          }`}
                        >
                          {card.metric}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="my-auto space-y-1.5">
                        <h4 className="text-lg font-black text-[#FAF3E1] leading-tight">
                          {card.title}
                        </h4>
                        <p className="text-xs text-[#FAF3E1]/70 leading-relaxed font-medium line-clamp-3">
                          {card.detail}
                        </p>
                      </div>

                      {/* Bottom Glow Action */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-[#FF6D1F]">
                        <span>{isActive ? "Active Chapter" : "Click to Revolve"}</span>
                        <Zap
                          className={`w-3.5 h-3.5 transition-transform duration-300 ${
                            isActive ? "scale-125 text-[#FF6D1F]" : ""
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cylinder Manual Navigation Controls */}
            <div className="flex items-center gap-4 mt-4 z-30">
              <button
                onClick={() => selectChapter(activeChapter - 1)}
                className="p-3 rounded-2xl bg-[#181818]/90 border border-white/10 text-[#FAF3E1] hover:text-[#FF6D1F] hover:border-[#FF6D1F] transition-all cursor-pointer shadow-lg active:scale-95"
                title="Previous Chapter"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-xs font-mono font-bold text-[#FAF3E1]/75">
                CHAPTER 0{activeChapter + 1} / 05 • {currentChapter.title}
              </span>

              <button
                onClick={() => selectChapter(activeChapter + 1)}
                className="p-3 rounded-2xl bg-[#181818]/90 border border-white/10 text-[#FAF3E1] hover:text-[#FF6D1F] hover:border-[#FF6D1F] transition-all cursor-pointer shadow-lg active:scale-95"
                title="Next Chapter"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>

        {/* BOTTOM HUD STATUS BAR */}
        <div className="relative z-20 flex items-center justify-between w-full border-t border-[#F5E7C6]/15 pt-4 text-[11px] font-mono text-[#FAF3E1]/50">
          <div>PEAR_STYLE // MY STUDENT ACADEMIA V2.0</div>
          <div className="text-[#FF6D1F] font-bold">
            ACTIVE_CHAPTER: {currentChapter.chapterNum} // 05
          </div>
          <div>SCROLL_PROGRESS: {Math.round(((activeChapter + 1) / CHAPTER_DATA.length) * 100)}%</div>
        </div>
      </div>
    </div>
  );
}
