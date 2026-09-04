import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Award,
  ArrowUpRight,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Layers,
  GraduationCap,
  ChevronRight,
  Globe,
  Video,
  Mail,
  Phone,
  AtSign,
} from "lucide-react";
import { AvatarDisplay } from "@/components/ui/profile-dropdown";
import { User } from "@/types";
import { getRecommendedCourses, CourseCatalogItem } from "@/lib/courseCatalogData";
import {
  getLocalEnrollments,
  removeLocalEnrollment,
} from "@/lib/enrollmentStorage";

interface StudentDashboardProps {
  currentUser?: User | null;
}

export function StudentDashboard({ currentUser }: StudentDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropMessage, setDropMessage] = useState<string | null>(null);

  // GSAP DOM Animation Refs
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const headerCardRef = useRef<HTMLDivElement>(null);
  const kpiRowRef = useRef<HTMLDivElement>(null);
  const nextClassRef = useRef<HTMLDivElement>(null);
  const enrolledGridRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Crosshair Star Refs
  const star1Ref = useRef<HTMLSpanElement>(null);
  const star2Ref = useRef<HTMLSpanElement>(null);
  const star3Ref = useRef<HTMLSpanElement>(null);

  // Counter Refs
  const creditCounterRef = useRef<HTMLSpanElement>(null);
  const gpaCounterRef = useRef<HTMLSpanElement>(null);
  const hoursCounterRef = useRef<HTMLSpanElement>(null);

  const fetchStudentData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userIdentifier = currentUser.id || currentUser.email;
    const localEnrollments = getLocalEnrollments(userIdentifier);
    let remoteEnrollments: any[] = [];
    let remoteUser = currentUser;
    let remoteWaitlists: any[] = [];

    try {
      setLoading(true);
      const res = await fetch(`/api/registration/student/${currentUser.id}`);
      if (res.ok) {
        const json = await res.json();
        remoteEnrollments = json.enrollments || [];
        remoteWaitlists = json.waitlists || [];
        if (json.user) remoteUser = json.user;
      }
    } catch (err) {
      console.warn("Failed to load backend student dashboard data, using local storage:", err);
    } finally {
      // Merge local and remote enrollments smoothly
      const mergedMap = new Map<string, any>();
      localEnrollments.forEach((item) => {
        const code = item.section?.course?.code || item.id;
        mergedMap.set(code, item);
      });
      remoteEnrollments.forEach((item) => {
        const code = item.section?.course?.code || item.id;
        mergedMap.set(code, item);
      });

      const finalEnrollments = Array.from(mergedMap.values());
      const totalCredits = finalEnrollments.reduce(
        (sum, e) => sum + (e.section?.course?.credits || 4),
        0
      );

      setData({
        user: remoteUser,
        enrollments: finalEnrollments,
        waitlists: remoteWaitlists,
        totalRegisteredCredits: totalCredits,
      });

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [currentUser]);

  // GSAP Entrance & Counter Animations
  useEffect(() => {
    if (loading || !data) return;

    const ctx = gsap.context(() => {
      // 1. Crosshair Stars Continuous Rotation
      if (star1Ref.current && star2Ref.current && star3Ref.current) {
        gsap.to([star1Ref.current, star2Ref.current, star3Ref.current], {
          rotation: 360,
          duration: 15,
          repeat: -1,
          ease: "none",
        });
      }

      // 2. Header Entrance
      if (headerCardRef.current) {
        gsap.fromTo(
          headerCardRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }
        );
      }

      // 3. KPI Cards Staggered Reveal
      if (kpiRowRef.current) {
        gsap.fromTo(
          kpiRowRef.current.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
            delay: 0.15,
            ease: "power3.out",
            clearProps: "opacity,transform",
          }
        );
      }

      // 4. Live Animated Counters
      const totalCredits = data?.totalRegisteredCredits || 0;
      if (creditCounterRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: totalCredits,
          duration: 1.2,
          delay: 0.2,
          ease: "power2.out",
          onUpdate: () => {
            if (creditCounterRef.current) {
              creditCounterRef.current.innerText = `${Math.round(obj.val)}`;
            }
          },
        });
      }

      if (gpaCounterRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: 3.88,
          duration: 1.4,
          delay: 0.25,
          ease: "power2.out",
          onUpdate: () => {
            if (gpaCounterRef.current) {
              gpaCounterRef.current.innerText = `${obj.val.toFixed(2)}`;
            }
          },
        });
      }

      if (hoursCounterRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: totalCredits * 1.5,
          duration: 1.2,
          delay: 0.3,
          ease: "power2.out",
          onUpdate: () => {
            if (hoursCounterRef.current) {
              hoursCounterRef.current.innerText = `${obj.val.toFixed(1)}`;
            }
          },
        });
      }

      // 5. Enrolled Courses & Next Class Reveal
      if (enrolledGridRef.current) {
        gsap.fromTo(
          enrolledGridRef.current.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            delay: 0.25,
            ease: "power3.out",
            clearProps: "opacity,transform",
          }
        );
      }

      // 6. Sidebar Reveal
      if (sidebarRef.current) {
        gsap.fromTo(
          sidebarRef.current.children,
          { opacity: 0, x: 20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.65,
            stagger: 0.1,
            delay: 0.3,
            ease: "power3.out",
            clearProps: "opacity,transform",
          }
        );
      }
    }, pageContainerRef);

    return () => ctx.revert();
  }, [loading, data]);

  // Stray Ambient Mouse Spotlight Following Gradient
  const handleMouseMoveDashboard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (pageContainerRef.current && spotlightRef.current) {
      const rect = pageContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(spotlightRef.current, {
        x,
        y,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const handleDrop = async (sectionId: string, courseCode: string) => {
    if (!window.confirm(`Are you sure you want to drop online course ${courseCode}?`)) return;
    try {
      const userIdentifier = currentUser?.id || currentUser?.email || "";
      removeLocalEnrollment(userIdentifier, courseCode);
      removeLocalEnrollment(userIdentifier, sectionId);

      fetch("/api/registration/drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser?.id, sectionId }),
      }).catch((e) => console.warn("Backend drop notice:", e));

      setDropMessage(`Successfully dropped ${courseCode}. Online class schedule updated.`);
      fetchStudentData();
      setTimeout(() => setDropMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] flex flex-col items-center justify-center py-28 select-none">
        <div className="w-12 h-12 border-3 border-[#FF6D1F] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-extrabold text-sm text-[#FAF3E1]/80 uppercase tracking-wider">
          Initializing Academic Workspace...
        </p>
      </div>
    );
  }

  const enrollments = data?.enrollments || [];
  const waitlists = data?.waitlists || [];
  const totalCredits = data?.totalRegisteredCredits || 0;
  const maxCredits = 18;
  const creditPercent = Math.min(100, Math.round((totalCredits / maxCredits) * 100));

  // Get first active course for "Next Upcoming Online Class" widget
  const firstActiveEnrollment = enrollments.length > 0 ? enrollments[0] : null;

  return (
    <div
      ref={pageContainerRef}
      onMouseMove={handleMouseMoveDashboard}
      className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] px-4 sm:px-6 lg:px-8 py-8 space-y-7 text-left select-none font-sans relative overflow-hidden"
    >
      {/* ✦ ARCHITECTURAL BLUEPRINT GRID & NEBULA BACKGROUND ✦ */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute bottom-20 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 left-12 sm:left-24 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 right-12 sm:right-24 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />
      </div>

      {/* Rotating Blueprint Star Crosshairs */}
      <div className="absolute top-20 right-32 pointer-events-none z-0 opacity-40">
        <span ref={star1Ref} className="inline-block text-[#FF6D1F] text-lg font-serif">✦</span>
      </div>
      <div className="absolute bottom-32 left-16 pointer-events-none z-0 opacity-30">
        <span ref={star2Ref} className="inline-block text-[#F5E7C6] text-xl font-serif">✦</span>
      </div>
      <div className="absolute top-1/2 right-12 pointer-events-none z-0 opacity-30">
        <span ref={star3Ref} className="inline-block text-[#FF6D1F] text-sm font-serif">✦</span>
      </div>

      {/* Atmospheric Ambient Glowing Nebulae */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#FF6D1F]/12 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[450px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[300px] bg-amber-500/8 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Dynamic Stray Ambient Mouse Cursor Gradient Follower */}
      <div
        ref={spotlightRef}
        className="absolute top-0 left-0 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#FF6D1F]/20 via-amber-500/15 to-purple-600/15 rounded-full blur-[150px] pointer-events-none z-0"
      />

      <div className="max-w-7xl mx-auto space-y-7 relative z-10">
        
        {/* 1. EXECUTIVE STUDENT PROFILE BANNER (Dark Obsidian Glass) */}
        <div
          ref={headerCardRef}
          className="bg-[#121216]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden transition-all hover:border-[#FF6D1F]/40"
        >
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#FF6D1F]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <AvatarDisplay user={currentUser} size="w-16 h-16 sm:w-20 sm:h-20 text-3xl shadow-xl border-2 border-[#FAF3E1]/20" />
            
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Term • Fall 2026
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1A1A22] border border-[#F5E7C6]/20 text-[11px] font-bold text-[#FAF3E1]/80">
                  ID: {currentUser?.studentId || "STU-2026-001"}
                </span>
                {currentUser?.username && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[11px] font-mono font-bold text-[#FF6D1F]">
                    {currentUser.username.startsWith("@") ? currentUser.username : `@${currentUser.username}`}
                  </span>
                )}
                {currentUser?.plan && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[11px] font-bold text-purple-300 uppercase">
                    {currentUser.plan === "yearly" ? "★ Annual Pro" : currentUser.plan === "monthly" ? "★ Monthly Scholar" : "Standard"}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#FAF3E1] tracking-tight">
                Welcome back, {currentUser?.name || "Student"}!
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#FAF3E1]/70 font-medium">
                {currentUser?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#FF6D1F]" />
                    <span className="text-[#FAF3E1]/90">{currentUser.email}</span>
                  </div>
                )}
                {currentUser?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#FF6D1F]" />
                    <span>{currentUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#FF6D1F]" />
                  <span>Major: <strong className="text-[#FAF3E1] font-bold">{currentUser?.major || "Computer Science & Engineering"}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#FF6D1F]" />
                  <span>{currentUser?.university || "Indian Institute of Technology (IIT) Kharagpur"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <Link
              to="/catalog"
              className="px-5 py-2.5 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-[#FF6D1F]/25 active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Course Catalog</span>
            </Link>
            <Link
              to="/performance"
              className="px-5 py-2.5 rounded-xl bg-[#1A1A22] hover:bg-[#252530] border border-[#F5E7C6]/20 text-[#FAF3E1] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <TrendingUp className="w-4 h-4 text-[#FF6D1F]" />
              <span>Performance Tracker</span>
            </Link>
          </div>
        </div>

        {/* 2. TOP 4 EXECUTIVE KPI METRICS ROW (Dark Titanium Glass) */}
        <div ref={kpiRowRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Registered Credits */}
          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg flex flex-col justify-between transition-all hover:border-[#FF6D1F]/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#FAF3E1]/60 uppercase tracking-wider">Registered Credits</span>
              <div className="w-8 h-8 rounded-xl bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 flex items-center justify-center text-[#FF6D1F]">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span ref={creditCounterRef} className="text-3xl font-black text-[#FAF3E1]">
                  {totalCredits}
                </span>
                <span className="text-sm font-extrabold text-[#FAF3E1]/50">/ {maxCredits} max</span>
              </div>

              {/* Dark Credit Progress Bar */}
              <div className="w-full bg-[#1C1C24] h-2 rounded-full overflow-hidden mt-3 border border-[#F5E7C6]/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    totalCredits >= 16 ? "bg-rose-600" : "bg-gradient-to-r from-[#FF6D1F] to-amber-400"
                  }`}
                  style={{ width: `${creditPercent}%` }}
                />
              </div>
            </div>

            <span className="text-[11px] font-bold text-[#FAF3E1]/60 mt-2.5">
              {Math.max(0, maxCredits - totalCredits)} credit slots available
            </span>
          </div>

          {/* KPI 2: Academic Standing / GPA */}
          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg flex flex-col justify-between transition-all hover:border-emerald-500/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#FAF3E1]/60 uppercase tracking-wider">Cumulative GPA</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span ref={gpaCounterRef} className="text-3xl font-black text-emerald-400">
                  3.88
                </span>
                <span className="text-sm font-extrabold text-[#FAF3E1]/50">/ 4.00</span>
              </div>
              <div className="inline-flex items-center gap-1 mt-2 text-xs font-black text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Dean's Honor Roll
              </div>
            </div>

            <span className="text-[11px] font-bold text-[#FAF3E1]/60 mt-2.5">
              Top 5% of Department
            </span>
          </div>

          {/* KPI 3: Weekly Online Class Hours */}
          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg flex flex-col justify-between transition-all hover:border-indigo-500/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#FAF3E1]/60 uppercase tracking-wider">Weekly Online Hours</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span ref={hoursCounterRef} className="text-3xl font-black text-[#FAF3E1]">
                  {(totalCredits * 1.5).toFixed(1)}
                </span>
                <span className="text-sm font-extrabold text-[#FAF3E1]/50">hrs/week</span>
              </div>
              <div className="inline-flex items-center gap-1 mt-2 text-xs font-black text-indigo-300 bg-indigo-950/70 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3 text-indigo-400" /> 100% Course Attendance
              </div>
            </div>

            <span className="text-[11px] font-bold text-[#FAF3E1]/60 mt-2.5">
              Self-Paced & Live Lectures
            </span>
          </div>

          {/* KPI 4: Active Enrollments & Waitlists */}
          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg flex flex-col justify-between transition-all hover:border-purple-500/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#FAF3E1]/60 uppercase tracking-wider">Course Status</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#FAF3E1]">
                  {enrollments.length}
                </span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Enrolled
                </span>
              </div>
              <div className="text-xs font-bold text-[#FAF3E1]/80 mt-2">
                {waitlists.length > 0 ? (
                  <span className="text-[#FF6D1F] font-black">{waitlists.length} Waitlist Queue Active</span>
                ) : (
                  <span className="text-emerald-400 font-bold">✓ All Modules Confirmed</span>
                )}
              </div>
            </div>

            <span className="text-[11px] font-bold text-[#FAF3E1]/60 mt-2.5">
              Auto-promotion active
            </span>
          </div>

        </div>

        {/* Alert Notification Toast */}
        {dropMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3 font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{dropMessage}</span>
          </div>
        )}

        {/* 3. "NEXT UPCOMING ONLINE CLASS" TODAY AGENDA BANNER */}
        {firstActiveEnrollment && (
          <div
            ref={nextClassRef}
            className="bg-gradient-to-r from-[#16161E] via-[#1E1E28] to-[#16161E] text-[#FAF3E1] p-6 rounded-3xl border border-[#FF6D1F]/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#FF6D1F]/60"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6D1F]/20 border border-[#FF6D1F]/40 flex items-center justify-center text-[#FF6D1F] flex-shrink-0 shadow-lg shadow-[#FF6D1F]/20">
                <Video className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#FF6D1F] font-black uppercase tracking-wider mb-1">
                  <span>// NEXT LIVE SESSION</span>
                  <span>•</span>
                  <span>{firstActiveEnrollment.section.slots?.[0]?.day || "Mon"} {firstActiveEnrollment.section.slots?.[0]?.startTime || "10:00 AM"}</span>
                </div>
                <h3 className="text-lg font-black text-[#FAF3E1]">
                  {firstActiveEnrollment.section.course.code}: {firstActiveEnrollment.section.course.title}
                </h3>
                <p className="text-xs text-[#FAF3E1]/70 mt-0.5">
                  Instructor: <span className="text-[#FAF3E1] font-bold">{firstActiveEnrollment.section.instructor?.name || "Faculty Assigned"}</span> • Mode: <span className="text-[#FF6D1F] font-bold">100% Online Interactive Lecture</span>
                </p>
              </div>
            </div>

            <Link
              to="/catalog"
              className="px-5 py-2.5 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF6D1F]/30 active:scale-95 self-start md:self-auto cursor-pointer"
            >
              <span>Explore Course Modules</span>
              <ArrowUpRight className="w-4 h-4 text-[#FAF3E1]" />
            </Link>
          </div>
        )}

        {/* ✦ STREAM-ADJACENT RECOMMENDED COURSES ✦ */}
        {(() => {
          const studentStream = currentUser?.major || currentUser?.customOnboarding?.major || "Computer Science & Engineering";
          const recommended = getRecommendedCourses(studentStream).slice(0, 3);
          return (
            <div className="bg-[#121218] border border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF6D1F]" />
                    <h3 className="font-black text-[#FAF3E1] text-base">
                      Curriculum Recommended for Your Stream
                    </h3>
                  </div>
                  <p className="text-xs text-[#FAF3E1]/60 mt-0.5">
                    Tailored core and interdisciplinary adjacent electives for <strong>{studentStream}</strong>.
                  </p>
                </div>

                <Link
                  to="/catalog"
                  className="text-xs font-black text-[#FF6D1F] hover:text-amber-400 flex items-center gap-1 self-start sm:self-auto group"
                >
                  <span>View All Stream Electives</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommended.map((c) => (
                  <Link
                    key={c.id}
                    to="/catalog"
                    className="p-4 rounded-2xl bg-[#181822] hover:bg-[#1E1E2C] border border-white/10 hover:border-[#FF6D1F]/50 transition-all flex flex-col justify-between group space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#FF6D1F]/20 text-[#FF6D1F]">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-bold text-[#FAF3E1]/60 px-2 py-0.5 rounded bg-white/5">
                          {c.credits} Credits
                        </span>
                      </div>
                      <h4 className="font-black text-xs text-[#FAF3E1] group-hover:text-[#FF6D1F] transition-colors line-clamp-1">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-[#FAF3E1]/60 line-clamp-2 mt-1">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#FAF3E1]/60">
                      <span>Prof. {c.instructor.name.split(" ").slice(-1)[0]}</span>
                      <span className="font-bold text-[#FF6D1F] flex items-center gap-1 group-hover:underline">
                        Explore <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 4. MAIN WORKSPACE SPLIT (Enrolled Courses vs. Waitlists & Tools) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Enrolled Courses Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between border-b border-[#F5E7C6]/15 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-[#FAF3E1] flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#FF6D1F]" />
                Enrolled Online Courses ({enrollments.length})
              </h2>
              <Link
                to="/catalog"
                className="text-xs font-bold text-[#FF6D1F] hover:text-amber-400 flex items-center gap-1 group"
              >
                <span>Add Courses</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="bg-[#121216]/90 backdrop-blur-xl p-10 rounded-3xl text-center text-[#FAF3E1]/70 border border-[#F5E7C6]/15 shadow-xl space-y-4">
                <BookOpen className="w-14 h-14 text-[#FAF3E1]/20 mx-auto" />
                <h3 className="font-black text-lg text-[#FAF3E1]">No courses registered yet</h3>
                <p className="text-xs text-[#FAF3E1]/60 max-w-md mx-auto">
                  Your academic profile has no active enrollments. Browse the online course catalog to enroll in accredited modules.
                </p>
                <Link
                  to="/catalog"
                  className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] text-xs font-black uppercase tracking-wider shadow-lg shadow-[#FF6D1F]/25 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  Browse Course Catalog
                </Link>
              </div>
            ) : (
              <div ref={enrolledGridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrollments.map((item: any) => {
                  const section = item.section;
                  const course = section.course;
                  return (
                    <div
                      key={item.id}
                      className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg hover:border-[#FF6D1F] transition-all flex flex-col justify-between group relative"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] font-mono text-xs font-black">
                            {course.code}
                          </span>
                          <span className="text-xs font-bold text-[#FAF3E1]/80 bg-[#1A1A22] border border-[#F5E7C6]/20 px-2.5 py-0.5 rounded-md">
                            {course.credits} Credits
                          </span>
                        </div>

                        <h3 className="font-black text-[#FAF3E1] text-base group-hover:text-[#FF6D1F] transition-colors leading-snug">
                          {course.title}
                        </h3>
                        
                        <p className="text-[#FAF3E1]/70 text-xs mt-2 leading-relaxed line-clamp-2">
                          {course.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-[#F5E7C6]/10 space-y-2 text-xs text-[#FAF3E1] font-medium">
                          <div className="flex items-center gap-2 text-[#FAF3E1]/70">
                            <UserCheck className="w-4 h-4 text-[#FAF3E1]/50 flex-shrink-0" />
                            <span>Instructor: <strong className="text-[#FAF3E1]">{section.instructor?.name || "Faculty Assigned"}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold">
                            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Online Virtual Classroom & HD Recordings</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 flex items-center justify-between border-t border-[#F5E7C6]/10">
                        <span className="text-[11px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Enrolled
                        </span>
                        <button
                          onClick={() => handleDrop(section.id, course.code)}
                          className="text-xs text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-bold cursor-pointer"
                          title={`Drop ${course.code}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Drop
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Column: Waitlists & Performance Quick View */}
          <div ref={sidebarRef} className="space-y-6">
            
            {/* Performance Analytics Quick Widget */}
            <div className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-lg bg-gradient-to-br from-[#121216] to-[#181822] transition-all hover:border-[#FF6D1F]/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 flex items-center justify-center text-[#FF6D1F]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-[#FAF3E1] text-sm">Academic Performance</h3>
                  <p className="text-xs text-[#FAF3E1]/60 font-medium">Real-time credit & telemetry tracking</p>
                </div>
              </div>

              <p className="text-xs text-[#FAF3E1]/70 leading-relaxed font-medium">
                View course progress, registered credit load, consistency score, and degree progression metrics.
              </p>

              <Link
                to="/performance"
                className="w-full py-2.5 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#FF6D1F]/25 cursor-pointer active:scale-95"
              >
                <span>Open Performance Hub</span>
                <ArrowUpRight className="w-4 h-4 text-[#FAF3E1]" />
              </Link>
            </div>

            {/* Active Waitlists Section */}
            <div className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-lg space-y-4 transition-all hover:border-[#FF6D1F]/50">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-[#FAF3E1] text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6D1F]" />
                  Active Waitlists ({waitlists.length})
                </h3>
                <span className="text-[10px] font-black text-[#FF6D1F] uppercase tracking-wider">Auto-Fill</span>
              </div>

              {waitlists.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#FAF3E1]/60 font-medium">
                  <ShieldCheck className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                  No active waitlist queues. All enrolled courses are confirmed.
                </div>
              ) : (
                <div className="space-y-3">
                  {waitlists.map((w: any) => (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-2xl bg-[#181822] border border-[#F5E7C6]/10 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-black text-[#FAF3E1] text-xs">
                          {w.section.course.code}: {w.section.course.title}
                        </div>
                        <span className="text-[11px] text-[#FAF3E1]/60 font-medium">
                          Instructor: {w.section.instructor?.name || "Faculty Assigned"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FF6D1F]/20 border border-[#FF6D1F]/30 text-[#FF6D1F] font-black text-xs">
                          Queue #{w.position}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Academic Advising Support Box */}
            <div className="p-5 rounded-2xl bg-[#121216]/90 backdrop-blur-xl border border-[#F5E7C6]/15 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-black text-[#FAF3E1]">
                <Sparkles className="w-4 h-4 text-[#FF6D1F]" />
                <span>Faculty Mentorship & Support</span>
              </div>
              <p className="text-[#FAF3E1]/70 text-[11px] font-medium leading-relaxed">
                Need assistance with course modules or degree progression? Connect directly with faculty instructors via the instructor directory.
              </p>
              <Link
                to="/instructor"
                className="inline-flex items-center gap-1 text-[#FF6D1F] hover:text-amber-400 font-bold text-xs pt-1"
              >
                <span>Explore Faculty Directory</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
