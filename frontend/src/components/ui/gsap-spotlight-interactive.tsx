import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, Calendar, TrendingUp, Award, Layers, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

export function GsapSpotlightInteractive() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const cardsGroupRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Throttled Mouse Spotlight Tracking Effect
      let rafId: number | null = null;
      const handleMouseMove = (e: MouseEvent) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          if (sectionRef.current && spotlightRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            gsap.to(spotlightRef.current, {
              x,
              y,
              duration: 0.25,
              ease: "power1.out",
              overwrite: "auto",
            });
          }
          rafId = null;
        });
      };

      const sectionEl = sectionRef.current;
      if (sectionEl) {
        sectionEl.addEventListener("mousemove", handleMouseMove, { passive: true });
      }

      // ScrollTrigger Cards Reveal
      if (cardsGroupRef.current) {
        gsap.fromTo(
          cardsGroupRef.current.children,
          { opacity: 0, y: 70, scale: 0.9 },
          {
            scrollTrigger: {
              trigger: cardsGroupRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            clearProps: "opacity,transform,scale",
          }
        );
      }

      return () => {
        if (sectionEl) {
          sectionEl.removeEventListener("mousemove", handleMouseMove);
        }
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 3D Tilt Effect on Card Hover
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (y / (rect.height / 2)) * -6;
    const rotY = (x / (rect.width / 2)) * 6;

    gsap.to(card, {
      rotationX: rotX,
      rotationY: rotY,
      transformPerspective: 1200,
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
      scale: 1,
      duration: 0.5,
      ease: "power2.out",
      borderColor: "rgba(245, 231, 198, 0.2)",
      boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.4)",
      overwrite: "auto",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-4 sm:px-8 bg-[#181818] text-[#FAF3E1] overflow-hidden border-t border-[#F5E7C6]/20 select-none"
    >
      {/* GSAP Dynamic Mouse Spotlight Glow */}
      <div
        ref={spotlightRef}
        className="absolute top-0 left-0 w-[450px] h-[450px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#FF6D1F]/25 to-amber-500/20 rounded-full blur-[140px] pointer-events-none z-0"
      />

      <div className="max-w-7xl mx-auto space-y-14 relative z-10 text-left">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl sm:text-5xl font-black text-[#FAF3E1] tracking-tight leading-tight">
              Designed for the Next Generation of <span className="text-[#FF6D1F]">Academia</span>
            </h2>
            <p className="text-sm sm:text-base text-[#FAF3E1]/70 font-medium">
              Move your cursor over the cards to experience real-time 3D GSAP perspective tilting and ambient lighting!
            </p>
          </div>

          <button
            onClick={() => navigate("/auth")}
            className="px-7 py-3.5 rounded-2xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] font-black text-xs transition-all shadow-xl shadow-[#FF6D1F]/20 flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Explore Dashboard Live</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Tilt Spotlight Cards */}
        <div ref={cardsGroupRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="bg-[#222222] border border-[#F5E7C6]/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#FF6D1F] text-white flex items-center justify-center shadow-lg shadow-[#FF6D1F]/30">
                <TrendingUp className="w-7 h-7" />
              </div>
              <span className="text-xs font-black text-[#FF6D1F] uppercase tracking-wider block">
                Feature 01
              </span>
              <h3 className="text-2xl font-black text-[#FAF3E1]">
                Performance Tracker Dashboard
              </h3>
              <p className="text-xs text-[#FAF3E1]/75 leading-relaxed font-medium">
                Live monitoring of enrolled credit load, weekly commitment hours, routine health consistency scores, and audit trails.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#F5E7C6]/15 flex items-center gap-2 text-xs font-extrabold text-[#FF6D1F]">
              <span>Realtime Progress Auditing</span>
              <Award className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="bg-[#222222] border border-[#F5E7C6]/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF3E1] text-[#222222] flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-[#FF6D1F]" />
              </div>
              <span className="text-xs font-black text-[#FF6D1F] uppercase tracking-wider block">
                Feature 02
              </span>
              <h3 className="text-2xl font-black text-[#FAF3E1]">
                Interactive Timetable Routine
              </h3>
              <p className="text-xs text-[#FAF3E1]/75 leading-relaxed font-medium">
                Visual weekly schedule grid with manual slot removal (`✕`), 5 standard academic time slots, and minute-range overlap prevention.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#F5E7C6]/15 flex items-center gap-2 text-xs font-extrabold text-[#FAF3E1]">
              <span>Standard 5 Time Slots</span>
              <Layers className="w-4 h-4 text-[#FF6D1F]" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="bg-[#222222] border border-[#F5E7C6]/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#FF6D1F]/20 border border-[#FF6D1F]/40 text-[#FF6D1F] flex items-center justify-center shadow-md">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-black text-[#FF6D1F] uppercase tracking-wider block">
                Feature 03
              </span>
              <h3 className="text-2xl font-black text-[#FAF3E1]">
                Open Catalog Enrollment
              </h3>
              <p className="text-xs text-[#FAF3E1]/75 leading-relaxed font-medium">
                Prerequisites rebranded as "Recommended Prep". Students can enroll in any course regardless of completed prerequisites.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#F5E7C6]/15 flex items-center gap-2 text-xs font-extrabold text-[#FF6D1F]">
              <span>Open Course Registration</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
