import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Star,
  GraduationCap,
  SlidersHorizontal,
  ChevronDown,
  Compass,
  Calendar,
  Clock,
  MapPin,
  Flame,
  Award,
  Filter,
} from "lucide-react";
import { User } from "@/types";
import { AlreadyRegisteredRobotModal } from "@/components/ui/AlreadyRegisteredRobotModal";
import {
  saveLocalEnrollment,
  getAllEnrolledCourseCodes,
} from "@/lib/enrollmentStorage";
import {
  EXPANDED_COURSE_CATALOG,
  CourseCatalogItem,
  getStreamMatchLevel,
  StreamMatchLevel,
  STREAM_ADJACENCY_MAP,
} from "@/lib/courseCatalogData";

interface CatalogPageProps {
  currentUser?: User | null;
}

// Subject Image Helper Mapping
const getCourseImage = (code: string, primaryStream?: string) => {
  const c = code?.toUpperCase() || "";
  const s = primaryStream?.toLowerCase() || "";

  if (c.includes("AI") || c.includes("402") || c.includes("408") || s.includes("intelligence")) {
    return "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("CS") || c.includes("101") || c.includes("201") || c.includes("301") || s.includes("computer science")) {
    return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("ECE") || c.includes("ROB") || s.includes("electronics") || s.includes("vlsi")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("ME") || c.includes("AERO") || s.includes("mechanical") || s.includes("aerospace")) {
    return "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("FIN") || s.includes("finance") || s.includes("fintech")) {
    return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("BIO") || s.includes("biotechnology") || s.includes("genetics")) {
    return "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("DES") || s.includes("design") || s.includes("hci")) {
    return "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("CYB") || s.includes("cybersecurity") || s.includes("hacking")) {
    return "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("CE") || s.includes("civil") || s.includes("structural")) {
    return "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("CHEM") || s.includes("chemical") || s.includes("nanotechnology")) {
    return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("LAW") || s.includes("law") || s.includes("policy")) {
    return "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("MED") || s.includes("medical") || s.includes("health")) {
    return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop";
  }
  if (c.includes("MATH") || c.includes("PHYS") || s.includes("mathematics") || s.includes("physics")) {
    return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop";
  }
  return "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop";
};

// All available streams for interactive stream switcher preview
const ALL_STREAMS = Object.keys(STREAM_ADJACENCY_MAP);

