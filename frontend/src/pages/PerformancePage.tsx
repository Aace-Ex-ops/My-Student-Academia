import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Activity,
  Zap,
  BarChart3,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Globe,
  Video,
} from "lucide-react";
import { User } from "@/types";
import { getLocalEnrollments } from "@/lib/enrollmentStorage";

interface PerformancePageProps {
  currentUser?: User | null;
}

export function PerformancePage({ currentUser }: PerformancePageProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const kpiRowRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    fetchPerformanceData();
  }, [currentUser]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const userIdentifier = currentUser?.id || currentUser?.email;
      const localEnrollments = getLocalEnrollments(userIdentifier);
      let remoteEnrollments: any[] = [];

      if (currentUser?.id) {
        try {
          const res = await fetch(`/api/registration/student/${currentUser.id}`);
          if (res.ok) {
            const json = await res.json();
            remoteEnrollments = json.enrollments || [];
          }
        } catch (e) {
          console.warn("Backend sync notice:", e);
        }
      }

      const mergedMap = new Map<string, any>();
      localEnrollments.forEach((item) => {
        const code = item.section?.course?.code || item.id;
        mergedMap.set(code, item);
      });
      remoteEnrollments.forEach((item) => {
        const code = item.section?.course?.code || item.id;
        mergedMap.set(code, item);
      });

      const currentEnrollments = Array.from(mergedMap.values());
      setEnrollments(currentEnrollments);

      // Generate activity logs
      const logs: string[] = [];
      logs.push(`Active Student Identity: ${currentUser?.name || "Student"} (${currentUser?.studentId || "STU-2026"})`);
      logs.push(`Current Registered Courses: ${currentEnrollments.length} confirmed online modules.`);

      currentEnrollments.forEach((e: any) => {
        logs.push(`Confirmed Enrollment for ${e.section?.course?.code}: ${e.section?.course?.credits || 4} Credits (${e.section?.course?.title}).`);
      });

      setActivityLogs(logs);
    } catch (err) {
      console.error("Failed to load performance metrics", err);
    } finally {
      setLoading(false);
    }
  };

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

      if (kpiRowRef.current) {
        gsap.fromTo(
          kpiRowRef.current.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "opacity,transform",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading, enrollments]);

  // Metric Calculations
  const totalCredits = enrollments.reduce(
    (sum, e) => sum + (e.section?.course?.credits || 0),
    0
  );

  const calculateConsistencyScore = () => {
    if (totalCredits === 0) return 0;
    if (totalCredits >= 12 && totalCredits <= 18) return 98;
    if (totalCredits < 12) return Math.round((totalCredits / 12) * 85);
    return 90;
  };

  const consistencyScore = calculateConsistencyScore();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] flex flex-col items-center justify-center py-28 select-none">
        <div className="w-10 h-10 border-3 border-[#FF6D1F] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-extrabold text-xs uppercase tracking-wider text-[#FAF3E1]/80">Loading performance analytics...</p>
      </div>
    );
  }

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

      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-[#FF6D1F]/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] bg-emerald-600/10 rounded-full blur-[180px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Progression Telemetry • Fall 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#FAF3E1] flex items-center gap-3 tracking-tight">
              <TrendingUp className="w-8 h-8 text-[#FF6D1F]" />
              Academic Performance Analytics
            </h1>
            <p className="text-[#FAF3E1]/70 text-xs sm:text-sm mt-1 font-medium">
              Real-time telemetry of course load, consistency score, and degree progression for <strong className="text-[#FAF3E1]">{currentUser?.name || "Student"}</strong>.
            </p>
          </div>

          <button
            onClick={fetchPerformanceData}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#121216]/90 border border-[#F5E7C6]/20 hover:border-[#FF6D1F] text-xs font-black text-[#FAF3E1] transition-all shadow-lg cursor-pointer active:scale-95 self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4 text-[#FF6D1F]" />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* Top 4 Performance Metric Cards */}
        <div ref={kpiRowRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Total Enrolled Credits */}
          <div className="bg-[#121216]/90 backdrop-blur-xl border border-[#F5E7C6]/15 rounded-3xl p-6 shadow-xl space-y-3 hover:border-[#FF6D1F]/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#FAF3E1]/60 uppercase tracking-wider">
                Enrolled Credit Load
              </span>
              <div className="p-2.5 rounded-xl bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F]">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#FAF3E1]">{totalCredits}</span>
              <span className="text-xs font-extrabold text-[#FAF3E1]/50">/ 18 Max Credits</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#1C1C24] border border-[#F5E7C6]/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6D1F] to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${(totalCredits / 18) * 100}%` }}
              />
            </div>
          </div>

          {/* Card 2: Cumulative GPA */}
          <div className="bg-[#121216]/90 backdrop-blur-xl border border-[#F5E7C6]/15 rounded-3xl p-6 shadow-xl space-y-3 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#FAF3E1]/60 uppercase tracking-wider">
                Cumulative GPA
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400">3.88</span>
              <span className="text-xs font-extrabold text-[#FAF3E1]/50">/ 4.00</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-300 block">
              Dean's Honor Roll • Top 5%
            </span>
          </div>

          {/* Card 3: Consistency Score */}
          <div className="bg-[#121216]/90 backdrop-blur-xl border border-[#F5E7C6]/15 rounded-3xl p-6 shadow-xl space-y-3 hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#FAF3E1]/60 uppercase tracking-wider">
                Consistency Score
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-400">{consistencyScore}%</span>
              <span className="text-xs font-black text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded">Optimal Load</span>
            </div>
            <span className="text-[11px] font-bold text-[#FAF3E1]/70 block">
              100% Course Attendance Rate
            </span>
          </div>

          {/* Card 4: Enrolled Courses */}
          <div className="bg-[#121216]/90 backdrop-blur-xl border border-[#F5E7C6]/15 rounded-3xl p-6 shadow-xl space-y-3 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#FAF3E1]/60 uppercase tracking-wider">
                Registered Courses
              </span>
              <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#FAF3E1]">{enrollments.length}</span>
              <span className="text-xs font-extrabold text-[#FAF3E1]/50">Active Modules</span>
            </div>
            <span className="text-[11px] font-bold text-[#FAF3E1]/70 block">
              Fall 2026 Academic Term
            </span>
          </div>

        </div>

        {/* Main Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (7 Cols): Enrolled Course Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#121216]/90 backdrop-blur-xl border border-[#F5E7C6]/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-[#FAF3E1] flex items-center gap-2.5">
                  <BarChart3 className="w-5 h-5 text-[#FF6D1F]" />
                  <span>Enrolled Course Load Breakdown</span>
                </h3>
                <p className="text-xs text-[#FAF3E1]/70 font-medium mt-1">
                  Comprehensive overview of all enrolled online academic courses and credit allocations.
                </p>
              </div>

              {enrollments.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#181822] border border-[#F5E7C6]/10 text-center text-xs font-bold text-[#FAF3E1]/50">
                  No active courses enrolled. Register courses in the catalog to build your performance profile!
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((e: any) => (
                    <div
                      key={e.id}
                      className="p-4 rounded-2xl bg-[#181822] border border-[#F5E7C6]/10 space-y-2.5 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#FF6D1F] text-white font-black text-xs">
                            {e.section?.course?.code}
                          </span>
                          <span className="font-bold text-sm text-[#FAF3E1]">
                            {e.section?.course?.title}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#FAF3E1]/80 bg-[#121216] px-2.5 py-1 rounded-xl border border-[#F5E7C6]/15">
                          {e.section?.course?.credits} Credits
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs text-[#FAF3E1]/70">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" /> 100% Online Interactive Module
                        </span>
                        <span>Instructor: <strong className="text-[#FAF3E1]">{e.section?.instructor?.name || "Faculty Assigned"}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 Cols): Live Activity Logs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#121216]/90 backdrop-blur-xl border border-[#F5E7C6]/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
              <h3 className="text-lg font-black text-[#FAF3E1] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#FF6D1F]" />
                <span>Course Activity Audit Trail</span>
              </h3>

              <div className="space-y-3 font-mono text-xs text-[#FAF3E1]">
                {activityLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#181822] border border-[#F5E7C6]/10 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-[#FAF3E1]/90">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
