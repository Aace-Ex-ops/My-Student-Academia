import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, Zap, ShieldCheck, Award, Sparkles, Clock, CheckCircle2, TrendingUp } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function GsapBentoShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsBannerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const stat1Ref = useRef<HTMLSpanElement>(null);
  const stat2Ref = useRef<HTMLSpanElement>(null);
  const stat3Ref = useRef<HTMLSpanElement>(null);

  // Crosshairs
  const crosshairTL = useRef<HTMLDivElement>(null);
  const crosshairTR = useRef<HTMLDivElement>(null);
  const crosshairBL = useRef<HTMLDivElement>(null);
  const crosshairBR = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header Reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            clearProps: "opacity,transform",
          }
        );
      }

      // 2. Stats Banner Entrance
      if (statsBannerRef.current) {
        gsap.fromTo(
          statsBannerRef.current,
          { opacity: 0, y: 40, scale: 0.96 },
          {
            scrollTrigger: {
              trigger: statsBannerRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: "power3.out",
            clearProps: "opacity,transform,scale",
          }
        );
      }

      // 3. Bento Grid Staggered Reveal
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 60, scale: 0.92 },
          {
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.14,
            ease: "power3.out",
            clearProps: "opacity,transform,scale",
          }
        );
      }

      // 4. Animated GSAP Number Counters
      const animateCounter = (ref: React.RefObject<HTMLSpanElement>, endVal: number, prefix = "", suffix = "") => {
        if (!ref.current) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: endVal,
          duration: 2.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 90%",
          },
          onUpdate: () => {
            if (ref.current) {
              ref.current.innerText = `${prefix}${Math.round(obj.val).toLocaleString()}${suffix}`;
            }
          },
        });
      };

      animateCounter(stat1Ref, 99, "+", "%");
      animateCounter(stat2Ref, 15000, "", "+");
      animateCounter(stat3Ref, 50, "< ", "ms");

      // 5. Crosshair Spin
      gsap.to(
        [
          crosshairTL.current,
          crosshairTR.current,
          crosshairBL.current,
          crosshairBR.current,
        ],
        {
          rotation: 360,
          duration: 12,
          repeat: -1,
          ease: "none",
        }
      );

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // GSAP 3D Interactive Card Hover Tilt
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (y / (rect.height / 2)) * -5;
    const rotY = (x / (rect.width / 2)) * 5;

    gsap.to(card, {
      rotationX: rotX,
      rotationY: rotY,
      transformPerspective: 1000,
      y: -5,
      scale: 1.02,
      duration: 0.35,
      ease: "power2.out",
      borderColor: "#FF6D1F",
      boxShadow: "0 20px 35px -10px rgba(255, 109, 31, 0.25)",
      overwrite: "auto",
    });
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotationX: 0,
      rotationY: 0,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: "power2.out",
      borderColor: "rgba(245, 231, 198, 0.2)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
      overwrite: "auto",
    });
  };

  return (
    <section
      ref={containerRef}
      className="py-28 px-4 sm:px-8 bg-[#0B0A09] text-[#FAF3E1] relative overflow-hidden border-t border-[#F5E7C6]/20 select-none"
    >
      {/* Blueprint Grid Lines & Crosshair Stars */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-25">
        <div className="absolute top-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute bottom-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 left-8 sm:left-16 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 right-8 sm:right-16 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />

        <div ref={crosshairTL} className="absolute top-16 left-8 sm:left-16 -translate-x-1/2 -translate-y-1/2 text-[#FF6D1F]">✦</div>
        <div ref={crosshairTR} className="absolute top-16 right-8 sm:right-16 translate-x-1/2 -translate-y-1/2 text-[#FF6D1F]">✦</div>
        <div ref={crosshairBL} className="absolute bottom-16 left-8 sm:left-16 -translate-x-1/2 translate-y-1/2 text-[#FF6D1F]">✦</div>
        <div ref={crosshairBR} className="absolute bottom-16 right-8 sm:right-16 translate-x-1/2 translate-y-1/2 text-[#FF6D1F]">✦</div>
      </div>

      {/* Glow Ambient Circles */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[300px] bg-[#FF6D1F]/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10 text-left">
        
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/40 text-[#FF6D1F] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GSAP Powered Core Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#FAF3E1] tracking-tight leading-tight">
            Engineered for <span className="text-[#FF6D1F]">Academic Speed</span> & Precision
          </h2>
          <p className="text-sm sm:text-base text-[#FAF3E1]/75 font-medium">
            Explore how My Student Academia handles complex multi-slot routines, overlap detection, and waitlists.
          </p>
        </div>

        {/* Live Animated Counter Stats Banner */}
        <div
          ref={statsBannerRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 rounded-3xl bg-[#141414]/90 border border-[#F5E7C6]/20 shadow-2xl backdrop-blur-xl text-center"
        >
          <div className="p-4 space-y-1">
            <span ref={stat1Ref} className="text-4xl sm:text-5xl font-black text-[#FF6D1F] block">
              0%
            </span>
            <span className="text-xs font-black text-[#FAF3E1] uppercase tracking-wider block">
              Conflict-Free Routine Accuracy
            </span>
            <p className="text-xs text-[#FAF3E1]/60 font-medium">Real-time minute overlap calculations</p>
          </div>

          <div className="p-4 space-y-1 md:border-x border-[#F5E7C6]/15">
            <span ref={stat2Ref} className="text-4xl sm:text-5xl font-black text-[#FF6D1F] block">
              0+
            </span>
            <span className="text-xs font-black text-[#FAF3E1] uppercase tracking-wider block">
              Active Enrolled Students
            </span>
            <p className="text-xs text-[#FAF3E1]/60 font-medium">Seamless concurrent registration capacity</p>
          </div>

          <div className="p-4 space-y-1">
            <span ref={stat3Ref} className="text-4xl sm:text-5xl font-black text-[#FF6D1F] block">
              0 ms
            </span>
            <span className="text-xs font-black text-[#FAF3E1] uppercase tracking-wider block">
              Waitlist Resolution Latency
            </span>
            <p className="text-xs text-[#FAF3E1]/60 font-medium">Instant seat auto-fill on cancellation</p>
          </div>
        </div>

        {/* Bento Grid Layout with GSAP 3D Hover Tilt */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Multi-Slot Routine Picker (Span 2) */}
          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="md:col-span-2 p-8 rounded-3xl bg-[#141414]/90 border border-[#F5E7C6]/20 shadow-2xl backdrop-blur-xl flex flex-col justify-between cursor-pointer group transition-all"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 flex items-center justify-center text-[#FF6D1F] group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-black text-[#FF6D1F] uppercase tracking-wider">
                  Flexible Scheduling
                </span>
                <h3 className="text-2xl font-black text-[#FAF3E1]">
                  Multi-Slot Routine Freedom
                </h3>
                <p className="text-sm text-[#FAF3E1]/75 leading-relaxed font-medium">
                  Register for morning lectures and afternoon labs in a single course section with zero timetable conflict issues.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F5E7C6]/15 flex items-center justify-between text-xs font-bold text-[#FF6D1F]">
              <span>Multiple Days & Slots Supported</span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                100% Conflict-Free
              </span>
            </div>
          </div>

          {/* Card 2: Performance Tracker (Span 2) */}
          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="md:col-span-2 p-8 rounded-3xl bg-[#141414]/90 border border-[#F5E7C6]/20 shadow-2xl backdrop-blur-xl flex flex-col justify-between cursor-pointer group transition-all"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#222222] border border-[#222222]/40 flex items-center justify-center text-[#FAF3E1] group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-[#FF6D1F]" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-black text-[#FF6D1F] uppercase tracking-wider">
                  Live Analytics
                </span>
                <h3 className="text-2xl font-black text-[#FAF3E1]">
                  Academic Performance Tracker
                </h3>
                <p className="text-sm text-[#FAF3E1]/75 leading-relaxed font-medium">
                  Real-time metrics auditing your registered credit load (18 credits max), commitment hours, and dropped slot history.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F5E7C6]/15 flex items-center justify-between text-xs font-bold text-[#FF6D1F]">
              <span>Real-Time Audit Trail</span>
              <span className="text-[#FAF3E1] bg-[#222222] px-2.5 py-1 rounded-full border border-[#F5E7C6]/20">
                Automatic Health Score
              </span>
            </div>
          </div>

          {/* Card 3: Recommended Prep Guidance (Span 2) */}
          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="md:col-span-2 p-8 rounded-3xl bg-[#141414]/90 border border-[#F5E7C6]/20 shadow-2xl backdrop-blur-xl flex flex-col justify-between cursor-pointer group transition-all"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 flex items-center justify-center text-[#FF6D1F] group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-black text-[#FF6D1F] uppercase tracking-wider">
                  Open Catalog
                </span>
                <h3 className="text-2xl font-black text-[#FAF3E1]">
                  Recommended Prep, No Gatekeeping
                </h3>
                <p className="text-sm text-[#FAF3E1]/75 leading-relaxed font-medium">
                  Prior courses are treated as recommendations rather than hard barriers. Every student has open registration access.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F5E7C6]/15 flex items-center justify-between text-xs font-bold text-[#FF6D1F]">
              <span>Open Enrollment</span>
              <span className="text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/30">
                Recommended Prep Only
              </span>
            </div>
          </div>

          {/* Card 4: Automated Waitlist Engine (Span 2) */}
          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="md:col-span-2 p-8 rounded-3xl bg-[#141414]/90 border border-[#F5E7C6]/20 shadow-2xl backdrop-blur-xl flex flex-col justify-between cursor-pointer group transition-all"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#222222] border border-[#222222]/40 flex items-center justify-center text-[#FAF3E1] group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-[#FF6D1F]" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-black text-[#FF6D1F] uppercase tracking-wider">
                  Capacity Control
                </span>
                <h3 className="text-2xl font-black text-[#FAF3E1]">
                  Automated Waitlist Engine
                </h3>
                <p className="text-sm text-[#FAF3E1]/75 leading-relaxed font-medium">
                  Transparent queue numbers when course sections hit capacity (30 seats) with instant auto-promotion.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F5E7C6]/15 flex items-center justify-between text-xs font-bold text-[#FF6D1F]">
              <span>Live Queue Tracking</span>
              <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                Auto-Promote On
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
