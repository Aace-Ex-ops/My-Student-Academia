import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { UserCheck, BookOpen, Users, Clock, Globe, Sparkles, Video, Mail, Calendar } from "lucide-react";
import { User } from "@/types";
import { getLocalEnrollments } from "@/lib/enrollmentStorage";
import { EXPANDED_COURSE_CATALOG } from "@/lib/courseCatalogData";

interface InstructorPageProps {
  currentUser?: User | null;
}

export function InstructorPage({ currentUser }: InstructorPageProps) {
  const navigate = useNavigate();
  const [sections, setSections] = useState<any[]>([]);
  const [studentFaculty, setStudentFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);

  const isInstructor = currentUser?.role === "INSTRUCTOR" || currentUser?.role === "faculty";

  const fetchStudentFacultyData = async () => {
    try {
      setLoading(true);
      
      // 1. Gather from local storage for current user ID & email
      let localEnrId = getLocalEnrollments(currentUser?.id);
      let localEnrEmail = getLocalEnrollments(currentUser?.email);
      let allEnrollments: any[] = [...localEnrId, ...localEnrEmail];

      // 2. Scan all storage keys as aggressive fallback
      try {
        const raw = localStorage.getItem("msa_user_enrollments_registry");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            allEnrollments = [...allEnrollments, ...parsed];
          } else if (typeof parsed === 'object') {
            Object.values(parsed).forEach((arr: any) => {
              if (Array.isArray(arr)) allEnrollments = [...allEnrollments, ...arr];
            });
          }
        }
      } catch (e) {
        console.warn(e);
      }

      // 3. Remote API fetch if currentUser has an ID
      if (currentUser?.id) {
        try {
          const res = await fetch(`/api/registration/student/${currentUser.id}`);
          if (res.ok) {
            const json = await res.json();
            if (json.enrollments && Array.isArray(json.enrollments)) {
              allEnrollments = [...allEnrollments, ...json.enrollments];
            }
          }
        } catch (e) {
          console.warn("Backend student fetch notice:", e);
        }
      }

      // Deduplicate enrollments by course code or id
      const uniqueEnrollments = new Map<string, any>();
      allEnrollments.forEach((e) => {
        const key = e?.section?.course?.code || e?.section?.courseId || e?.course?.code || e?.code || e?.id;
        if (key && !uniqueEnrollments.has(key)) {
          uniqueEnrollments.set(key, e);
        }
      });

      const enrollmentsToProcess = Array.from(uniqueEnrollments.values());

      const facultyMap = new Map();

      enrollmentsToProcess.forEach((e: any, idx: number) => {
        let course = e?.section?.course || e?.course || (e?.code ? e : null) || { code: e?.id || `C-${idx}`, title: "Enrolled Course" };
        let courseCode = course.code || course.id || "";
        
        // Find matching course from EXPANDED_COURSE_CATALOG for rich details if available
        const catalogMatch = EXPANDED_COURSE_CATALOG.find(
          (c) => c.code.toLowerCase() === courseCode.toLowerCase() || c.id.toLowerCase() === courseCode.toLowerCase()
        );

        if (catalogMatch) {
          course = { ...catalogMatch, ...course };
        }

        let instructor = e?.section?.instructor || e?.instructor || course?.instructor || catalogMatch?.instructor;

        let instructorName = "Faculty Member";
        let title = "Professor";
        let avatar = "";

        if (typeof instructor === "string" && instructor.trim() && instructor !== "Faculty Assigned") {
          instructorName = instructor;
        } else if (instructor && typeof instructor === "object") {
          if (instructor.name && instructor.name !== "Faculty Assigned") {
            instructorName = instructor.name;
          }
          if (instructor.title) title = instructor.title;
          if (instructor.avatar) avatar = instructor.avatar;
        }

        // Fallback to catalog match instructor if name is generic
        if ((instructorName === "Faculty Member" || instructorName === "Faculty Assigned") && catalogMatch?.instructor) {
          instructorName = catalogMatch.instructor.name || instructorName;
          title = catalogMatch.instructor.title || title;
          avatar = catalogMatch.instructor.avatar || avatar;
        }

        if (!facultyMap.has(instructorName)) {
          facultyMap.set(instructorName, {
            name: instructorName,
            title: title || "Professor",
            avatar: avatar,
            courses: [course]
          });
        } else {
          const existing = facultyMap.get(instructorName);
          if (!existing.courses.find((c: any) => c.code === course.code)) {
            existing.courses.push(course);
          }
        }
      });

      setStudentFaculty(Array.from(facultyMap.values()));
    } catch (err) {
      console.error("Failed to load student faculty data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInstructor) {
      fetchInstructorData();
    } else {
      fetchStudentFacultyData();
    }
  }, [currentUser, isInstructor]);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/instructor/${currentUser?.id}/sections`);
      if (res.ok) {
        const json = await res.json();
        setSections(json);
      } else {
        setSections([]);
      }
    } catch (err) {
      console.warn("Instructor fetch notice:", err);
      setSections([]);
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
        <p className="font-extrabold text-xs uppercase tracking-wider text-[#FAF3E1]/80">Loading portal...</p>
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
              <span>{isInstructor ? "Faculty Directory & Course Management" : "My Enrolled Faculty"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FAF3E1] tracking-tight">
              {isInstructor ? currentUser?.name || "Faculty Member" : "Available Faculty"}
            </h1>
            <p className="text-[#FAF3E1]/70 text-xs sm:text-sm mt-1 font-medium">
              {isInstructor 
                ? "Assigned Online Lecture Sections, Rosters & Live Stream Controls"
                : "Connect with the instructors leading your registered courses."}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#1A1A22] border border-[#F5E7C6]/15 px-5 py-3 rounded-2xl shadow-md">
            <BookOpen className="w-5 h-5 text-[#FF6D1F]" />
            <div className="text-xs">
              <span className="text-[#FAF3E1]/60 block font-bold">
                {isInstructor ? "Teaching Load" : "Registered Faculty"}
              </span>
              <span className="font-black text-[#FAF3E1] text-sm">
                {isInstructor ? `${sections.length} Active Course Sections` : `${studentFaculty.length} Instructors`}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Content based on Role */}
        <div className="space-y-6">
          {isInstructor ? (
            <>
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
                              {sec.course?.code}
                            </span>
                            <h3 className="font-black text-[#FAF3E1] text-lg">
                              {sec.course?.title} (Sec {sec.sectionNumber})
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
                            Enrolled: {sec.enrollments?.length || 0} / {sec.maxCapacity || 50} Seats
                          </span>
                          <span className="px-3.5 py-1.5 rounded-xl bg-[#FF6D1F]/20 border border-[#FF6D1F]/30 text-xs font-black text-[#FF6D1F]">
                            Waitlisted: {sec.waitlists?.length || 0}
                          </span>
                        </div>
                      </div>

                      {/* Enrolled Students Roster */}
                      <div>
                        <h4 className="font-black text-sm text-[#FAF3E1] mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#FF6D1F]" />
                          <span>Enrolled Student Roster ({sec.enrollments?.length || 0})</span>
                        </h4>

                        {!sec.enrollments || sec.enrollments.length === 0 ? (
                          <p className="text-xs text-[#FAF3E1]/50 italic">No students currently enrolled in this section.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {sec.enrollments.map((e: any) => (
                              <div
                                key={e.id}
                                className="p-3 rounded-2xl bg-[#1A1A22] border border-[#F5E7C6]/10 flex items-center gap-3"
                              >
                                <div className="w-8 h-8 rounded-xl bg-[#FF6D1F]/20 border border-[#FF6D1F]/30 text-[#FF6D1F] flex items-center justify-center font-black text-xs">
                                  {e.user?.name?.charAt(0) || "S"}
                                </div>
                                <div>
                                  <div className="font-bold text-xs text-[#FAF3E1]">{e.user?.name || "Student"}</div>
                                  <div className="text-[11px] text-[#FAF3E1]/60 font-mono">{e.user?.studentId || e.user?.email || "Unknown"}</div>
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
            </>
          ) : (
            <>
              {/* STUDENT VIEW OF FACULTY */}
              <h2 className="text-xl font-black text-[#FAF3E1] flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-[#FF6D1F]" />
                <span>Your Teaching Faculty ({studentFaculty.length})</span>
              </h2>

              {studentFaculty.length === 0 ? (
                <div className="bg-[#121216]/90 backdrop-blur-xl p-10 text-center rounded-3xl border border-[#F5E7C6]/15 shadow-lg flex flex-col items-center">
                  <UserCheck className="w-12 h-12 text-[#FAF3E1]/20 mb-4" />
                  <h3 className="text-lg font-black text-[#FAF3E1] mb-1">No Faculty Assigned Yet</h3>
                  <p className="text-sm text-[#FAF3E1]/60">
                    You have not registered for any courses. Head to the Course Catalog to enroll in classes and meet your professors.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentFaculty.map((faculty, idx) => (
                    <div
                      key={idx}
                      className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl flex flex-col h-full hover:border-[#FF6D1F]/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4 mb-5">
                        {faculty.avatar ? (
                          <img
                            src={faculty.avatar}
                            alt={faculty.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FF6D1F]/30 group-hover:border-[#FF6D1F] transition-colors"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-[#FF6D1F]/20 border-2 border-[#FF6D1F]/30 text-[#FF6D1F] flex items-center justify-center font-black text-xl group-hover:border-[#FF6D1F] transition-colors">
                            {faculty.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-black text-[#FAF3E1] text-lg leading-tight">{faculty.name}</h3>
                          <p className="text-xs font-bold text-[#FF6D1F] mt-0.5">{faculty.title || "Professor"}</p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="text-[11px] font-bold text-[#FAF3E1]/50 uppercase tracking-wider mb-2">Teaching You In:</div>
                        {faculty.courses.map((c: any, i: number) => {
                          const safeCode = c.code || "CS101";
                          const safeTitle = c.title || "Unknown Course";
                          return (
                          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1A1A22] border border-[#F5E7C6]/5">
                            <span className="w-8 h-8 rounded-lg bg-[#FF6D1F]/10 border border-[#FF6D1F]/20 text-[#FF6D1F] flex items-center justify-center text-[10px] font-black font-mono">
                              {safeCode.split(" ")[0] || safeCode.substring(0, 2)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-[#FAF3E1] text-xs truncate">{safeTitle}</div>
                              <div className="text-[10px] text-[#FAF3E1]/50 font-mono mt-0.5">{safeCode}</div>
                            </div>
                          </div>
                        )})}
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#F5E7C6]/10 flex items-center gap-2">
                        <button className="flex-1 py-2 rounded-xl bg-[#1A1A22] hover:bg-[#FF6D1F]/10 text-[#FAF3E1]/70 hover:text-[#FF6D1F] border border-[#F5E7C6]/10 hover:border-[#FF6D1F]/30 transition-colors text-[11px] font-bold flex items-center justify-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> Message
                        </button>
                        <button className="flex-1 py-2 rounded-xl bg-[#1A1A22] hover:bg-[#FF6D1F]/10 text-[#FAF3E1]/70 hover:text-[#FF6D1F] border border-[#F5E7C6]/10 hover:border-[#FF6D1F]/30 transition-colors text-[11px] font-bold flex items-center justify-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Schedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Debug info (development only) */}
          <div className="hidden">
            Debug: {studentFaculty.length} | {currentUser?.id} | {currentUser?.email} 
          </div>
        </div>

      </div>
    </div>
  );
}
