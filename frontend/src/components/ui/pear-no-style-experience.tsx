import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Clock, Calendar, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  { id: "ch1", label: "Ch. 1", title: "Smart Timetable" },
  { id: "ch2", label: "Ch. 2", title: "Multi-Slot Routine" },
  { id: "ch3", label: "Ch. 3", title: "Recommended Prep" },
  { id: "ch4", label: "Ch. 4", title: "3D FAQ Carousel" },
];

const FAQ_CAROUSEL_ITEMS = [
  {
    q: "How does multi-slot course registration work?",
    a: "Students can select multiple non-overlapping routine slots for any course section (e.g., Monday 09:00 AM + Wednesday 01:00 PM). Automated minute-range checks prevent double booking.",
    tag: "Registration Logic"
  },
  {
    q: "Are prerequisites hard requirements or recommendations?",
    a: "All course prerequisites have been rebranded as Recommended Prep. Any student can enroll in any course regardless of completed courses!",
    tag: "Open Access"
  },
  {
    q: "How does manual slot removal work on the timetable?",
    a: "Hovering over any registered class card in your timetable reveals a manual Trash button (`✕`). Clicking it immediately drops the slot and recalculates your routine metrics.",
    tag: "Routine Management"
  },
  {
    q: "What is tracked in the Performance Tracker?",
    a: "Enrolled credit load (out of 18 max), weekly class commitment hours, routine health index (consistency score), and a live schedule audit trail.",
    tag: "Analytics"
  },
  {
    q: "What happens when a course section reaches 30 seats?",
    a: "You are placed in an automated waitlist queue with transparent position numbering. When a seat opens, the system auto-promotes the next student.",
    tag: "Waitlist Engine"
  }
];