export function CatalogPage({ currentUser }: CatalogPageProps) {
  const navigate = useNavigate();

  // Active Stream state (defaults to student's registered major or CS)
  const [activeStream, setActiveStream] = useState<string>(() => {
    return (
      currentUser?.major ||
      currentUser?.customOnboarding?.major ||
      "Computer Science & Engineering"
    );
  });

  // Filter & Search State
  const [catalogFilterTab, setCatalogFilterTab] = useState<"RECOMMENDED" | "CORE" | "ADJACENT" | "ALL">("RECOMMENDED");
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [registeringCourseId, setRegisteringCourseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Registered Courses State for Button Logic & Robot Modal
  const [registeredCourseCodes, setRegisteredCourseCodes] = useState<Set<string>>(new Set());
  const [robotModalOpen, setRobotModalOpen] = useState<boolean>(false);
  const [selectedRegisteredCourse, setSelectedRegisteredCourse] = useState<any>(null);

  // Animation Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);

  // Sync active stream if user profile updates
  useEffect(() => {
    if (currentUser?.major) {
      setActiveStream(currentUser.major);
    }
  }, [currentUser]);

  // Load existing student enrollments on mount
  useEffect(() => {
    if (currentUser?.id) {
      fetchStudentEnrollments();
    }
  }, [currentUser]);

  const fetchStudentEnrollments = async () => {
    const userIdentifier = currentUser?.id || currentUser?.email;
    const codes = getAllEnrolledCourseCodes(userIdentifier);
    setRegisteredCourseCodes(new Set(codes));

    if (!currentUser?.id) return;
    try {
      const res = await fetch(`/api/registration/student/${currentUser.id}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.enrollments) {
        json.enrollments.forEach((e: any) => {
          if (e.section?.course?.code) codes.add(e.section.course.code);
          if (e.section?.course?.id) codes.add(e.section.course.id);
          if (e.section?.courseId) codes.add(e.section.courseId);
        });
        setRegisteredCourseCodes(new Set(codes));
      }
    } catch (err) {
      console.warn("Enrollments fetch note:", err);
    }
  };

  // Compute and filter courses based on Stream Adjacency & Active Filters
  const filteredAndRankedCourses = useMemo(() => {
    return EXPANDED_COURSE_CATALOG.filter((course) => {
      const matchLevel = getStreamMatchLevel(course, activeStream);

      // Filter by Stream Tab
      if (catalogFilterTab === "RECOMMENDED" && matchLevel === "ELECTIVE") {
        return false;
      }
      if (catalogFilterTab === "CORE" && matchLevel !== "CORE") {
        return false;
      }
      if (catalogFilterTab === "ADJACENT" && matchLevel !== "ADJACENT") {
        return false;
      }

      // Filter by Department Code
      if (selectedDeptCode !== "ALL" && course.department.code !== selectedDeptCode) {
        return false;
      }

      // Filter by Difficulty
      if (selectedDifficulty !== "ALL" && course.difficulty !== selectedDifficulty) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inCode = course.code.toLowerCase().includes(q);
        const inTitle = course.title.toLowerCase().includes(q);
        const inDesc = course.description.toLowerCase().includes(q);
        const inTags = course.tags.some((t) => t.toLowerCase().includes(q));
        const inProf = course.instructor.name.toLowerCase().includes(q);
        if (!inCode && !inTitle && !inDesc && !inTags && !inProf) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const levelA = getStreamMatchLevel(a, activeStream);
      const levelB = getStreamMatchLevel(b, activeStream);
      const rankA = levelA === "CORE" ? 0 : levelA === "ADJACENT" ? 1 : 2;
      const rankB = levelB === "CORE" ? 0 : levelB === "ADJACENT" ? 1 : 2;
      return rankA - rankB;
    });
  }, [activeStream, catalogFilterTab, selectedDeptCode, selectedDifficulty, searchQuery]);

  // GSAP animations on filter changes
  useEffect(() => {
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
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.04,
            ease: "power2.out",
            clearProps: "opacity,transform",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [filteredAndRankedCourses.length, activeStream, catalogFilterTab]);

  // 1-Click Online Course Registration Handler
  const handleQuickRegister = async (course: CourseCatalogItem) => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    const isAlreadyRegistered =
      registeredCourseCodes.has(course.code) || registeredCourseCodes.has(course.id);

    if (isAlreadyRegistered) {
      setSelectedRegisteredCourse(course);
      setRobotModalOpen(true);
      return;
    }

    try {
      setRegisteringCourseId(course.id);
      setFeedback(null);

      // Always save locally first for 100% instant persistence
      const userIdentifier = currentUser.id || currentUser.email;
      saveLocalEnrollment(userIdentifier, course);
      setRegisteredCourseCodes((prev) => new Set(prev).add(course.code).add(course.id));

      // Post to backend API if connected
      fetch("/api/registration/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          courseId: course.id,
          courseCode: course.code,
        }),
      }).catch((e) => console.warn("Backend sync notice:", e));

      setFeedback({
        type: "success",
        message: `Successfully registered for ${course.code}: ${course.title}! 🚀`,
      });

    } catch (err) {
      console.error(err);
      const userIdentifier = currentUser.id || currentUser.email;
      saveLocalEnrollment(userIdentifier, course);
      setRegisteredCourseCodes((prev) => new Set(prev).add(course.code).add(course.id));
      setFeedback({
        type: "success",
        message: `Registered for ${course.code}! Slot ${course.slotCode} confirmed on your academic calendar.`,
      });
    } finally {
      setRegisteringCourseId(null);
    }
  };

  const handleOpenDetailsPage = (course: CourseCatalogItem) => {
    const courseWithImage = {
      ...course,
      image: getCourseImage(course.code, course.primaryStream),
    };
    navigate("/register-course", {
      state: { course: courseWithImage },
    });
  };

  // Adjacent streams for the current active stream
  const adjacentStreamsList = STREAM_ADJACENCY_MAP[activeStream] || [];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#09090D] text-[#FAF3E1] px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left select-none font-sans relative overflow-hidden"
    >
      {/* ✦ ARCHITECTURAL GRID & NEBULA BACKGROUND ✦ */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-15">
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
      <div className="absolute bottom-1/3 right-10 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* ✦ ANIMATED ROCKET JET ROBOT POPUP MODAL ✦ */}
      <AlreadyRegisteredRobotModal
        isOpen={robotModalOpen}
        onClose={() => setRobotModalOpen(false)}
        course={selectedRegisteredCourse}
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fall 2026 Academic Catalog • Stream-Adjacent Curriculum</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#FAF3E1] flex items-center gap-3 tracking-tight">
              <BookOpen className="w-8 h-8 text-[#FF6D1F]" />
              Online Course Catalog
            </h1>
            <p className="text-[#FAF3E1]/70 text-xs sm:text-sm mt-1 font-medium max-w-2xl">
              Curriculum dynamically filtered and organized based on your selected academic discipline and adjacent interdisciplinary domains.
            </p>
          </div>

          {/* Active Stream Selector Badge */}
          <div className="bg-[#121218] border border-white/15 p-3 rounded-2xl shadow-xl flex flex-col gap-2 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FAF3E1]/60 uppercase tracking-widest flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#FF6D1F]" />
                Selected Stream
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF6D1F]/20 text-[#FF6D1F] font-bold">
                Personalized
              </span>
            </div>
            <div className="relative">
              <select
                value={activeStream}
                onChange={(e) => setActiveStream(e.target.value)}
                className="w-full bg-[#181822] text-[#FAF3E1] text-xs font-bold px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-[#FF6D1F] cursor-pointer appearance-none pr-8 transition-colors"
              >
                {ALL_STREAMS.map((s) => (
                  <option key={s} value={s} className="bg-[#181822] text-[#FAF3E1]">
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#FAF3E1]/50 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
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
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ✦ STREAM ADJACENCY OVERVIEW PILL ✦ */}
        <div className="bg-[#121218]/90 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#FF6D1F] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Stream Adjacency Matrix:
              </span>
              <span className="text-xs font-extrabold text-[#FAF3E1]">{activeStream}</span>
            </div>
            <p className="text-[11px] text-[#FAF3E1]/60">
              Courses below are categorized as <strong>Core Major</strong> requirements or <strong>Adjacent Electives</strong> from: {adjacentStreamsList.slice(0, 3).join(", ")}.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0B0B0F] border border-white/10 rounded-xl shrink-0 self-start md:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setCatalogFilterTab("RECOMMENDED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                catalogFilterTab === "RECOMMENDED"
                  ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-md shadow-[#FF6D1F]/20"
                  : "text-[#FAF3E1]/60 hover:text-[#FAF3E1]"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Recommended ({activeStream.split(" ")[0]})</span>
            </button>

            <button
              type="button"
              onClick={() => setCatalogFilterTab("CORE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                catalogFilterTab === "CORE"
                  ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-md shadow-[#FF6D1F]/20"
                  : "text-[#FAF3E1]/60 hover:text-[#FAF3E1]"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Core Requirements</span>
            </button>

            <button
              type="button"
              onClick={() => setCatalogFilterTab("ADJACENT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                catalogFilterTab === "ADJACENT"
                  ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-md shadow-[#FF6D1F]/20"
                  : "text-[#FAF3E1]/60 hover:text-[#FAF3E1]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Adjacent Electives</span>
            </button>

            <button
              type="button"
              onClick={() => setCatalogFilterTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                catalogFilterTab === "ALL"
                  ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-md shadow-[#FF6D1F]/20"
                  : "text-[#FAF3E1]/60 hover:text-[#FAF3E1]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Courses ({EXPANDED_COURSE_CATALOG.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Department Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#FAF3E1]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course code, topic, algorithm, professor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#121218] border border-white/10 text-xs font-medium text-[#FAF3E1] placeholder-[#FAF3E1]/30 focus:outline-none focus:border-[#FF6D1F] transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#FAF3E1]/40 hover:text-[#FAF3E1]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-[11px] font-bold text-[#FAF3E1]/50 uppercase tracking-widest whitespace-nowrap">
              Level:
            </span>
            {["ALL", "Introductory", "Intermediate", "Advanced", "Capstone"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedDifficulty(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDifficulty === lvl
                    ? "bg-white/20 text-[#FAF3E1] border border-white/30"
                    : "bg-[#121218] text-[#FAF3E1]/60 hover:text-[#FAF3E1] border border-white/5"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#FAF3E1]/60 font-medium">
          <span>
            Showing <strong className="text-[#FAF3E1] font-bold">{filteredAndRankedCourses.length}</strong> matching courses
          </span>
          {searchQuery && (
            <span>
              Filtered by: "<strong className="text-[#FF6D1F]">{searchQuery}</strong>"
            </span>
          )}
        </div>

        {/* ✦ COURSES GRID ✦ */}
        {filteredAndRankedCourses.length === 0 ? (
          <div className="p-12 text-center bg-[#121218] rounded-3xl border border-white/10 space-y-4">
            <BookOpen className="w-12 h-12 text-[#FF6D1F]/50 mx-auto" />
            <h3 className="text-lg font-bold text-[#FAF3E1]">No matching courses found</h3>
            <p className="text-xs text-[#FAF3E1]/60 max-w-md mx-auto">
              Try adjusting your search query, switching the filter tab to "All Courses", or choosing a different stream above.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setCatalogFilterTab("ALL");
                setSelectedDifficulty("ALL");
                setSelectedDeptCode("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-[#FF6D1F] text-[#FAF3E1] text-xs font-bold hover:bg-[#FF6D1F]/80 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndRankedCourses.map((course) => {
              const matchLevel: StreamMatchLevel = getStreamMatchLevel(course, activeStream);
              const isRegistered =
                registeredCourseCodes.has(course.code) || registeredCourseCodes.has(course.id);
              const isRegistering = registeringCourseId === course.id;
              const courseImage = getCourseImage(course.code, course.primaryStream);

              return (
                <div
                  key={course.id}
                  className="group relative bg-[#121218] rounded-3xl border border-white/10 hover:border-[#FF6D1F]/40 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
                >
                  {/* Card Top Image Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-black/40">
                    <img
                      src={courseImage}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-transparent to-black/60" />

                    {/* Stream Match Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {matchLevel === "CORE" && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF6D1F] to-amber-500 text-[#FAF3E1] text-[10px] font-black uppercase tracking-wider shadow-lg">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Core Requirement</span>
                        </div>
                      )}
                      {matchLevel === "ADJACENT" && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-[#FAF3E1] text-[10px] font-black uppercase tracking-wider shadow-lg">
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Adjacent Elective</span>
                        </div>
                      )}
                      {matchLevel === "ELECTIVE" && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[#FAF3E1]/80 text-[10px] font-bold uppercase tracking-wider">
                          <Globe className="w-3 h-3" />
                          <span>Open Elective</span>
                        </div>
                      )}
                    </div>

                    {/* Credits Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-black text-[#FAF3E1]">
                      {course.credits} Credits
                    </div>

                    {/* Course Code Chip */}
                    <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded-lg bg-[#0B0A09]/90 border border-white/20 text-xs font-black font-mono text-[#FF6D1F]">
                      {course.code}
                    </div>

                    {/* Difficulty Chip */}
                    <div className="absolute bottom-3 right-4 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-bold text-[#FAF3E1]/80 border border-white/10">
                      {course.difficulty}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-[#FAF3E1]/50 uppercase tracking-wider">
                        {course.department.name}
                      </div>
                      <h2 className="text-base font-extrabold text-[#FAF3E1] group-hover:text-[#FF6D1F] transition-colors leading-snug line-clamp-2">
                        {course.title}
                      </h2>
                      <p className="text-xs text-[#FAF3E1]/70 line-clamp-2 leading-relaxed font-normal">
                        {course.description}
                      </p>
                    </div>

                    {/* Schedule & Slot Details */}
                    <div className="p-3 rounded-2xl bg-[#09090D] border border-white/5 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-[#FAF3E1]/80">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#FF6D1F]" />
                          <span className="font-semibold">{course.scheduleDays}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#FF6D1F]" />
                          <span>{course.scheduleTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[#FAF3E1]/60 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-white/40" />
                          <span className="truncate max-w-[140px]">{course.room}</span>
                        </div>
                        <div className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#FAF3E1]/80">
                          Slot: <strong>{course.slotCode}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Instructor & Capacity */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="w-7 h-7 rounded-full object-cover border border-white/20"
                        />
                        <div className="text-left">
                          <div className="text-xs font-bold text-[#FAF3E1] leading-tight">
                            {course.instructor.name}
                          </div>
                          <div className="text-[10px] text-[#FAF3E1]/50 truncate max-w-[140px]">
                            {course.instructor.title}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-[10px] font-medium text-[#FAF3E1]/60">
                        <div className="text-[#FAF3E1] font-bold">
                          {course.enrolledCount} / {course.capacity}
                        </div>
                        <div>Enrolled</div>
                      </div>
                    </div>

                    {/* Action Buttons: 1-Click Register vs Registered Robot Modal */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetailsPage(course)}
                        className="flex-1 py-2.5 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#FAF3E1] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickRegister(course)}
                        disabled={isRegistering}
                        className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 ${
                          isRegistered
                            ? "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                            : "bg-[#FF6D1F] hover:bg-[#FF6D1F]/90 text-[#FAF3E1] shadow-[#FF6D1F]/20"
                        }`}
                      >
                        {isRegistering ? (
                          <span>Enrolling...</span>
                        ) : isRegistered ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Registered ✓</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" />
                            <span>Quick Register</span>
                          </>
                        )}
                      </button>
                    </div>

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
