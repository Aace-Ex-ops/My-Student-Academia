import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { UserCheck, BookOpen, Users, Clock, Globe, Sparkles, Video } from "lucide-react";
import { User } from "@/types";

interface InstructorPageProps {
  currentUser?: User | null;
}

export function InstructorPage({ currentUser }: InstructorPageProps) {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    fetchInstructorData();
  }, [currentUser]);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/instructor/${currentUser?.id}/sections`);
      const json = await res.json();
      setSections(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] flex flex-col items-center justify-center py-28 select-none">
        <div className="w-10 h-10 border-3 border-[#FF6D1F] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-extrabold text-xs uppercase tracking-wider text-[#FAF3E1]/80">Loading faculty portal...</p>
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
      </div>

      <div className="absolute top-14 right-20 pointer-events-none z-0 opacity-40">
        <span ref={starRef} className="inline-block text-[#FF6D1F] text-xl font-serif">✦</span>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Welcome Banner */}
        <div className="bg-[#121216]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Faculty Directory & Course Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FAF3E1] tracking-tight">
              {currentUser?.name || "Faculty Member"}
            </h1>
            <p className="text-[#FAF3E1]/70 text-xs sm:text-sm mt-1 font-medium">
              Assigned Online Lecture Sections, Rosters & Live Stream Controls
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#1A1A22] border border-[#F5E7C6]/15 px-5 py-3 rounded-2xl shadow-md">
            <BookOpen className="w-5 h-5 text-[#FF6D1F]" />
            <div className="text-xs">
              <span className="text-[#FAF3E1]/60 block font-bold">Teaching Load</span>
              <span className="font-black text-[#FAF3E1] text-sm">{sections.length} Active Course Sections</span>
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-[#FAF3E1] flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-[#FF6D1F]" />
            <span>Assigned Course Sections ({sections.length})</span>
          </h2>

          {sections.length === 0 ? (
            <div className="bg-[#121216]/90 backdrop-blur-xl p-10 text-center text-[#FAF3E1]/60 rounded-3xl border border-[#F5E7C6]/15">
              No active course sections currently assigned.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl space-y-6"
                >
                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F5E7C6]/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FF6D1F]/20 border border-[#FF6D1F]/30 text-[#FF6D1F] font-mono text-xs font-black">
                          {sec.course.code}
                        </span>
                        <h3 className="font-black text-[#FAF3E1] text-lg">
                          {sec.course.title} (Sec {sec.sectionNumber})
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#FAF3E1]/70 mt-1.5 font-medium">
                        <Video className="w-3.5 h-3.5 text-[#FF6D1F]" />
                        <span>Delivery: Live Stream Lectures & Mentorship</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Online Interactive Hub
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3.5 py-1.5 rounded-xl bg-[#1A1A22] border border-[#F5E7C6]/15 text-xs font-bold text-[#FAF3E1]">
                        Enrolled: {sec.enrollments.length} / {sec.maxCapacity} Seats
                      </span>
                      <span className="px-3.5 py-1.5 rounded-xl bg-[#FF6D1F]/20 border border-[#FF6D1F]/30 text-xs font-black text-[#FF6D1F]">
                        Waitlisted: {sec.waitlists.length}
                      </span>
                    </div>
                  </div>

                  {/* Enrolled Students Roster */}
                  <div>
                    <h4 className="font-black text-sm text-[#FAF3E1] mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#FF6D1F]" />
                      <span>Enrolled Student Roster ({sec.enrollments.length})</span>
                    </h4>

                    {sec.enrollments.length === 0 ? (
                      <p className="text-xs text-[#FAF3E1]/50 italic">No students currently enrolled in this section.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {sec.enrollments.map((e: any) => (
                          <div
                            key={e.id}
                            className="p-3 rounded-2xl bg-[#1A1A22] border border-[#F5E7C6]/10 flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-xl bg-[#FF6D1F]/20 border border-[#FF6D1F]/30 text-[#FF6D1F] flex items-center justify-center font-black text-xs">
                              {e.user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-[#FAF3E1]">{e.user.name}</div>
                              <div className="text-[11px] text-[#FAF3E1]/60 font-mono">{e.user.studentId || e.user.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
