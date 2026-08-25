import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Users, ArrowUpRight, Sparkles, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ExploreCoursesSection() {
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Crosshairs
  const crosshairTL = useRef<HTMLDivElement>(null);
  const crosshairTR = useRef<HTMLDivElement>(null);
  const crosshairBL = useRef<HTMLDivElement>(null);
  const crosshairBR = useRef<HTMLDivElement>(null);

  const courses = [
    {
      id: "AI402",
      code: "AI-402",
      title: "Applied Generative AI & LLM Bootcamp",
      department: "Artificial Intelligence",
      credits: 4,
      instructor: "Prof. Alan Turing",
      schedule: "Tue/Thu 02:00 - 03:30 PM",
      enrolled: 38,
      maxCapacity: 40,
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800&auto=format&fit=crop",
      badge: "Paid Bootcamp",
      price: "₹3,999",
      isPaid: true,
    },
    {
      id: "CS101",
      code: "CS-101",
      title: "Data Structures & Algorithms",
      department: "Computer Science",
      credits: 4,
      instructor: "Dr. Emily Reed",
      schedule: "Mon/Wed 10:00 - 11:30 AM",
      enrolled: 42,
      maxCapacity: 50,
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
      badge: "Academic Free",
      price: "₹0 (Free)",
      isPaid: false,
    },
    {
      id: "MERN301",
      code: "WEB-301",
      title: "Full-Stack MERN & Next.js Masterclass",
      department: "Software Engineering",
      credits: 3,
      instructor: "Dr. Sarah Jenkins",
      schedule: "Mon/Wed 01:00 - 02:30 PM",
      enrolled: 48,
      maxCapacity: 50,
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop",
      badge: "Paid Certification",
      price: "₹2,499",
      isPaid: true,
    },
    {
      id: "FIN404",
      code: "FIN-404",
      title: "Quantitative Finance & Algorithmic Trading",
      department: "Fintech & Quant",
      credits: 4,
      instructor: "Dr. Marcus Vance",
      schedule: "Fri 02:00 - 05:00 PM",
      enrolled: 29,
      maxCapacity: 35,
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop",
      badge: "Paid Industry Pro",
      price: "₹4,999",
      isPaid: true,
    },
    {
      id: "EE201",
      code: "EE-201",
      title: "Embedded Systems & Robotics IoT",
      department: "Electrical Engineering",
      credits: 4,
      instructor: "Dr. Marcus Vance",
      schedule: "Tue/Thu 11:00 AM - 12:30 PM",
      enrolled: 28,
      maxCapacity: 35,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
      badge: "Academic Free",
      price: "₹0 (Free)",
      isPaid: false,
    },
    {
      id: "CYBER202",
      code: "SEC-202",
      title: "Ethical Hacking & Cyber Defense Certification",
      department: "Cybersecurity",
      credits: 3,
      instructor: "Prof. Alex Rivera",
      schedule: "Sat 10:00 AM - 01:00 PM",
      enrolled: 34,
      maxCapacity: 40,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
      badge: "Paid Certificate",
      price: "₹1,999",
      isPaid: true,
    },
    {
      id: "BUS204",
      code: "BUS-204",
      title: "Tech Product Management & Growth",
      department: "Business & Strategy",
      credits: 3,
      instructor: "Prof. Sophia Patel",
      schedule: "Fri 09:00 AM - 12:00 PM",
      enrolled: 30,
      maxCapacity: 40,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      badge: "Academic Free",
      price: "₹0 (Free)",
      isPaid: false,
    },
    {
      id: "DES102",
      code: "DES-102",
      title: "UI/UX Figma Design Systems Masterclass",
      department: "Product Design",
      credits: 3,
      instructor: "Dr. Alex Rivera",
      schedule: "Mon/Wed 03:00 - 04:30 PM",
      enrolled: 24,
      maxCapacity: 30,
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop",
      badge: "Paid Design",
      price: "₹1,499",
      isPaid: true,
    },
  ];

  // Tripled course list for infinite mathematical loop
  const duplicatedCourses = [...courses, ...courses, ...courses];
  const CARD_WIDTH = 374;
  const SINGLE_SET_WIDTH = courses.length * CARD_WIDTH;

  // GSAP ScrollTrigger Entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { opacity: 0, y: 35 },
          {
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.14,
            ease: "power3.out",
            clearProps: "opacity,transform",
          }
        );
      }

      // Crosshair Spin
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Truly Seamless Infinite Ticker Loop with Delta-Time Smoothness & IntersectionObserver
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let isVisible = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTime = performance.now();
        }
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    const infiniteTicker = (currentTime: number) => {
      if (!isVisible || isPaused) {
        lastTime = currentTime;
        animId = requestAnimationFrame(infiniteTicker);
        return;
      }

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.scrollLeft += 48 * delta;

        if (container.scrollLeft >= SINGLE_SET_WIDTH) {
          container.scrollLeft -= SINGLE_SET_WIDTH;
        }
      }
      animId = requestAnimationFrame(infiniteTicker);
    };

    animId = requestAnimationFrame(infiniteTicker);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
    };
  }, [isPaused, SINGLE_SET_WIDTH]);

  // Arrow Button Navigation (< & >)
  const handleArrowScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;

    setIsPaused(true);

    const scrollAmount = direction === "left" ? -CARD_WIDTH : CARD_WIDTH;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });

    setTimeout(() => {
      if (container.scrollLeft >= SINGLE_SET_WIDTH * 2) {
        container.scrollLeft -= SINGLE_SET_WIDTH;
      } else if (container.scrollLeft <= 0 && direction === "left") {
        container.scrollLeft += SINGLE_SET_WIDTH;
      }
      setIsPaused(false);
    }, 700);
  };

  // Keyboard Arrow Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handleArrowScroll("left");
      } else if (e.key === "ArrowRight") {
        handleArrowScroll("right");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      y: -6,
      transformPerspective: 1200,
      scale: 1.02,
      duration: 0.35,
      ease: "power2.out",
      borderColor: "#FF6D1F",
      boxShadow: "0 20px 30px -10px rgba(255, 109, 31, 0.3)",
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
    });
  };

  return (
    <section
      ref={sectionRef}
      id="explore-courses"
      className="py-28 px-4 sm:px-8 bg-[#0B0A09] text-[#FAF3E1] relative border-t border-[#F5E7C6]/20 select-none overflow-hidden"
    >
      {/* Blueprint Grid Lines & Crosshairs */}
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

      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-[#FF6D1F]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header Row */}
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div className="text-left max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-[#FAF3E1] tracking-tight">
              Explore Academic & <span className="text-[#FF6D1F]">Paid Pro Courses</span>
            </h2>

            <p className="text-sm sm:text-base text-[#FAF3E1]/75 font-medium leading-relaxed">
              Endless automated course stream. Hover over any card to freeze in place, or click the arrow buttons / press keyboard arrow keys to browse!
            </p>
          </div>

          {/* Navigation Arrow Buttons (< & >) */}
          <div className="flex items-center gap-3 z-30">
            <button
              onClick={() => handleArrowScroll("left")}
              className="w-12 h-12 rounded-2xl bg-[#181818] hover:bg-[#222222] border border-[#F5E7C6]/20 hover:border-[#FF6D1F] flex items-center justify-center text-[#FAF3E1] transition-all cursor-pointer shadow-md active:scale-95 hover:scale-105"
              aria-label="Previous Course"
              title="Previous Course (Left Arrow Key)"
            >
              <ChevronLeft className="w-6 h-6 text-[#FAF3E1]" />
            </button>

            <button
              onClick={() => handleArrowScroll("right")}
              className="w-12 h-12 rounded-2xl bg-[#FF6D1F] hover:bg-[#e65c10] border border-[#FF6D1F] flex items-center justify-center text-[#FAF3E1] transition-all cursor-pointer shadow-lg shadow-[#FF6D1F]/30 active:scale-95 hover:scale-105"
              aria-label="Next Course"
              title="Next Course (Right Arrow Key)"
            >
              <ChevronRight className="w-6 h-6 text-[#FAF3E1]" />
            </button>
          </div>
        </div>

        {/* Endless Scrollable Container */}
        <div
          className="relative w-full overflow-hidden py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left & Right Gradient Fade Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0B0A09] to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0B0A09] to-transparent z-20 pointer-events-none" />

          {/* Truly Infinite Scroll Track */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-none pb-4 pt-2 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {duplicatedCourses.map((course, idx) => (
              <div
                key={`${course.id}-${idx}`}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="min-w-[300px] sm:min-w-[350px] max-w-[350px] flex-shrink-0 bg-[#141414]/90 rounded-3xl border border-[#F5E7C6]/20 overflow-hidden shadow-2xl backdrop-blur-xl transition-all flex flex-col justify-between group cursor-pointer"
              >
                {/* Card Top Image Header */}
                <div className="relative h-48 w-full overflow-hidden bg-[#222222]">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 will-change-transform"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-transparent to-transparent" />

                  {/* Course Code Pill */}
                  <span className="absolute top-4 left-4 bg-[#0B0A09]/90 backdrop-blur-md text-[#FAF3E1] text-xs font-extrabold px-3 py-1 rounded-xl border border-[#F5E7C6]/20">
                    {course.code}
                  </span>

                  {/* Price Tag Pill */}
                  <span
                    className={`absolute top-4 right-4 text-xs font-black px-3 py-1 rounded-xl shadow-md flex items-center gap-1 ${
                      course.isPaid
                        ? "bg-emerald-600 text-[#FAF3E1]"
                        : "bg-[#FF6D1F] text-[#FAF3E1]"
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{course.price}</span>
                  </span>

                  {/* Department Tag */}
                  <div className="absolute bottom-3 left-4 text-[11px] font-extrabold text-[#FAF3E1]/90 tracking-wider uppercase">
                    {course.department}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 text-left space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#FAF3E1] group-hover:text-[#FF6D1F] transition-colors leading-snug mb-2">
                      {course.title}
                    </h3>

                    {/* Metadata Row: Instructor & Schedule */}
                    <div className="space-y-1.5 text-xs font-semibold text-[#FAF3E1]/70">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-[#FF6D1F]" />
                        <span>{course.instructor} • {course.credits} Credits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#FF6D1F]" />
                        <span>{course.schedule}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Seat Progress & Action Button */}
                  <div className="pt-4 border-t border-[#F5E7C6]/15 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#FF6D1F]" />
                      <span className="text-xs font-extrabold text-[#FAF3E1]">
                        {course.enrolled}/{course.maxCapacity} Seats
                      </span>
                    </div>

                    <button
                      onClick={() => navigate("/auth")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ${
                        course.isPaid
                          ? "bg-emerald-600 hover:bg-emerald-700 text-[#FAF3E1]"
                          : "bg-[#222222] hover:bg-[#FF6D1F] text-[#FAF3E1]"
                      }`}
                    >
                      <span>{course.isPaid ? "Enroll Pro" : "Register"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