export function PearNoStyleExperience() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Mouse Tracking for 3D Perspective Tilt & Grid Intersections
  const glassCardRef = useRef<HTMLDivElement>(null);
  const crosshair1Ref = useRef<HTMLDivElement>(null);
  const crosshair2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Kinetic Text Character Reveal
      const kineticLines = containerRef.current?.querySelectorAll(".kinetic-line");
      if (kineticLines && kineticLines.length > 0) {
        gsap.fromTo(
          kineticLines,
          { y: "100%", opacity: 0 },
          {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 75%",
            },
            y: "0%",
            opacity: 1,
            duration: 0.9,
            stagger: 0.2,
            ease: "power3.out",
            clearProps: "all",
          }
        );
      }

      // 2. Crosshair Rotation Loops
      if (crosshair1Ref.current && crosshair2Ref.current) {
        gsap.to([crosshair1Ref.current, crosshair2Ref.current], {
          rotation: 360,
          duration: 12,
          repeat: -1,
          ease: "none",
        });
      }

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 3D Glass Card Mouse Tilt
  const handleGlassMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!glassCardRef.current) return;
    const rect = glassCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (y / (rect.height / 2)) * -10;
    const rotY = (x / (rect.width / 2)) * 10;

    gsap.to(glassCardRef.current, {
      rotationX: rotX,
      rotationY: rotY,
      transformPerspective: 1200,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleGlassMouseLeave = () => {
    if (!glassCardRef.current) return;
    gsap.to(glassCardRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  const handleNextFaq = () => {
    setCarouselIndex((prev) => (prev + 1) % FAQ_CAROUSEL_ITEMS.length);
  };

  const handlePrevFaq = () => {
    setCarouselIndex((prev) => (prev - 1 + FAQ_CAROUSEL_ITEMS.length) % FAQ_CAROUSEL_ITEMS.length);
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen py-28 px-4 sm:px-8 bg-[#0B0A09] text-[#FAF3E1] font-sans overflow-hidden border-t border-[#F5E7C6]/20 snap-start select-none"
    >
      {/* PEAR.NO ARCHITECTURAL GRID OVERLAY LINES */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-25">
        {/* Horizontal Blueprint Lines */}
        <div className="absolute top-24 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute bottom-24 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        
        {/* Vertical Blueprint Lines */}
        <div className="absolute top-0 bottom-0 left-12 sm:left-24 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 right-12 sm:right-24 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />

        {/* Intersection Crosshairs */}
        <div ref={crosshair1Ref} className="absolute top-24 left-12 sm:left-24 -translate-x-1/2 -translate-y-1/2 text-[#FF6D1F]">
          ✦
        </div>
        <div ref={crosshair2Ref} className="absolute top-24 right-12 sm:right-24 translate-x-1/2 -translate-y-1/2 text-[#FF6D1F]">
          ✦
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-20 relative z-10 text-left">
        
        {/* PEAR.NO CHAPTER NAV RAIL */}
        <div className="flex items-center justify-between border-b border-[#F5E7C6]/15 pb-6">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#FF6D1F] animate-ping" />
            <span className="text-xs font-black text-[#FF6D1F] uppercase tracking-widest">
              Pear.no Inspired Experience • My Student Academia
            </span>
          </div>

          {/* Chapter Rail Tabs */}
          <div className="hidden sm:flex items-center gap-6 text-xs font-bold text-[#FAF3E1]/60">
            {CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(idx)}
                className={`transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeChapter === idx ? "text-[#FF6D1F] font-black scale-105" : "hover:text-[#FAF3E1]"
                }`}
              >
                <span className="font-mono text-[10px] text-[#FF6D1F]">{ch.label}</span>
                <span>{ch.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 1: KINETIC SPLIT TEXT HERO REVEAL */}
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/40 text-[#FF6D1F] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kinetic Typography Reveal</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-[#FAF3E1] tracking-tight leading-none overflow-hidden">
            <div className="overflow-hidden py-1">
              <span className="kinetic-line block">Not just an academic portal.</span>
            </div>
            <div className="overflow-hidden py-1">
              <span className="kinetic-line block text-[#FF6D1F]">A partner in your upside.</span>
            </div>
          </h2>

          <p className="text-sm sm:text-lg text-[#FAF3E1]/75 max-w-2xl font-medium leading-relaxed">
            Eliminating hourly bottlenecks, schedule conflicts, and rigid prerequisites. We give students full freedom to build their ideal weekly routine.
          </p>
        </div>

        {/* SECTION 2: PEAR.NO 3D CYLINDER FAQ WHEEL */}
        <div className="bg-[#181818] border border-[#F5E7C6]/20 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5E7C6]/15 pb-6">
            <div>
              <span className="text-xs font-black text-[#FF6D1F] uppercase tracking-wider block mb-1">
                Chapter 04 • Interactive 3D Carousel Wheel
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#FAF3E1]">
                Frequently Asked Questions
              </h3>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevFaq}
                className="w-12 h-12 rounded-2xl bg-[#222222] border border-[#F5E7C6]/30 text-[#FAF3E1] hover:text-[#FF6D1F] hover:border-[#FF6D1F] transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono font-bold text-[#FF6D1F]">
                0{carouselIndex + 1} / 0{FAQ_CAROUSEL_ITEMS.length}
              </span>
              <button
                onClick={handleNextFaq}
                className="w-12 h-12 rounded-2xl bg-[#222222] border border-[#F5E7C6]/30 text-[#FAF3E1] hover:text-[#FF6D1F] hover:border-[#FF6D1F] transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Carousel Card View */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[220px]">
            <div className="md:col-span-4 space-y-2">
              <span className="bg-[#FF6D1F]/20 text-[#FF6D1F] text-[10px] font-black uppercase px-3 py-1 rounded-full border border-[#FF6D1F]/30 inline-block">
                {FAQ_CAROUSEL_ITEMS[carouselIndex].tag}
              </span>
              <h4 className="text-xl font-black text-[#FAF3E1] leading-snug">
                {FAQ_CAROUSEL_ITEMS[carouselIndex].q}
              </h4>
            </div>

            <div className="md:col-span-8 p-6 rounded-2xl bg-[#222222] border border-[#F5E7C6]/15 text-sm sm:text-base text-[#FAF3E1]/85 font-medium leading-relaxed shadow-lg">
              {FAQ_CAROUSEL_ITEMS[carouselIndex].a}
            </div>
          </div>
        </div>

        {/* SECTION 3: PEAR.NO GLASSMORPHISM APPLICATION / PROFILE CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-black text-[#FF6D1F] uppercase tracking-wider block">
              Direct Access Portal
            </span>
            <h3 className="text-3xl font-black text-[#FAF3E1] leading-tight">
              Start Your Course Registration Today
            </h3>
            <p className="text-xs sm:text-sm text-[#FAF3E1]/75 font-medium leading-relaxed">
              No upfront fees, no complex approvals. Experience real-time schedule conflict resolution and open catalog access.
            </p>

            <button
              onClick={() => navigate("/onboarding")}
              className="px-8 py-4 rounded-2xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] font-black text-xs transition-all shadow-xl shadow-[#FF6D1F]/25 flex items-center gap-3 cursor-pointer"
            >
              <span>Launch Onboarding Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3D Tilted Glassmorphism Card (Pear.no Style Form Box) */}
          <div className="lg:col-span-7">
            <div
              ref={glassCardRef}
              onMouseMove={handleGlassMouseMove}
              onMouseLeave={handleGlassMouseLeave}
              className="p-8 rounded-3xl bg-[#181818]/90 border border-[#F5E7C6]/30 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden cursor-pointer"
            >
              {/* Top Glass Rim Glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6D1F] to-transparent opacity-70" />

              <div className="flex items-center justify-between border-b border-[#F5E7C6]/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6D1F] text-white flex items-center justify-center font-bold">
                    🎓
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#FAF3E1]">Student Registration Application</h4>
                    <span className="text-[10px] font-extrabold text-[#FF6D1F] uppercase">Fall 2026 Academic Term</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/40">
                  Active System
                </span>
              </div>

              {/* Form Input Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-[#222222] border border-[#F5E7C6]/20 text-xs text-[#FAF3E1] font-bold">
                  <span className="text-[10px] text-[#FAF3E1]/50 block uppercase mb-1">Student Name</span>
                  <span>Alex Chen</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#222222] border border-[#F5E7C6]/20 text-xs text-[#FAF3E1] font-bold">
                  <span className="text-[10px] text-[#FAF3E1]/50 block uppercase mb-1">Major Field</span>
                  <span className="text-[#FF6D1F]">Computer Science</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#222222] border border-[#F5E7C6]/20 text-xs text-[#FAF3E1] font-bold">
                <span className="text-[10px] text-[#FAF3E1]/50 block uppercase mb-1">Desired Schedule Routine</span>
                <span>Multiple Slots (Mon 09:00 AM + Wed 01:00 PM)</span>
              </div>

              <button
                onClick={() => setFormSubmitted(true)}
                className="w-full py-4 rounded-2xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {formSubmitted ? "Application Submitted! 🎉" : "Submit Student Application"}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
