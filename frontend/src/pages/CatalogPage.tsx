import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  Search,
  BookOpen,
  Users,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Globe,
  Video,
  Layers,
  Check,
  Zap,
} from "lucide-react";
import { User } from "@/types";
import { AlreadyRegisteredRobotModal } from "@/components/ui/AlreadyRegisteredRobotModal";

interface CatalogPageProps {
  currentUser?: User | null;
}

// Subject Image Helper Mapping
const getCourseImage = (code: string) => {
  const c = code?.toUpperCase() || "";
  if (c.includes("CS") || c.includes("101")) {
    return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("AI") || c.includes("402")) {
    return "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("WEB") || c.includes("301") || c.includes("DEV")) {
    return "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("FIN") || c.includes("404") || c.includes("BUS")) {
    return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("EE") || c.includes("201") || c.includes("IOT")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("SEC") || c.includes("202") || c.includes("CYBER")) {
    return "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("DES") || c.includes("102") || c.includes("UX")) {
    return "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop";
  }
  return "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop";
};

export function CatalogPage({ currentUser }: CatalogPageProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [registeringCourseId, setRegisteringCourseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Registered Courses State for Button Logic & Robot Modal
  const [registeredCourseCodes, setRegisteredCourseCodes] = useState<Set<string>>(new Set());
  const [robotModalOpen, setRobotModalOpen] = useState<boolean>(false);
  const [selectedRegisteredCourse, setSelectedRegisteredCourse] = useState<any>(null);

  const navigate = useNavigate();

  // Animation Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
  }, [selectedDept]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchStudentEnrollments();
    }
  }, [currentUser]);

  const fetchStudentEnrollments = async () => {
    try {
      const res = await fetch(`/api/registration/student/${currentUser?.id}`);
      const json = await res.json();
      if (json.enrollments) {
        const codes = new Set<string>();
        json.enrollments.forEach((e: any) => {
          if (e.section?.course?.code) codes.add(e.section.course.code);
          if (e.section?.course?.id) codes.add(e.section.course.id);
          if (e.section?.courseId) codes.add(e.section.courseId);
        });
        setRegisteredCourseCodes(codes);
      }
    } catch (err) {
      console.error("Failed to load student enrollments for catalog", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/courses/departments");
      const json = await res.json();
      setDepartments(json);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const url = `/api/courses?departmentId=${selectedDept}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const json = await res.json();
      setCourses(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // GSAP animations
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      if (starRef.current) {
        gsap.to(starRef.current, {
          rotation: 360,
          duration: 15,
          repeat: -1,
          ease: "none",
        });
      }

      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "opacity,transform",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading, courses]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  // 1-Click Online Course Registration Handler
  const handleQuickRegister = async (course: any, section: any) => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    const isAlreadyRegistered =
      registeredCourseCodes.has(course.code) ||
      registeredCourseCodes.has(course.id) ||
      (section?.id && registeredCourseCodes.has(section.id));

    // If course is already registered, trigger the animated robot popup modal!
    if (isAlreadyRegistered) {
      setSelectedRegisteredCourse(course);
      setRobotModalOpen(true);
      return;
    }

    try {
      setRegisteringCourseId(course.id);
      setFeedback(null);

      const res = await fetch("/api/registration/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          courseId: course.id,
          sectionId: section?.id,
        }),
      });

      const json = await res.json();

      if (json.alreadyEnrolled) {
        // Mark as registered and open robot modal
        setRegisteredCourseCodes((prev) => new Set(prev).add(course.code).add(course.id));
        setSelectedRegisteredCourse(course);
        setRobotModalOpen(true);
      } else if (!res.ok) {
        setFeedback({ type: "error", message: json.error || "Registration failed." });
      } else {
        // Success!
        setRegisteredCourseCodes((prev) => new Set(prev).add(course.code).add(course.id));
        setFeedback({
          type: "success",
          message: json.message || `Successfully registered for ${course.code}! 🚀`,
        });
        fetchCourses();
        fetchStudentEnrollments();
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Network connection error during registration." });
    } finally {
      setRegisteringCourseId(null);
    }
  };

  const handleOpenDetailsPage = (course: any, section: any) => {
    const courseWithImage = {
      ...course,
      image: getCourseImage(course.code),
    };
    navigate("/register-course", {
      state: { course: courseWithImage, section },
    });
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left select-none font-sans relative overflow-hidden"
    >
      {/* ✦ ARCHITECTURAL BLUEPRINT GRID & NEBULA BACKGROUND ✦ */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute bottom-20 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 left-12 sm:left-24 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 right-12 sm:right-24 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />
      </div>

      <div className="absolute top-14 right-20 pointer-events-none z-0 opacity-40">
        <span ref={starRef} className="inline-block text-[#FF6D1F] text-xl font-serif">✦</span>
      </div>

      {/* Ambient Glowing Nebulae */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[300px] bg-[#FF6D1F]/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-1/3 right-10 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* ✦ ANIMATED ROCKET JET ROBOT POPUP MODAL ✦ */}
      <AlreadyRegisteredRobotModal
        isOpen={robotModalOpen}
        onClose={() => setRobotModalOpen(false)}
        course={selectedRegisteredCourse}
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fall 2026 Academic Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#FAF3E1] flex items-center gap-3 tracking-tight">
              <BookOpen className="w-8 h-8 text-[#FF6D1F]" />
              Online Course Catalog
            </h1>
            <p className="text-[#FAF3E1]/70 text-xs sm:text-sm mt-1 font-medium">
              Browse accredited university curriculum and register for interactive online sessions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-[#121216]/90 border border-[#F5E7C6]/15 px-4 py-2 rounded-2xl shadow-md self-start sm:self-auto">
            <Layers className="w-4 h-4 text-[#FF6D1F]" />
            <span className="text-xs font-bold text-[#FAF3E1]/80">
              <strong className="text-[#FAF3E1]">{courses.length}</strong> Courses Available
            </span>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-3 ${
              feedback.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/80 border-rose-500/40 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs opacity-70 hover:opacity-100 uppercase tracking-wider font-mono cursor-pointer"
            >
              Dismiss ✕
            </button>
          </div>
        )}

        {/* Filter Controls Bar (Dark Obsidian Glass) */}
        <div className="bg-[#121216]/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Department Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedDept("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex-shrink-0 ${
                selectedDept === "ALL"
                  ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-lg shadow-[#FF6D1F]/30"
                  : "bg-[#181822] hover:bg-[#252530] text-[#FAF3E1]/70 hover:text-[#FAF3E1] border border-[#F5E7C6]/10"
              }`}
            >
              All Subjects
            </button>
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex-shrink-0 ${
                  selectedDept === dept.id
                    ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-lg shadow-[#FF6D1F]/30"
                    : "bg-[#181822] hover:bg-[#252530] text-[#FAF3E1]/70 hover:text-[#FAF3E1] border border-[#F5E7C6]/10"
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#FF6D1F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, title, topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181822] border border-[#F5E7C6]/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] transition-all font-semibold"
            />
          </form>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-[#FF6D1F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <span className="text-xs font-bold text-[#FAF3E1]/60">Loading available courses...</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center bg-[#121216]/80 rounded-3xl border border-[#F5E7C6]/10 p-8 space-y-3">
            <AlertCircle className="w-10 h-10 text-[#FF6D1F] mx-auto opacity-75" />
            <h3 className="font-bold text-base text-[#FAF3E1]">No courses match your query</h3>
            <p className="text-xs text-[#FAF3E1]/60 max-w-sm mx-auto">
              Try searching with another keyword or resetting the subject filter.
            </p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isAlreadyRegistered =
                registeredCourseCodes.has(course.code) || registeredCourseCodes.has(course.id);
              const defaultSection = course.sections?.[0] || null;
              const isRegistering = registeringCourseId === course.id;

              return (
                <div
                  key={course.id}
                  className="bg-[#121216]/90 backdrop-blur-xl rounded-3xl border border-[#F5E7C6]/15 overflow-hidden shadow-xl hover:border-[#FF6D1F]/50 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Top Image Banner */}
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-[#181822]">
                      <img
                        src={getCourseImage(course.code)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform opacity-85"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/30 to-transparent" />

                      {/* Course Code Badge */}
                      <span className="absolute top-4 left-4 bg-[#0B0A09]/90 backdrop-blur-md text-[#FAF3E1] text-xs font-black px-3 py-1 rounded-xl border border-[#F5E7C6]/20">
                        {course.code}
                      </span>

                      {/* Registered Badge or Credit Count */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        {isAlreadyRegistered && (
                          <span className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-black px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5 animate-in fade-in">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Enrolled
                          </span>
                        )}
                        <span className="bg-[#FF6D1F] text-[#FAF3E1] text-xs font-black px-3 py-1 rounded-xl shadow-lg shadow-[#FF6D1F]/30">
                          {course.credits} Credits
                        </span>
                      </div>
                    </div>

                    {/* Course Content Body */}
                    <div className="p-6 space-y-3">
                      <h3 className="font-black text-[#FAF3E1] text-lg group-hover:text-[#FF6D1F] transition-colors leading-snug">
                        {course.title}
                      </h3>

                      <p className="text-[#FAF3E1]/70 text-xs leading-relaxed line-clamp-3 font-medium">
                        {course.description || "Comprehensive theoretical and practical coursework."}
                      </p>

                      {/* Recommended Preparation Badge */}
                      {course.prerequisites && course.prerequisites.length > 0 && (
                        <div className="mt-2 text-[11px] text-[#FAF3E1] bg-[#1A1A22] border border-[#F5E7C6]/15 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-[#FF6D1F]" />
                          <span>
                            Prereq: {course.prerequisites.map((p: any) => p.prereqCourse.code).join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Available Section Delivery Info */}
                      <div className="mt-4 pt-4 border-t border-[#F5E7C6]/10 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-black text-[#FAF3E1]">
                          <span>100% Online Delivery</span>
                          <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Interactive Platform
                          </span>
                        </div>

                        <div className="text-xs text-[#FAF3E1]/80 font-medium flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-[#FF6D1F]" />
                          <span>Weekly Live Lectures & Office Hours</span>
                        </div>

                        {defaultSection && (
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="flex items-center gap-1 text-[#FAF3E1]/70 font-semibold">
                              <Users className="w-3.5 h-3.5 text-[#FF6D1F]" />
                              Inst: {defaultSection.instructor?.name || "Faculty"}
                            </span>
                            <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[10px]">
                              {defaultSection._count?.enrollments || 0}/{defaultSection.maxCapacity} Enrolled
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="p-6 pt-0 space-y-2">
                    {/* Primary Instant Register Button */}
                    <button
                      onClick={() => handleQuickRegister(course, defaultSection)}
                      disabled={isRegistering}
                      className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                        isAlreadyRegistered
                          ? "bg-emerald-950/90 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 shadow-emerald-950/50 hover:scale-[1.02]"
                          : "bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] shadow-[#FF6D1F]/30 hover:scale-[1.02]"
                      }`}
                    >
                      {isRegistering ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Enrolling...</span>
                        </>
                      ) : isAlreadyRegistered ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                          <span>Already Registered</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current" />
                          <span>Register Online Course</span>
                        </>
                      )}
                    </button>

                    {/* Secondary Link: Syllabus & Details */}
                    <button
                      onClick={() => handleOpenDetailsPage(course, defaultSection)}
                      className="w-full py-2 text-[11px] font-bold text-[#FAF3E1]/70 hover:text-[#FAF3E1] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View Full Syllabus & Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
