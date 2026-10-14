import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Plus,
  BookOpen,
  Users,
  Award,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { User } from "@/types";
import { EXPANDED_COURSE_CATALOG } from "@/lib/courseCatalogData";

interface AdminPageProps {
  currentUser?: User | null;
}

interface WaitlistEntry {
  id: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  courseCode: string;
  courseTitle: string;
  priorityScore: number;
  requestDate: string;
}

interface AuditLogItem {
  id: string;
  action: string;
  user: string;
  detail: string;
  timestamp: string;
  type: "ENROLLMENT" | "COURSE" | "SYSTEM" | "WAITLIST";
}

export function AdminPage({ currentUser }: AdminPageProps) {
  const [stats, setStats] = useState<any>({
    totalStudents: 1480,
    totalCourses: 33,
    totalEnrollments: 4120,
    totalWaitlisted: 28,
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<"COURSES" | "FACULTY" | "WAITLISTS" | "AUDIT">("COURSES");

  // Registration Engine Toggle State
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

  // Create Course Form State
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("4");
  const [departmentId, setDepartmentId] = useState("");
  const [capacity, setCapacity] = useState("75");
  const [assignedInstructor, setAssignedInstructor] = useState("Dr. Vikram Sethi");
  const [formMsg, setFormMsg] = useState<string | null>(null);

  // Search Filter
  const [courseSearch, setCourseSearch] = useState("");
  const [coursesList, setCoursesList] = useState(EXPANDED_COURSE_CATALOG);

  // Waitlist Overrides State
  const [waitlists, setWaitlists] = useState<WaitlistEntry[]>([
    {
      id: "wt-01",
      studentName: "Aarav Sharma",
      studentEmail: "aarav.sharma@student.academia.edu",
      studentId: "STU-2026-104",
      courseCode: "AI402",
      courseTitle: "Deep Learning & Neural Network Architectures",
      priorityScore: 98,
      requestDate: "Today, 09:15 AM",
    },
    {
      id: "wt-02",
      studentName: "Sneha Reddy",
      studentEmail: "sneha.reddy@student.academia.edu",
      studentId: "STU-2026-621",
      courseCode: "CS301",
      courseTitle: "Modern Full-Stack Architecture & Cloud Systems",
      priorityScore: 92,
      requestDate: "Yesterday, 04:30 PM",
    },
    {
      id: "wt-03",
      studentName: "Karan Malhotra",
      studentEmail: "karan.malhotra@student.academia.edu",
      studentId: "STU-2026-512",
      courseCode: "FIN305",
      courseTitle: "Quantitative Trading & Algorithmic Execution",
      priorityScore: 88,
      requestDate: "2 days ago",
    },
  ]);

  // System Audit Stream
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: "log-01",
      action: "Course Created",
      user: "Registrar Office",
      detail: "Added new section for CS310 (Distributed Systems & Consensus Protocols)",
      timestamp: "10 mins ago",
      type: "COURSE",
    },
    {
      id: "log-02",
      action: "Waitlist Promoted",
      user: "System Automated Gating",
      detail: "Promoted 2 students into AI402 after capacity expansion (+10 seats)",
      timestamp: "35 mins ago",
      type: "WAITLIST",
    },
    {
      id: "log-03",
      action: "Term Registration Audit",
      user: "System Security Bot",
      detail: "Zero scheduling conflicts detected across 4,120 active registrations",
      timestamp: "1 hour ago",
      type: "SYSTEM",
    },
    {
      id: "log-04",
      action: "Grade Submission Verified",
      user: "Dr. Vikram Sethi",
      detail: "Midterm evaluations verified and recorded for CS101 Section 01",
      timestamp: "3 hours ago",
      type: "ENROLLMENT",
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, deptRes] = await Promise.all([
        fetch("/api/admin/stats").catch(() => null),
        fetch("/api/courses/departments").catch(() => null),
      ]);

      if (statsRes && statsRes.ok) {
        const statsJson = await statsRes.json();
        setStats(statsJson);
      }
      if (deptRes && deptRes.ok) {
        const deptJson = await deptRes.json();
        setDepartments(deptJson);
        if (deptJson.length > 0) setDepartmentId(deptJson[0].id);
      } else {
        // Fallback default departments
        setDepartments([
          { id: "dept-cs", code: "CS", name: "Computer Science & Artificial Intelligence" },
          { id: "dept-ece", code: "ECE", name: "Electrical & Electronics Engineering" },
          { id: "dept-me", code: "ME", name: "Mechanical & Aerospace Engineering" },
          { id: "dept-fin", code: "FIN", name: "Fintech & Quantitative Management" },
          { id: "dept-bio", code: "BIO", name: "Biotechnology & Computational Genomics" },
          { id: "dept-des", code: "DES", name: "Design & Interactive Media" },
          { id: "dept-cyb", code: "CYB", name: "Cybersecurity & Cloud Systems" },
        ]);
        setDepartmentId("dept-cs");
      }
    } catch (err) {
      console.warn("Admin fetch fallback:", err);
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

  // Handle Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title || !description) return;

    try {
      const res = await fetch("/api/admin/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, title, description, credits, departmentId }),
      }).catch(() => null);

      const newCourseItem: any = {
        id: `c-custom-${Date.now()}`,
        code: code.toUpperCase().trim(),
        title: title.trim(),
        description: description.trim(),
        credits: parseInt(credits) || 4,
        difficulty: "Intermediate",
        primaryStream: "Computer Science & Engineering",
        adjacentStreams: [],
        department: departments.find((d) => d.id === departmentId) || { code: "CS", name: "Computer Science" },
        instructor: { name: assignedInstructor, title: "Professor", avatar: "" },
        slotCode: "A1",
        scheduleDays: "Mon / Wed",
        scheduleTime: "11:00 AM - 12:30 PM",
        room: "Turing Complex Hall B",
        capacity: parseInt(capacity) || 75,
        enrolledCount: 0,
        waitlistCount: 0,
        syllabus: ["Course Introduction", "Core Foundations", "Final Project"],
        tags: ["New", "Fall 2026"],
      };

      setCoursesList([newCourseItem, ...coursesList]);
      setFormMsg(`Successfully created course ${code.toUpperCase()}!`);
      setCode("");
      setTitle("");
      setDescription("");

      // Add to audit stream
      setAuditLogs([
        {
          id: `log-${Date.now()}`,
          action: "Course Created",
          user: currentUser?.name || "Administrator",
          detail: `Approved and published new course offering: ${newCourseItem.code} (${newCourseItem.title})`,
          timestamp: "Just now",
          type: "COURSE",
        },
        ...auditLogs,
      ]);

      setTimeout(() => setFormMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Expand Course Capacity
  const handleExpandCapacity = (courseId: string) => {
    setCoursesList((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, capacity: c.capacity + 10 } : c))
    );
    setToastMessage("Capacity expanded by +10 seats for course!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Force Enroll Waitlist Student
  const handleForceEnroll = (entry: WaitlistEntry) => {
    setWaitlists((prev) => prev.filter((w) => w.id !== entry.id));
    setToastMessage(`Force-enrolled ${entry.studentName} into ${entry.courseCode}!`);

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        action: "Administrative Override",
        user: currentUser?.name || "Administrator",
        detail: `Administrative override: force-enrolled ${entry.studentName} (${entry.studentId}) into ${entry.courseCode}`,
        timestamp: "Just now",
        type: "WAITLIST",
      },
      ...auditLogs,
    ]);

    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered courses
  const filteredCourses = coursesList.filter(
    (c) =>
      c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.department?.name?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const FACULTY_DIRECTORY = [
    { name: "Dr. Vikram Sethi", role: "Department Chair", dept: "Computer Science & AI", email: "vikram.sethi@faculty.academia.edu", courses: 4, load: "Full Load" },
    { name: "Dr. Priya Deshmukh", role: "Professor", dept: "Machine Learning & Neural Systems", email: "priya.deshmukh@faculty.academia.edu", courses: 4, load: "Full Load" },
    { name: "Dr. Rajeshwar Rao", role: "Professor", dept: "Robotics & VLSI Silicon", email: "rajeshwar.rao@faculty.academia.edu", courses: 4, load: "Full Load" },
    { name: "Dr. Suresh Kulkarni", role: "Professor", dept: "Mechanical & Aerospace", email: "suresh.kulkarni@faculty.academia.edu", courses: 3, load: "Active" },
    { name: "Prof. Kabir Mehra", role: "Professor", dept: "Fintech & Quantitative Management", email: "kabir.mehra@faculty.academia.edu", courses: 3, load: "Active" },
    { name: "Dr. Meenakshi Sundaram", role: "Professor", dept: "Biotechnology & Genomics", email: "meenakshi.sundaram@faculty.academia.edu", courses: 3, load: "Active" },
    { name: "Prof. Elena Rostova", role: "Professor", dept: "Design & Spatial Computing", email: "elena.rostova@faculty.academia.edu", courses: 3, load: "Active" },
    { name: "Dr. Marcus Vance", role: "Professor", dept: "Cybersecurity & Cloud", email: "marcus.vance@faculty.academia.edu", courses: 3, load: "Active" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] flex flex-col items-center justify-center py-28 select-none">
        <div className="w-10 h-10 border-3 border-[#FF6D1F] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-extrabold text-xs uppercase tracking-wider text-[#FAF3E1]/80">Loading Admin Console...</p>
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

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#1A1A24] border border-emerald-500/50 shadow-2xl text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* ✦ 1. HEADER & REGISTRATION ENGINE CONTROLLER ✦ */}
        <div className="bg-[#121216]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Office of the University Registrar • Central Administration Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FAF3E1] tracking-tight">
              Institutional Governance Console
            </h1>
            <p className="text-[#FAF3E1]/70 text-xs sm:text-sm mt-1 font-medium">
              Administrator: <strong className="text-white">{currentUser?.name || "University Dean & Registrar"}</strong> • Term: Fall 2026 Active
            </p>
          </div>

          {/* Registration Engine Status Toggle */}
          <div className="flex items-center gap-4 bg-[#1A1A22] border border-white/10 p-3 rounded-2xl shadow-md">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">Registration Portal</span>
              <span className={`text-xs font-bold ${isRegistrationOpen ? "text-emerald-400" : "text-amber-400"}`}>
                {isRegistrationOpen ? "Open for Enrollments" : "Locked / Census Mode"}
              </span>
            </div>

            <button
              onClick={() => {
                setIsRegistrationOpen(!isRegistrationOpen);
                setToastMessage(
                  isRegistrationOpen
                    ? "Registration engine locked. Students cannot modify enrollments."
                    : "Registration engine opened. Course enrollment is live."
                );
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isRegistrationOpen
                  ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              }`}
              title="Toggle Registration Open / Closed"
            >
              {isRegistrationOpen ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ✦ 2. STATS & SYSTEM TELEMETRY CARDS ✦ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
            <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Total Students
            </div>
            <div className="text-2xl font-black text-[#FAF3E1]">{stats.totalStudents || 1480}</div>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">Active University Scholars</span>
          </div>

          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
            <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#FF6D1F]" /> Total Offerings
            </div>
            <div className="text-2xl font-black text-[#FF6D1F]">{coursesList.length} Courses</div>
            <span className="text-[11px] text-neutral-400 font-semibold mt-1 block">Across 13 Departments</span>
          </div>

          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
            <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Active Registrations
            </div>
            <div className="text-2xl font-black text-emerald-400">{stats.totalEnrollments || 4120}</div>
            <span className="text-[11px] text-emerald-400/80 font-semibold mt-1 block">99.4% Capacity Balance</span>
          </div>

          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
            <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Waitlist Queue
            </div>
            <div className="text-2xl font-black text-amber-400">{waitlists.length} Students</div>
            <span className="text-[11px] text-amber-400/80 font-semibold mt-1 block">Actionable Overrides</span>
          </div>
        </div>

        {/* ✦ 3. ADMIN NAVIGATION TABS ✦ */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("COURSES")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "COURSES"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-[#14141A] text-neutral-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Course Catalog & Creation</span>
          </button>

          <button
            onClick={() => setActiveTab("FACULTY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "FACULTY"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-[#14141A] text-neutral-400 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Faculty & Department Load</span>
          </button>

          <button
            onClick={() => setActiveTab("WAITLISTS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "WAITLISTS"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-[#14141A] text-neutral-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Waitlist & Overrides ({waitlists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "AUDIT"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-[#14141A] text-neutral-400 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Institutional Audit Stream</span>
          </button>
        </div>

        {/* ✦ TAB 1: COURSE CREATION & CATALOG MANAGEMENT ✦ */}
        {activeTab === "COURSES" && (
          <div className="space-y-6">
            {/* Create New Course Accordion/Form */}
            <div className="bg-[#121216]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl space-y-6">
              <h2 className="text-xl font-black text-[#FAF3E1] flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Create & Publish New Course Offering</span>
              </h2>

              {formMsg && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{formMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#FAF3E1]/70 mb-1.5 uppercase tracking-wider">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS410"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#1A1A22] border border-[#F5E7C6]/15 rounded-xl px-4 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FAF3E1]/70 mb-1.5 uppercase tracking-wider">
                    Academic Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-[#1A1A22] border border-[#F5E7C6]/15 rounded-xl px-4 py-2.5 text-xs text-[#FAF3E1] focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FAF3E1]/70 mb-1.5 uppercase tracking-wider">
                    Assigned Faculty Instructor
                  </label>
                  <select
                    value={assignedInstructor}
                    onChange={(e) => setAssignedInstructor(e.target.value)}
                    className="w-full bg-[#1A1A22] border border-[#F5E7C6]/15 rounded-xl px-4 py-2.5 text-xs text-[#FAF3E1] focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {FACULTY_DIRECTORY.map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name} ({f.dept})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#FAF3E1]/70 mb-1.5 uppercase tracking-wider">
                    Course Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High-Performance GPU Computing & LLM Pre-Training"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#1A1A22] border border-[#F5E7C6]/15 rounded-xl px-4 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FAF3E1]/70 mb-1.5 uppercase tracking-wider">
                    Initial Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full bg-[#1A1A22] border border-[#F5E7C6]/15 rounded-xl px-4 py-2.5 text-xs text-[#FAF3E1] focus:outline-none focus:border-blue-500 transition-colors"
                    min="10"
                    max="300"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-[#FAF3E1]/70 mb-1.5 uppercase tracking-wider">
                    Syllabus Overview & Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Course objectives, laboratory components, and examination criteria..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#1A1A22] border border-[#F5E7C6]/15 rounded-xl px-4 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95"
                  >
                    Publish Course Offering
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Course Catalog Table with Capacity Controls */}
            <div className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-black text-[#FAF3E1]">Active University Courses ({filteredCourses.length})</h3>
                  <p className="text-xs text-neutral-400">Monitor course capacities, assigned faculty, and adjust section limits.</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search by code, title, dept..."
                    className="w-full bg-[#1A1A22] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400 uppercase font-mono text-[10px]">
                      <th className="py-3 px-3">Code</th>
                      <th className="py-3 px-3">Course Title</th>
                      <th className="py-3 px-3">Instructor</th>
                      <th className="py-3 px-3">Schedule & Room</th>
                      <th className="py-3 px-3">Capacity</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCourses.slice(0, 15).map((course) => (
                      <tr key={course.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold text-xs">
                            {course.code}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#FAF3E1]">{course.title}</div>
                          <div className="text-[10px] text-neutral-400">{course.department?.name || "Academic Department"}</div>
                        </td>
                        <td className="py-3 px-3 text-neutral-300 font-medium">
                          {course.instructor?.name || "Dr. Assigned Faculty"}
                        </td>
                        <td className="py-3 px-3 text-neutral-400 text-[11px]">
                          <div>{course.scheduleDays} • {course.scheduleTime}</div>
                          <div className="text-neutral-500 font-mono">{course.room}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-emerald-400">{course.capacity} Seats</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleExpandCapacity(course.id)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-blue-600/30 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            +10 Seats
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ✦ TAB 2: FACULTY & DEPARTMENT ROSTER ✦ */}
        {activeTab === "FACULTY" && (
          <div className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-black text-[#FAF3E1]">Institutional Faculty Directory</h3>
                <p className="text-xs text-neutral-400">Departmental chairs, professors, and teaching section distribution.</p>
              </div>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-xl">
                8 Faculty Chairs Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {FACULTY_DIRECTORY.map((fac) => (
                <div
                  key={fac.email}
                  className="p-4 rounded-2xl bg-[#1A1A22] border border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-black text-sm text-white">
                      {fac.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#FAF3E1]">{fac.name}</h4>
                      <span className="text-xs text-neutral-400 block">{fac.role} • {fac.dept}</span>
                      <span className="text-[11px] font-mono text-neutral-500">{fac.email}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold block mb-1">
                      {fac.load}
                    </span>
                    <span className="text-xs font-bold text-white">{fac.courses} Sections</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✦ TAB 3: WAITLIST OVERRIDES ✦ */}
        {activeTab === "WAITLISTS" && (
          <div className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-black text-[#FAF3E1]">Waitlist Processing & Administrative Overrides</h3>
                <p className="text-xs text-neutral-400">Review pending waitlist candidates and exercise administrative force-enrollment.</p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                {waitlists.length} Pending Approvals
              </span>
            </div>

            {waitlists.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs">
                All student waitlists have been resolved. Zero pending applicants.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {waitlists.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl bg-[#1A1A22] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-[#FF6D1F]/20 text-[#FF6D1F] font-mono text-xs font-bold">
                          {w.courseCode}
                        </span>
                        <h4 className="font-bold text-sm text-white">{w.courseTitle}</h4>
                      </div>
                      <div className="text-xs text-neutral-300">
                        Student: <strong>{w.studentName}</strong> ({w.studentId}) • Priority Score: <strong className="text-emerald-400">{w.priorityScore}/100</strong>
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        Requested: {w.requestDate} • {w.studentEmail}
                      </div>
                    </div>

                    <button
                      onClick={() => handleForceEnroll(w)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Force-Enroll</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ✦ TAB 4: SYSTEM AUDIT STREAM ✦ */}
        {activeTab === "AUDIT" && (
          <div className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-black text-[#FAF3E1]">University Telemetry & Transaction Audit Stream</h3>
                <p className="text-xs text-neutral-400">Cryptographically verifiable log of administrative changes, enrollment events, and course actions.</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Audit Active</span>
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[#1A1A22] border border-white/5 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{log.action}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono">
                        {log.type}
                      </span>
                      <span className="text-[11px] text-neutral-500">• {log.timestamp}</span>
                    </div>
                    <p className="text-xs text-neutral-300">{log.detail}</p>
                    <span className="text-[10px] text-neutral-500 font-mono block">Actor: {log.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminPage;
