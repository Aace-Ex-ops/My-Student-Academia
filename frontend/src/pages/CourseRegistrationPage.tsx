import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Globe,
  Video,
  UserCheck,
  Award,
  Check,
} from "lucide-react";
import { User } from "@/types";
import { AlreadyRegisteredRobotModal } from "@/components/ui/AlreadyRegisteredRobotModal";

interface CourseRegistrationPageProps {
  currentUser?: User | null;
}

const getCourseImage = (code: string) => {
  const c = code?.toUpperCase() || "";
  if (c.includes("CS") || c.includes("101")) {
    return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop";
  }
  if (c.includes("AI") || c.includes("402")) {
    return "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1200&auto=format&fit=crop";
  }
  if (c.includes("WEB") || c.includes("301") || c.includes("DEV")) {
    return "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1200&auto=format&fit=crop";
  }
  if (c.includes("FIN") || c.includes("404") || c.includes("BUS")) {
    return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop";
  }
  if (c.includes("EE") || c.includes("201") || c.includes("IOT")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop";
  }
  if (c.includes("SEC") || c.includes("202") || c.includes("CYBER")) {
    return "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop";
  }
  if (c.includes("DES") || c.includes("102") || c.includes("UX")) {
    return "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop";
  }
  return "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop";
};

export function CourseRegistrationPage({ currentUser }: CourseRegistrationPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as { course?: any; section?: any } | undefined;

  const [course, setCourse] = useState<any>(stateData?.course || null);
  const [selectedSection, setSelectedSection] = useState<any>(
    stateData?.section || stateData?.course?.sections?.[0] || null
  );

  const [loading, setLoading] = useState<boolean>(!stateData?.course);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "waitlist"; message: string } | null>(null);
  
  // Registered Courses Status
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState<boolean>(false);
  const [robotModalOpen, setRobotModalOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!currentUser?.id || !course) return;
    fetch(`/api/registration/student/${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.enrollments) {
          const registered = data.enrollments.some(
            (e: any) =>
              e.section?.course?.code === course.code ||
              e.section?.course?.id === course.id
          );
          setIsAlreadyRegistered(registered);
        }
      })
      .catch((err) => console.error(err));
  }, [currentUser, course]);

  useEffect(() => {
    if (!course) {
      fetch("/api/courses")
        .then((res) => res.json())
        .then((coursesList) => {
          if (coursesList.length > 0) {
            const found = coursesList[0];
            setCourse(found);
            setSelectedSection(found.sections?.[0] || null);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [course]);

  useEffect(() => {
    if (starRef.current) {
      gsap.to(starRef.current, {
        rotation: 360,
        duration: 15,
        repeat: -1,
        ease: "none",
      });
    }
  }, []);

  const enrolledCount = selectedSection?._count?.enrollments || 0;
  const waitlistCount = selectedSection?._count?.waitlists || 0;
  const isFull = enrolledCount >= (selectedSection?.maxCapacity || 50);

  const handleConfirmEnrollment = async () => {
    if (!currentUser) {
      setErrorMsg("Please login as a student to register.");
      return;
    }

    if (isAlreadyRegistered) {
      setRobotModalOpen(true);
      return;
    }

    if (!selectedSection) {
      setErrorMsg("Please select a course section.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/registration/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          courseId: course.id,
          sectionId: selectedSection?.id,
        }),
      });

      const json = await res.json();

      if (json.alreadyEnrolled) {
        setIsAlreadyRegistered(true);
        setRobotModalOpen(true);
      } else if (!res.ok) {
        if (json.error?.toLowerCase().includes("already registered") || json.error?.toLowerCase().includes("already enrolled")) {
          setIsAlreadyRegistered(true);
          setRobotModalOpen(true);
        } else {
          setErrorMsg(json.error || "Registration failed.");
        }
      } else {
        setIsAlreadyRegistered(true);
        setFeedback({
          type: "success",
          message: json.message || `Successfully registered for ${course.code}! 🚀`,
        });
      }
    } catch (err) {
      setErrorMsg("Connection error during registration.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0A09] text-[#FAF3E1] select-none">
        <div className="w-10 h-10 border-3 border-[#FF6D1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const coverImg = getCourseImage(course.code);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] selection:bg-[#FF6D1F] selection:text-white font-sans pb-24 relative overflow-hidden select-none"
    >
      {/* ✦ ARCHITECTURAL BLUEPRINT GRID & NEBULA BACKGROUND ✦ */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute bottom-20 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 left-12 sm:left-24 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />
      </div>

      <div className="absolute top-14 right-20 pointer-events-none z-0 opacity-40">
        <span ref={starRef} className="inline-block text-[#FF6D1F] text-xl font-serif">✦</span>
      </div>

      {/* ✦ ANIMATED ROCKET JET ROBOT POPUP MODAL ✦ */}
      <AlreadyRegisteredRobotModal
        isOpen={robotModalOpen}
        onClose={() => setRobotModalOpen(false)}
        course={course}
      />

      {/* Top Header Navigation Bar */}
      <div className="bg-[#0E0E12]/90 backdrop-blur-xl border-b border-[#F5E7C6]/15 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/catalog")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A22] hover:bg-[#252530] border border-[#F5E7C6]/15 text-xs font-black text-[#FAF3E1] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF6D1F]" />
            <span>Back to Course Catalog</span>
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#FAF3E1]/60">
            <span onClick={() => navigate("/catalog")} className="hover:text-[#FF6D1F] cursor-pointer">
              Catalog
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#FF6D1F] font-black">{course.code}</span>
          </div>
        </div>
      </div>

      {/* Hero Cover Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-[#121216] overflow-hidden">
        <img
          src={coverImg}
          alt={course.title}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-[#0B0A09]/70 to-transparent" />

        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left z-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            <span className="bg-[#FF6D1F] text-[#FAF3E1] text-xs font-black px-3.5 py-1.5 rounded-xl shadow-lg shadow-[#FF6D1F]/30">
              {course.code}
            </span>
            {isAlreadyRegistered && (
              <span className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Already Enrolled
              </span>
            )}
            <span className="bg-[#1A1A22]/90 backdrop-blur-md text-[#FAF3E1] text-xs font-extrabold px-3.5 py-1.5 rounded-xl border border-[#F5E7C6]/20 shadow-sm">
              {course.credits} Credits
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#FAF3E1] tracking-tight leading-tight">
            {course.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#FAF3E1]/80 max-w-3xl font-medium mt-1">
            Online Registration • 100% Accredited Virtual Course with Live Mentorship and Capstone Projects.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 relative z-10">
        
        {/* Feedback Success Alert */}
        {feedback && (
          <div className="p-6 rounded-3xl bg-emerald-950/90 border-2 border-emerald-500/50 text-emerald-300 text-sm flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg flex-shrink-0 shadow-lg">
                ✓
              </div>
              <div>
                <h3 className="text-base font-black text-[#FAF3E1]">
                  {feedback.type === "waitlist" ? "Added to Waitlist Queue!" : "Online Course Registration Confirmed!"}
                </h3>
                <p className="font-semibold text-xs mt-0.5 text-emerald-300">{feedback.message}</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-lg cursor-pointer whitespace-nowrap active:scale-95"
            >
              Go to Student Dashboard →
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SECTION 1: SECTION SELECTION & ENROLLMENT ACTION */}
        <div className="bg-[#121216]/90 backdrop-blur-xl border border-[#F5E7C6]/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5E7C6]/15 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-xs font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Available Course Sections</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#FAF3E1]">
                Choose Section for {course.code}
              </h2>
              <p className="text-xs text-[#FAF3E1]/70 font-medium mt-0.5">
                Select your assigned faculty instructor and confirm instant online registration.
              </p>
            </div>
          </div>

          {/* Section Choice Cards */}
          {course.sections && course.sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.sections.map((sec: any) => {
                const secEnrolled = sec._count?.enrollments || 0;
                const secWaitlisted = sec._count?.waitlists || 0;
                const secFull = secEnrolled >= (sec.maxCapacity || 50);
                const isSelected = selectedSection?.id === sec.id;

                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSection(sec)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "bg-[#1A1A26] border-[#FF6D1F] shadow-xl shadow-[#FF6D1F]/15 scale-[1.01]"
                        : "bg-[#16161E] border-[#F5E7C6]/15 hover:border-[#FF6D1F]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FF6D1F]/20 text-[#FF6D1F] font-mono text-xs font-black">
                          Section {sec.sectionNumber}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> Online Mode
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg ${
                          secFull
                            ? "bg-rose-950/80 text-rose-300 border border-rose-500/30"
                            : "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {secEnrolled}/{sec.maxCapacity} {secFull ? `(Waitlist #${secWaitlisted + 1})` : "Seats"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#FAF3E1]">
                      <div className="flex items-center gap-2 text-[#FAF3E1]/80 font-semibold">
                        <UserCheck className="w-4 h-4 text-[#FF6D1F]" />
                        <span>Faculty Instructor: <strong className="text-[#FAF3E1]">{sec.instructor?.name || "Faculty Assigned"}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-[#FAF3E1]/60 text-[11px]">
                        <Video className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Live Stream Sessions + On-Demand HD Recordings</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[#FAF3E1]/50">No sections currently opened for this course.</p>
          )}

          {/* Action Bar */}
          <div className="p-5 rounded-2xl bg-[#1A1A22] border border-[#F5E7C6]/15 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3 text-xs font-bold text-[#FAF3E1]">
              <div className="w-10 h-10 rounded-xl bg-[#FF6D1F] text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#FF6D1F]/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#FF6D1F] uppercase tracking-wider block">
                  Registration Summary
                </span>
                <span className="font-bold text-sm text-[#FAF3E1]">
                  {course.code} • Section {selectedSection?.sectionNumber || 1} • {course.credits} Credits
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmEnrollment}
              disabled={submitting}
              className={`px-8 py-3.5 rounded-2xl font-black text-xs transition-all shadow-xl flex items-center gap-2 cursor-pointer ${
                isAlreadyRegistered
                  ? "bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-950/50 hover:scale-105"
                  : submitting
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  : isFull
                  ? "bg-[#252530] hover:bg-[#303040] text-[#FAF3E1]"
                  : "bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] shadow-[#FF6D1F]/30 hover:scale-105 active:scale-95"
              }`}
            >
              {isAlreadyRegistered ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  <span>Already Registered</span>
                </>
              ) : submitting ? (
                "Processing Registration..."
              ) : isFull ? (
                <>
                  <Sparkles className="w-4 h-4 text-[#FF6D1F]" />
                  <span>Join Waitlist Queue</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FAF3E1]" />
                  <span>Confirm Online Enrollment</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* SECTION 2: COURSE DETAILS & SYLLABUS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          
          {/* Syllabus Card */}
          <div className="bg-[#121216]/90 backdrop-blur-xl border border-[#F5E7C6]/15 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <h3 className="text-base font-black text-[#FAF3E1] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FF6D1F]" />
              <span>Syllabus & Course Objectives</span>
            </h3>
            <p className="text-xs text-[#FAF3E1]/70 leading-relaxed font-medium">
              {course.description ||
                "In-depth theoretical foundations, weekly programming assignments, and interactive lab sessions. Students will develop real-world software modules and present capstone design projects."}
            </p>

            <div className="pt-3 border-t border-[#F5E7C6]/10 flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <Globe className="w-4 h-4" />
              <span>100% Online Interactive Virtual Classroom • HD Lecture Recordings Available</span>
            </div>
          </div>

          {/* Seat Capacity Bar */}
          <div className="bg-[#121216]/90 backdrop-blur-xl border border-[#F5E7C6]/15 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-[#FAF3E1]">
              <span>Section Capacity</span>
              <span className={isFull ? "text-rose-400 font-black" : "text-emerald-400 font-black"}>
                {enrolledCount} / {selectedSection?.maxCapacity || 50} Seats Filled{" "}
                {isFull && `(Waitlist Queue #${waitlistCount + 1})`}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-[#1C1C24] border border-[#F5E7C6]/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull ? "bg-rose-500" : "bg-gradient-to-r from-[#FF6D1F] to-amber-400"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (enrolledCount / (selectedSection?.maxCapacity || 50)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
