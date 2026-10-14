import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  UserCheck,
  BookOpen,
  Users,
  Clock,
  Globe,
  Sparkles,
  Video,
  Mail,
  Send,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  Bell,
  Radio,
  FileText,
  AlertCircle,
  Plus,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { User } from "@/types";
import { getLocalEnrollments } from "@/lib/enrollmentStorage";
import { EXPANDED_COURSE_CATALOG, CourseCatalogItem } from "@/lib/courseCatalogData";

interface InstructorPageProps {
  currentUser?: User | null;
}

interface StudentGradeRecord {
  id: string;
  name: string;
  email: string;
  studentId: string;
  courseCode: string;
  attendance: number;
  midtermGrade: string;
  quizAverage: number;
  status: "Good Standing" | "Needs Review" | "Honor Roll";
}

interface ClassAnnouncement {
  id: string;
  title: string;
  content: string;
  courseCode: string;
  date: string;
  priority: "Normal" | "Urgent";
}

export function InstructorPage({ currentUser }: InstructorPageProps) {
  const navigate = useNavigate();
  const [sections, setSections] = useState<any[]>([]);
  const [studentFaculty, setStudentFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Faculty Dashboard Tabs
  const [activeFacultyTab, setActiveFacultyTab] = useState<"COURSES" | "GRADEBOOK" | "ANNOUNCEMENTS" | "QUIZZES">("COURSES");

  // Office Hours Status
  const [officeHoursStatus, setOfficeHoursStatus] = useState<"AVAILABLE" | "IN_CLASS" | "OFFLINE">("AVAILABLE");

  // Live Class Roster & Grades State
  const [gradebook, setGradebook] = useState<StudentGradeRecord[]>([
    {
      id: "std-01",
      name: "Aarav Sharma",
      email: "aarav.sharma@student.academia.edu",
      studentId: "STU-2026-104",
      courseCode: "CS101",
      attendance: 96,
      midtermGrade: "A",
      quizAverage: 94,
      status: "Honor Roll",
    },
    {
      id: "std-02",
      name: "Ananya Iyer",
      email: "ananya.iyer@student.academia.edu",
      studentId: "STU-2026-218",
      courseCode: "CS101",
      attendance: 92,
      midtermGrade: "A-",
      quizAverage: 88,
      status: "Good Standing",
    },
    {
      id: "std-03",
      name: "Rohan Varma",
      email: "rohan.varma@student.academia.edu",
      studentId: "STU-2026-342",
      courseCode: "CS201",
      attendance: 84,
      midtermGrade: "B+",
      quizAverage: 82,
      status: "Good Standing",
    },
    {
      id: "std-04",
      name: "Diya Patel",
      email: "diya.patel@student.academia.edu",
      studentId: "STU-2026-409",
      courseCode: "AI402",
      attendance: 98,
      midtermGrade: "A+",
      quizAverage: 99,
      status: "Honor Roll",
    },
    {
      id: "std-05",
      name: "Karan Malhotra",
      email: "karan.malhotra@student.academia.edu",
      studentId: "STU-2026-512",
      courseCode: "AI402",
      attendance: 78,
      midtermGrade: "C+",
      quizAverage: 72,
      status: "Needs Review",
    },
  ]);

  // Announcements State
  const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>([
    {
      id: "ann-01",
      title: "Midterm Examination Review & Study Guide Available",
      content: "The comprehensive review packet for Chapters 1-6 has been uploaded. Please review the algorithm proofs and time complexity exercises prior to Thursday's session.",
      courseCode: "CS101",
      date: "Today, 10:30 AM",
      priority: "Normal",
    },
    {
      id: "ann-02",
      title: "Virtual Office Hours Extended for GPU Cluster Project",
      content: "Due to high demand for project milestone 2, office hours will be extended by 90 minutes tomorrow afternoon from 3:00 PM to 6:30 PM.",
      courseCode: "AI402",
      date: "Yesterday",
      priority: "Urgent",
    },
  ]);

  // New Announcement Form State
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnCourse, setNewAnnCourse] = useState("CS101");
  const [newAnnPriority, setNewAnnPriority] = useState<"Normal" | "Urgent">("Normal");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);

  const effectiveUser = currentUser || (() => {
    try {
      const saved = localStorage.getItem("msa_custom_user_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  })();

  const isInstructor = effectiveUser?.role === "INSTRUCTOR" || effectiveUser?.role === "faculty";

  // Fetch or construct instructor teaching sections
  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      const instructorName = effectiveUser?.name || "Dr. Vikram Sethi";
      const nameParts = instructorName.split(" ");
      const lastName = nameParts[nameParts.length - 1].toLowerCase();

      // Find matching courses from EXPANDED_COURSE_CATALOG
      let matchingCourses = EXPANDED_COURSE_CATALOG.filter((c) =>
        c.instructor?.name?.toLowerCase().includes(lastName)
      );

      // If no specific match, assign computer science / AI core sections
      if (matchingCourses.length === 0) {
        matchingCourses = EXPANDED_COURSE_CATALOG.slice(0, 3);
      }

      const formattedSections = matchingCourses.map((c, idx) => ({
        id: `sec-${c.id}-${idx}`,
        sectionNumber: `0${idx + 1}`,
        maxCapacity: c.capacity || 75,
        room: c.room || "Turing Hall 101",
        course: c,
        enrollments: [
          { id: `enr-1-${idx}`, user: { name: "Aarav Sharma", email: "aarav.sharma@student.academia.edu", studentId: "STU-2026-104" } },
          { id: `enr-2-${idx}`, user: { name: "Ananya Iyer", email: "ananya.iyer@student.academia.edu", studentId: "STU-2026-218" } },
          { id: `enr-3-${idx}`, user: { name: "Rohan Varma", email: "rohan.varma@student.academia.edu", studentId: "STU-2026-342" } },
          { id: `enr-4-${idx}`, user: { name: "Diya Patel", email: "diya.patel@student.academia.edu", studentId: "STU-2026-409" } },
          { id: `enr-5-${idx}`, user: { name: "Karan Malhotra", email: "karan.malhotra@student.academia.edu", studentId: "STU-2026-512" } },
        ],
        waitlists: [
          { id: `wt-1-${idx}`, user: { name: "Sneha Reddy", email: "sneha.reddy@student.academia.edu" } },
        ],
      }));

      setSections(formattedSections);
    } catch (err) {
      console.warn("Instructor load notice:", err);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Student view data
  const fetchStudentFacultyData = async () => {
    try {
      setLoading(true);
      if (!effectiveUser) {
        setStudentFaculty([]);
        return;
      }

      const localEnrId = effectiveUser?.id ? getLocalEnrollments(effectiveUser.id) : [];
      const localEnrEmail = effectiveUser?.email ? getLocalEnrollments(effectiveUser.email) : [];
      let allEnrollments: any[] = [...localEnrId, ...localEnrEmail];

      if (allEnrollments.length === 0) {
        // Fallback: show featured university professors so students can explore
        const featured = [
          {
            name: "Dr. Vikram Sethi",
            title: "Department Chair & Professor of Computer Science",
            email: "vikram.sethi@faculty.academia.edu",
            office: "Turing Complex Suite 402",
            officeHours: "Mon/Wed 2:00 PM - 4:00 PM",
            courses: EXPANDED_COURSE_CATALOG.slice(0, 2),
          },
          {
            name: "Dr. Priya Deshmukh",
            title: "Professor of Artificial Intelligence & Neural Systems",
            email: "priya.deshmukh@faculty.academia.edu",
            office: "Neural Sciences Pavilion 310",
            officeHours: "Tue/Thu 1:30 PM - 3:30 PM",
            courses: EXPANDED_COURSE_CATALOG.slice(2, 4),
          },
          {
            name: "Dr. Rajeshwar Rao",
            title: "Professor of Robotics & VLSI Silicon Architectures",
            email: "rajeshwar.rao@faculty.academia.edu",
            office: "Silicon Systems Lab 102",
            officeHours: "Mon/Fri 10:00 AM - 12:00 PM",
            courses: EXPANDED_COURSE_CATALOG.slice(4, 6),
          },
        ];
        setStudentFaculty(featured);
        return;
      }

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
        const courseCode = (course.code || course.id || "").toString().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

        const catalogMatch = EXPANDED_COURSE_CATALOG.find((c) => {
          const cCodeClean = c.code.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          return cCodeClean === courseCode || (course.title && c.title.toLowerCase() === course.title.toLowerCase());
        });

        if (catalogMatch) {
          course = { ...catalogMatch, ...course };
        }

        const instructor = catalogMatch?.instructor || { name: "Course Professor", title: "Professor", avatar: "" };
        const instructorName = instructor.name || "Dr. Faculty Member";

        if (!facultyMap.has(instructorName)) {
          facultyMap.set(instructorName, {
            name: instructorName,
            title: instructor.title || "Professor",
            email: `${instructorName.toLowerCase().replace(/[^a-z]/g, ".")}@faculty.academia.edu`,
            office: "Academic Complex Hall A",
            officeHours: "Tue/Thu 2:00 PM - 4:00 PM",
            courses: [course],
          });
        } else {
          const existing = facultyMap.get(instructorName);
          if (!existing.courses.find((c: any) => (c.code || c.id) === (course.code || course.id))) {
            existing.courses.push(course);
          }
        }
      });

      setStudentFaculty(Array.from(facultyMap.values()));
    } catch (err) {
      console.error("Failed to load student faculty data:", err);
      setStudentFaculty([]);
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

  // Post Announcement Handler
  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    const newEntry: ClassAnnouncement = {
      id: `ann-${Date.now()}`,
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      courseCode: newAnnCourse,
      date: "Just now",
      priority: newAnnPriority,
    };

    setAnnouncements([newEntry, ...announcements]);
    setNewAnnTitle("");
    setNewAnnContent("");
    setToastMessage("Announcement published successfully to enrolled students!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update Grade Action
  const handleUpdateGrade = (studentId: string, newGrade: string) => {
    setGradebook((prev) =>
      prev.map((rec) => (rec.studentId === studentId ? { ...rec, midtermGrade: newGrade } : rec))
    );
    setToastMessage(`Grade updated to ${newGrade} for student.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] flex flex-col items-center justify-center py-28 select-none">
        <div className="w-10 h-10 border-3 border-[#FF6D1F] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-extrabold text-xs uppercase tracking-wider text-[#FAF3E1]/80">Loading Faculty Portal...</p>
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

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#1A1A24] border border-emerald-500/50 shadow-2xl text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* ✦ 1. WELCOME & FACULTY STATUS HEADER ✦ */}
        <div className="bg-[#121216]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isInstructor ? "Faculty & Instructor Academic Suite" : "Enrolled Faculty Directory"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FAF3E1] tracking-tight">
              {isInstructor ? effectiveUser?.name || "Professor Dashboard" : "Available Faculty"}
            </h1>
            <p className="text-[#FAF3E1]/70 text-xs sm:text-sm mt-1 font-medium">
              {isInstructor
                ? "Oversee live lecture streams, enrolled student rosters, assignments, and gradebook evaluations."
                : "Connect with the distinguished professors leading your enrolled courses."}
            </p>
          </div>

          {/* Instructor Live Status Toggle / Student Badge */}
          {isInstructor ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#1A1A22] border border-[#F5E7C6]/15 p-2 rounded-2xl shadow-md">
              <span className="text-xs text-[#FAF3E1]/70 px-2 font-bold">Office Hours:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOfficeHoursStatus("AVAILABLE")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    officeHoursStatus === "AVAILABLE"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Available Now</span>
                </button>

                <button
                  onClick={() => setOfficeHoursStatus("IN_CLASS")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    officeHoursStatus === "IN_CLASS"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>In Lecture</span>
                </button>

                <button
                  onClick={() => setOfficeHoursStatus("OFFLINE")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    officeHoursStatus === "OFFLINE"
                      ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Away</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-[#1A1A22] border border-[#F5E7C6]/15 px-5 py-3 rounded-2xl shadow-md">
              <BookOpen className="w-5 h-5 text-[#FF6D1F]" />
              <div className="text-xs">
                <span className="text-[#FAF3E1]/60 block font-bold">Registered Faculty</span>
                <span className="font-black text-[#FAF3E1] text-sm">{studentFaculty.length} Instructors</span>
              </div>
            </div>
          )}
        </div>

        {/* ✦ INSTRUCTOR DASHBOARD VIEW ✦ */}
        {isInstructor ? (
          <div className="space-y-6">
            {/* Top KPI Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
                <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#FF6D1F]" /> Active Sections
                </div>
                <div className="text-2xl font-black text-[#FAF3E1]">{sections.length} Courses</div>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">Full-time Faculty Load</span>
              </div>

              <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
                <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" /> Total Students
                </div>
                <div className="text-2xl font-black text-[#FAF3E1]">142 Scholars</div>
                <span className="text-[11px] text-neutral-400 font-semibold mt-1 block">94% Attendance Avg</span>
              </div>

              <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
                <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Class GPA Average
                </div>
                <div className="text-2xl font-black text-emerald-400">3.74 / 4.00</div>
                <span className="text-[11px] text-emerald-400/80 font-semibold mt-1 block">Top 10% University Rank</span>
              </div>

              <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
                <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Quizzes Evaluated
                </div>
                <div className="text-2xl font-black text-amber-400">100% Graded</div>
                <span className="text-[11px] text-neutral-400 font-semibold mt-1 block">Instant Auto-Evaluation</span>
              </div>
            </div>

            {/* Faculty Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveFacultyTab("COURSES")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeFacultyTab === "COURSES"
                    ? "bg-[#FF6D1F] text-white shadow-md shadow-[#FF6D1F]/30"
                    : "bg-[#14141A] text-neutral-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>My Courses ({sections.length})</span>
              </button>

              <button
                onClick={() => setActiveFacultyTab("GRADEBOOK")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeFacultyTab === "GRADEBOOK"
                    ? "bg-[#FF6D1F] text-white shadow-md shadow-[#FF6D1F]/30"
                    : "bg-[#14141A] text-neutral-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Student Gradebook & Roster</span>
              </button>

              <button
                onClick={() => setActiveFacultyTab("ANNOUNCEMENTS")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeFacultyTab === "ANNOUNCEMENTS"
                    ? "bg-[#FF6D1F] text-white shadow-md shadow-[#FF6D1F]/30"
                    : "bg-[#14141A] text-neutral-400 hover:text-white"
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Announcements ({announcements.length})</span>
              </button>

              <button
                onClick={() => setActiveFacultyTab("QUIZZES")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeFacultyTab === "QUIZZES"
                    ? "bg-[#FF6D1F] text-white shadow-md shadow-[#FF6D1F]/30"
                    : "bg-[#14141A] text-neutral-400 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Course Quizzes Review</span>
              </button>
            </div>

            {/* TAB 1: ASSIGNED COURSES */}
            {activeFacultyTab === "COURSES" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl flex flex-col justify-between space-y-5 group hover:border-[#FF6D1F]/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="px-3 py-1 rounded-xl bg-[#FF6D1F]/20 border border-[#FF6D1F]/40 text-[#FF6D1F] font-mono text-xs font-black">
                          {sec.course?.code}
                        </span>
                        <span className="text-xs font-bold text-neutral-400">
                          Section {sec.sectionNumber} • {sec.course?.credits || 4} Credits
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-[#FAF3E1] group-hover:text-[#FF6D1F] transition-colors">
                        {sec.course?.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                        {sec.course?.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-neutral-300">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#FF6D1F]" />
                            {sec.course?.scheduleDays || "Mon / Wed"} • {sec.course?.scheduleTime || "10:00 AM - 11:30 AM"}
                          </span>
                          <span className="font-mono text-neutral-400">{sec.room}</span>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px] text-neutral-400">
                            <span>Enrollment: <strong>{sec.enrollments?.length * 15 || 48}</strong> / {sec.maxCapacity}</span>
                            <span className="text-emerald-400 font-bold">Seats Open</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#FF6D1F] to-emerald-400 rounded-full" style={{ width: "68%" }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setToastMessage(`Virtual lecture room launched for ${sec.course?.code}!`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-xs font-black text-white flex items-center justify-center gap-1.5 shadow-md shadow-[#FF6D1F]/25 transition-all cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Start Live Session</span>
                      </button>

                      <button
                        onClick={() => setActiveFacultyTab("GRADEBOOK")}
                        className="px-4 py-2.5 rounded-xl bg-[#1A1A22] hover:bg-[#252532] border border-white/10 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
                      >
                        View Roster
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: STUDENT GRADEBOOK & ROSTER */}
            {activeFacultyTab === "GRADEBOOK" && (
              <div className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-black text-[#FAF3E1]">Enrolled Student Roster & Evaluation Matrix</h3>
                    <p className="text-xs text-neutral-400">Update student grades, review attendance metrics, and monitor academic honors.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                    Evaluation Cycle Active
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-neutral-400 uppercase font-mono text-[10px]">
                        <th className="py-3 px-3">Student Name</th>
                        <th className="py-3 px-3">Course</th>
                        <th className="py-3 px-3">Attendance</th>
                        <th className="py-3 px-3">Quiz Avg</th>
                        <th className="py-3 px-3">Current Grade</th>
                        <th className="py-3 px-3">Academic Standing</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {gradebook.map((std) => (
                        <tr key={std.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#FAF3E1]">{std.name}</div>
                            <div className="text-[10px] text-neutral-500 font-mono">{std.studentId} • {std.email}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-[#FF6D1F]/20 text-[#FF6D1F] font-bold font-mono text-[11px]">
                              {std.courseCode}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-emerald-400">{std.attendance}%</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono text-neutral-300">{std.quizAverage}/100</span>
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={std.midtermGrade}
                              onChange={(e) => handleUpdateGrade(std.studentId, e.target.value)}
                              className="bg-[#1A1A22] border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-[#FF6D1F] focus:outline-none cursor-pointer"
                            >
                              {["A+", "A", "A-", "B+", "B", "B-", "C+", "C"].map((g) => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              std.status === "Honor Roll"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : std.status === "Good Standing"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}>
                              {std.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setToastMessage(`Direct message thread started with ${std.name}`);
                                navigate("/messages");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                            >
                              Message
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ANNOUNCEMENTS */}
            {activeFacultyTab === "ANNOUNCEMENTS" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form to Post */}
                <div className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl space-y-4">
                  <h3 className="text-base font-black text-[#FAF3E1] flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#FF6D1F]" />
                    <span>Post Class Announcement</span>
                  </h3>

                  <form onSubmit={handlePostAnnouncement} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider">
                        Course Section
                      </label>
                      <select
                        value={newAnnCourse}
                        onChange={(e) => setNewAnnCourse(e.target.value)}
                        className="w-full bg-[#1A1A22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6D1F]"
                      >
                        <option value="CS101">CS101 - Computational Thinking</option>
                        <option value="CS201">CS201 - Data Structures</option>
                        <option value="AI402">AI402 - Neural Network Architectures</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider">
                        Announcement Title
                      </label>
                      <input
                        type="text"
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        placeholder="e.g. Schedule Update or Exam Review"
                        className="w-full bg-[#1A1A22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6D1F]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider">
                        Announcement Message
                      </label>
                      <textarea
                        rows={4}
                        value={newAnnContent}
                        onChange={(e) => setNewAnnContent(e.target.value)}
                        placeholder="Type class broadcast message..."
                        className="w-full bg-[#1A1A22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6D1F]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 block mb-1 uppercase tracking-wider">
                        Priority Level
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewAnnPriority("Normal")}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            newAnnPriority === "Normal"
                              ? "bg-white/10 border-white/30 text-white"
                              : "border-white/5 text-neutral-400"
                          }`}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewAnnPriority("Urgent")}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            newAnnPriority === "Urgent"
                              ? "bg-red-500/20 border-red-500/40 text-red-400"
                              : "border-white/5 text-neutral-400"
                          }`}
                        >
                          Urgent Broadcast
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-xs font-black text-white transition-all shadow-md shadow-[#FF6D1F]/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Broadcast to Students</span>
                    </button>
                  </form>
                </div>

                {/* List of Announcements */}
                <div className="lg:col-span-2 space-y-4">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-3xl border border-[#F5E7C6]/15 shadow-lg space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#FF6D1F]/20 text-[#FF6D1F] font-mono text-xs font-bold">
                            {ann.courseCode}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ann.priority === "Urgent"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}>
                            {ann.priority}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400">{ann.date}</span>
                      </div>

                      <h4 className="font-bold text-sm text-[#FAF3E1]">{ann.title}</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: QUIZZES REVIEW */}
            {activeFacultyTab === "QUIZZES" && (
              <div className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-black text-[#FAF3E1]">Course Quizzes & Assessment Oversight</h3>
                    <p className="text-xs text-neutral-400">Review evaluation metrics for quizzes assigned to your courses.</p>
                  </div>
                  <button
                    onClick={() => navigate("/quizzes")}
                    className="px-4 py-2 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-xs font-bold text-white transition-all shadow-md"
                  >
                    Open Quizzes Hub →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#1A1A22] border border-white/10 space-y-2">
                    <span className="text-xs font-bold text-[#FF6D1F] block">CS101 • Computational Thinking</span>
                    <h4 className="text-sm font-bold text-white">Algorithm Complexity & Big-O</h4>
                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/5">
                      <span>Submissions: <strong>48</strong></span>
                      <span className="text-emerald-400 font-bold">Avg: 91.4%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1A22] border border-white/10 space-y-2">
                    <span className="text-xs font-bold text-[#FF6D1F] block">CS201 • Data Structures</span>
                    <h4 className="text-sm font-bold text-white">Self-Balancing Trees & Graphs</h4>
                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/5">
                      <span>Submissions: <strong>42</strong></span>
                      <span className="text-emerald-400 font-bold">Avg: 86.8%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1A1A22] border border-white/10 space-y-2">
                    <span className="text-xs font-bold text-[#FF6D1F] block">AI402 • Neural Architectures</span>
                    <h4 className="text-sm font-bold text-white">Transformer & Self-Attention</h4>
                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/5">
                      <span>Submissions: <strong>52</strong></span>
                      <span className="text-emerald-400 font-bold">Avg: 94.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ✦ STUDENT VIEW OF ENROLLED FACULTY ✦ */
          <div className="space-y-6">
            <h2 className="text-xl font-black text-[#FAF3E1] flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-[#FF6D1F]" />
              <span>Your Faculty Mentors ({studentFaculty.length})</span>
            </h2>

            {studentFaculty.length === 0 ? (
              <div className="bg-[#121216]/90 backdrop-blur-xl p-10 text-center rounded-3xl border border-[#F5E7C6]/15 shadow-lg flex flex-col items-center">
                <UserCheck className="w-12 h-12 text-[#FAF3E1]/20 mb-4" />
                <h3 className="text-lg font-black text-[#FAF3E1] mb-1">No Faculty Assigned Yet</h3>
                <p className="text-sm text-[#FAF3E1]/60">
                  Head to the Course Catalog to register for classes and connect with your professors.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentFaculty.map((faculty, idx) => (
                  <div
                    key={idx}
                    className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl flex flex-col justify-between space-y-5 hover:border-[#FF6D1F]/50 transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E1E28] via-[#FF6D1F] to-[#FF6D1F] flex items-center justify-center font-black text-sm text-[#FAF3E1] shadow-lg shadow-[#FF6D1F]/20 border border-[#FF6D1F]/40 flex-shrink-0">
                          {faculty.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-[#FAF3E1] text-base group-hover:text-[#FF6D1F] transition-colors truncate">
                            {faculty.name}
                          </h3>
                          <span className="text-xs text-[#FAF3E1]/60 block truncate">{faculty.title}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs border-t border-white/10 pt-3">
                        <div className="flex items-center gap-2 text-neutral-300">
                          <Mail className="w-3.5 h-3.5 text-[#FF6D1F]" />
                          <span className="font-mono text-neutral-400 truncate">{faculty.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-300">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Office Hours: <strong>{faculty.officeHours}</strong></span>
                        </div>
                      </div>

                      {faculty.courses && faculty.courses.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                            Courses Taught:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {faculty.courses.map((c: any, cIdx: number) => (
                              <span
                                key={cIdx}
                                className="px-2 py-0.5 rounded-lg bg-[#FF6D1F]/20 text-[#FF6D1F] text-xs font-mono font-bold"
                              >
                                {c.code || c.id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate("/messages")}
                      className="w-full py-2.5 rounded-xl bg-[#1A1A22] hover:bg-[#FF6D1F] text-xs font-bold text-neutral-200 hover:text-white transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Direct Message</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default InstructorPage;
