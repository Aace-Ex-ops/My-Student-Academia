import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { X, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface AlreadyRegisteredRobotModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: {
    code: string;
    title: string;
    credits?: number;
  } | null;
}

export function AlreadyRegisteredRobotModal({
  isOpen,
  onClose,
  course,
}: AlreadyRegisteredRobotModalProps) {
  const navigate = useNavigate();
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const robotContainerRef = useRef<HTMLDivElement>(null);
  const leftThrusterRef = useRef<HTMLDivElement>(null);
  const rightThrusterRef = useRef<HTMLDivElement>(null);
  const dialogBubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    const ctx = gsap.context(() => {
      // 1. Backdrop Fade In
      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" }
        );
      }

      // 2. Robot Rocket Jet Fly-in Entrance
      if (robotContainerRef.current) {
        gsap.fromTo(
          robotContainerRef.current,
          { y: 180, scale: 0.6, opacity: 0, rotation: -12 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.8,
            ease: "back.out(1.5)",
          }
        );

        // Smooth Natural Zero-G Float
        gsap.to(robotContainerRef.current, {
          y: -14,
          rotation: 2,
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.8,
        });
      }

      // 3. Thruster Flame Turbulence
      if (leftThrusterRef.current && rightThrusterRef.current) {
        gsap.to([leftThrusterRef.current, rightThrusterRef.current], {
          scaleY: 1.35,
          scaleX: 1.15,
          opacity: 0.95,
          duration: 0.1,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      }

      // 4. Big Speech Bubble Pop In
      if (dialogBubbleRef.current) {
        gsap.fromTo(
          dialogBubbleRef.current,
          { scale: 0.7, opacity: 0, y: 30 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.25,
            ease: "elastic.out(1, 0.7)",
          }
        );
      }
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      ctx.revert();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoToDashboard = () => {
    onClose();
    navigate("/dashboard");
  };

  return createPortal(
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0B0A09]/85 backdrop-blur-2xl select-none"
    >
      <div
        ref={modalBoxRef}
        className="relative w-full max-w-3xl flex flex-col md:flex-row items-center gap-6 md:gap-10 pointer-events-auto"
      >
        {/* ========================================================= */}
        {/* 1. ORIGINAL CLEAN CYBER COMPANION BOT CARRYING SITE LOGO */}
        {/* ========================================================= */}
        <div
          ref={robotContainerRef}
          className="relative flex-shrink-0 w-64 h-76 sm:w-72 sm:h-84 flex items-center justify-center"
        >
          {/* Ambient Rocket Jet Exhaust Plasma Glow */}
          <div className="absolute bottom-6 w-40 h-40 bg-[#FF6D1F]/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-2 w-28 h-28 bg-amber-400/40 rounded-full blur-xl pointer-events-none" />

          {/* BACKPACK DUAL ROCKET JETS (Left & Right Thruster Tubes) */}
          {/* Left Jet */}
          <div className="absolute top-28 left-4 flex flex-col items-center z-0">
            <div className="w-7 h-20 rounded-full bg-gradient-to-b from-[#333742] via-[#FF6D1F] to-[#20222B] border border-[#F5E7C6]/30 shadow-lg shadow-[#FF6D1F]/30 relative">
              <div className="absolute top-2 left-1 right-1 h-1.5 bg-[#FAF3E1]/40 rounded-full" />
              <div className="absolute top-6 left-1 right-1 h-1 bg-[#12131A] rounded-full" />
            </div>
            {/* Jet Exhaust Nozzle */}
            <div className="w-8 h-4 bg-[#181A22] border border-[#475569] rounded-b-lg -mt-1" />
            {/* Animated Plasma Jet Flame */}
            <div
              ref={leftThrusterRef}
              className="w-5 h-16 bg-gradient-to-b from-white via-[#FFD54F] to-[#FF6D1F] rounded-full blur-[1px] origin-top -mt-1 shadow-[0_0_20px_#FF6D1F]"
            />
          </div>

          {/* Right Jet */}
          <div className="absolute top-28 right-4 flex flex-col items-center z-0">
            <div className="w-7 h-20 rounded-full bg-gradient-to-b from-[#333742] via-[#FF6D1F] to-[#20222B] border border-[#F5E7C6]/30 shadow-lg shadow-[#FF6D1F]/30 relative">
              <div className="absolute top-2 left-1 right-1 h-1.5 bg-[#FAF3E1]/40 rounded-full" />
              <div className="absolute top-6 left-1 right-1 h-1 bg-[#12131A] rounded-full" />
            </div>
            {/* Jet Exhaust Nozzle */}
            <div className="w-8 h-4 bg-[#181A22] border border-[#475569] rounded-b-lg -mt-1" />
            {/* Animated Plasma Jet Flame */}
            <div
              ref={rightThrusterRef}
              className="w-5 h-16 bg-gradient-to-b from-white via-[#FFD54F] to-[#FF6D1F] rounded-full blur-[1px] origin-top -mt-1 shadow-[0_0_20px_#FF6D1F]"
            />
          </div>

          {/* MAIN ROBOT CHASSIS & HELMET (Clean Matte Ceramic & Obsidian Glass) */}
          <div className="relative z-10 flex flex-col items-center w-48">
            
            {/* Top Antenna Beacon */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-[#FF6D1F] border-2 border-white shadow-[0_0_15px_#FF6D1F] animate-pulse" />
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#94a3b8] to-[#475569] rounded-full -mt-0.5" />
            </div>

            {/* Robot Head Dome */}
            <div className="relative w-44 h-32 rounded-[2.5rem] bg-gradient-to-b from-[#2E303D] to-[#161722] border-2 border-[#F5E7C6]/30 shadow-2xl p-2.5 flex items-center justify-center -mt-1">
              
              {/* Head Side Communication Ear Pods */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-12 rounded-full bg-[#FF6D1F] border border-white/30 shadow-md" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-12 rounded-full bg-[#FF6D1F] border border-white/30 shadow-md" />

              {/* Glossy Black OLED Faceplate Visor */}
              <div className="w-full h-full rounded-[2rem] bg-[#070B12] border border-[#38bdf8]/40 shadow-inner relative overflow-hidden flex flex-col items-center justify-center p-3">
                {/* Curved Visor Glass Reflection */}
                <div className="absolute top-1 left-3 right-3 h-3 bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none" />

                {/* Clean Expressive Neon Cyber Eyes (Cute natural friendly look) */}
                <div className="flex items-center justify-center gap-6 mt-1">
                  {/* Left Eye */}
                  <div className="relative w-6 h-6 rounded-full bg-[#38bdf8] shadow-[0_0_15px_#38bdf8] flex items-center justify-center animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-white absolute top-1 left-1" />
                  </div>
                  {/* Right Eye */}
                  <div className="relative w-6 h-6 rounded-full bg-[#38bdf8] shadow-[0_0_15px_#38bdf8] flex items-center justify-center animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-white absolute top-1 left-1" />
                  </div>
                </div>

                {/* Gentle Curved Robotic Smile */}
                <div className="w-8 h-3.5 border-b-[3px] border-[#38bdf8] rounded-full shadow-[0_3px_8px_#38bdf8] mt-1.5" />
              </div>
            </div>

            {/* Robot Neck Collar */}
            <div className="w-16 h-2.5 bg-[#1F212E] border-x border-[#475569] rounded-sm -mt-0.5 z-10" />

            {/* Robot Torso with Mechanical Arms CARRYING THE SITE LOGO */}
            <div className="relative w-40 h-28 rounded-[2rem] bg-gradient-to-b from-[#242633] to-[#12131A] border-2 border-[#F5E7C6]/30 shadow-xl p-2 flex flex-col items-center justify-center -mt-1">
              
              {/* Mechanical Robotic Arms Hugging the Logo */}
              <div className="absolute -left-3 top-3 w-8 h-16 rounded-full border-l-[6px] border-b-[6px] border-[#64748b] -rotate-12" />
              <div className="absolute -right-3 top-3 w-8 h-16 rounded-full border-r-[6px] border-b-[6px] border-[#64748b] rotate-12" />

              {/* ✦ EMBEDDED REAL WEBSITE LOGO PROUDLY CARRIED BY THE ROBOT ✦ */}
              <div className="relative z-20 flex items-center justify-center p-1.5 bg-[#0B0A09] rounded-2xl border-2 border-[#FF6D1F] shadow-[0_0_20px_rgba(255,109,31,0.4)] group hover:scale-105 transition-transform">
                <img
                  src="/android-chrome-512x512.png"
                  alt="My Student Academia Logo"
                  className="w-14 h-14 object-contain rounded-xl drop-shadow-md"
                />
              </div>

              {/* Status Indicator Lights */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono font-black text-[#FAF3E1]/70 uppercase tracking-widest">
                  ACADEMIA BOT
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. BIG BIG DIALOG BOX / SPEECH BUBBLE                     */}
        {/* ========================================================= */}
        <div
          ref={dialogBubbleRef}
          className="relative flex-1 bg-[#121216]/95 backdrop-blur-2xl border-2 border-[#FF6D1F]/60 p-6 sm:p-8 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] space-y-5 text-left"
        >
          {/* Speech Bubble Arrow pointing towards Robot */}
          <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent border-r-[16px] border-r-[#FF6D1F]/60" />
          <div className="hidden md:block absolute -left-[13px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[14px] border-r-[#121216]" />

          {/* Close 'X' Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-[#1A1A24] hover:bg-[#282836] text-[#FAF3E1]/70 hover:text-white border border-[#F5E7C6]/15 transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6D1F]/20 border border-[#FF6D1F]/40 text-[#FF6D1F] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6D1F]" />
            <span>My Student Academia • Assistant</span>
          </div>

          {/* Big Big Dialog Statement */}
          <div className="space-y-2.5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#FAF3E1] tracking-tight leading-tight">
              You already registered for this course mate! 🚀
            </h2>
            <p className="text-xs sm:text-sm text-[#FAF3E1]/80 font-medium leading-relaxed">
              No need to register again! You are already confirmed on the student roster for{" "}
              {course ? (
                <strong className="text-[#FF6D1F] font-black">{course.code} ({course.title})</strong>
              ) : (
                "this course"
              )}
              . Your seat is secured and live access is activated in your dashboard!
            </p>
          </div>

          {/* Course Status Pill */}
          {course && (
            <div className="p-4 rounded-2xl bg-[#181822] border border-[#F5E7C6]/15 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#FAF3E1]">{course.code}: {course.title}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">✓ 100% Online Active Seat Confirmed</div>
                </div>
              </div>
              {course.credits && (
                <span className="text-xs font-black text-[#FF6D1F] bg-[#FF6D1F]/15 px-3 py-1 rounded-xl border border-[#FF6D1F]/30">
                  {course.credits} Credits
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              onClick={handleGoToDashboard}
              className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-2xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF6D1F]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>View in My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#1A1A24] hover:bg-[#252534] border border-[#F5E7C6]/20 text-[#FAF3E1] text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              Got It, Mate! 👍
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
