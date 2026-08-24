import React, { useRef, useEffect } from "react";
import { ArrowRight, Sparkles, GraduationCap, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function AcademicGallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const galleryGridRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Left Side Content Reveal Timeline
      if (leftContentRef.current) {
        gsap.fromTo(
          leftContentRef.current.children,
          { opacity: 0, x: -40 },
          {
            scrollTrigger: {
              trigger: leftContentRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
            opacity: 1,
            x: 0,
            duration: 0.85,
            stagger: 0.14,
            ease: "power3.out",
            clearProps: "opacity,transform",
          }
        );
      }

      // 2. Gallery Cards Staggered 3D Cascade
      if (galleryGridRef.current) {
        gsap.fromTo(
          galleryGridRef.current.children,
          { opacity: 0, y: 60, scale: 0.92, rotationY: 10 },
          {
            scrollTrigger: {
              trigger: galleryGridRef.current,
              start: "top 78%",
              toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            duration: 0.9,
            stagger: 0.16,
            ease: "power3.out",
            clearProps: "opacity,transform,scale",
          }
        );
      }

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Throttled GSAP 3D Interactive Card Hover Tilt
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
      scale: 1.02,
      duration: 0.25,
      ease: "power1.out",
      overwrite: "auto",
    });

    const img = card.querySelector("img");
    if (img) {
      gsap.to(img, { scale: 1.06, duration: 0.4, ease: "power1.out", overwrite: "auto" });
    }
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });

    const img = e.currentTarget.querySelector("img");
    if (img) {
      gsap.to(img, { scale: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    }
  };

  const galleryImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
      alt: "Students studying together in modern campus library",
      title: "Collaborative Study Hubs",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop",
      alt: "Tech students coding and discussing project on laptops",
      title: "Hands-on Technical Sprints",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop",
      alt: "Interactive classroom lecture with professor",
      title: "Interactive Faculty Mentorship",
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop",
      alt: "Campus Graduation & Banners",
      title: "Academic Milestone Celebrations",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-24 px-4 sm:px-8 bg-[#222222] text-[#FAF3E1] flex items-center justify-center overflow-hidden border-y border-[#F5E7C6]/20 select-none"
    >
      {/* Background Subtle Noise & Glow Accents */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[350px] bg-[#FF6D1F]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[300px] bg-[#F5E7C6]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT SIDE CONTENT WITH GSAP REVEAL */}
          <div ref={leftContentRef} className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/40 text-[#FF6D1F] text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Empower & Excel</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-[#FAF3E1] leading-tight tracking-tight">
              Scale Your Academic Potential Through <span className="text-[#FF6D1F]">Innovation</span>
            </h2>

            <p className="text-sm sm:text-base text-[#FAF3E1]/75 font-medium leading-relaxed">
              Transform your university experience with intelligent timetable planning, real-time schedule conflict resolution, and seamless course registration. Designed to help students adapt, excel, and thrive.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#FAF3E1]/90">
                <CheckCircle className="w-4 h-4 text-[#FF6D1F] flex-shrink-0" />
                <span>Automated Conflict-Free Weekly Schedules</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#FAF3E1]/90">
                <CheckCircle className="w-4 h-4 text-[#FF6D1F] flex-shrink-0" />
                <span>Instant Waitlist Promotions & Priority Slots</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#FAF3E1]/90">
                <CheckCircle className="w-4 h-4 text-[#FF6D1F] flex-shrink-0" />
                <span>Recommended Prep & Performance Analytics</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate("/onboarding")}
                className="px-7 py-3.5 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] font-black text-xs sm:text-sm transition-all shadow-lg shadow-[#FF6D1F]/20 flex items-center gap-2.5 cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE 2X2 IMAGE GALLERY WITH GSAP 3D HOVER TILT */}
          <div
            ref={galleryGridRef}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          >
            {galleryImages.map((item) => (
              <div
                key={item.id}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="relative group rounded-2xl overflow-hidden border border-[#F5E7C6]/20 bg-[#181818] shadow-xl cursor-pointer"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-500 will-change-transform"
                    loading="lazy"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-left">
                  <h4 className="text-sm sm:text-base font-bold text-[#FAF3E1] group-hover:text-[#FF6D1F] transition-colors">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-[#FAF3E1]/70 font-medium">
                    Explore Campus Features
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
