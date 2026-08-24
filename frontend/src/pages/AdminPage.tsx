import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Plus, BookOpen, Users, Award, Clock, Sparkles } from "lucide-react";
import { User } from "@/types";

interface AdminPageProps {
  currentUser?: User | null;
}

export function AdminPage({ currentUser }: AdminPageProps) {
  const [stats, setStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("4");
  const [departmentId, setDepartmentId] = useState("");
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, deptRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/courses/departments"),
      ]);
      const statsJson = await statsRes.json();
      const deptJson = await deptRes.json();
      setStats(statsJson);
      setDepartments(deptJson);
      if (deptJson.length > 0) setDepartmentId(deptJson[0].id);
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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title || !description) return;

    try {
      const res = await fetch("/api/admin/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, title, description, credits, departmentId }),
      });
      const json = await res.json();
      if (res.ok) {
        setFormMsg(`Successfully created online course ${json.code}!`);
        setCode("");
        setTitle("");
        setDescription("");
        fetchAdminData();
        setTimeout(() => setFormMsg(null), 4000);
      } else {
        alert(json.error || "Failed to create course");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] flex flex-col items-center justify-center py-28 select-none">
        <div className="w-10 h-10 border-3 border-[#FF6D1F] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-extrabold text-xs uppercase tracking-wider text-[#FAF3E1]/80">Loading admin portal...</p>
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
        
        {/* Header */}
        <div className="bg-[#121216]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Control & Course Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FAF3E1] tracking-tight">
              Academic Administration Hub
            </h1>
            <p className="text-[#FAF3E1]/70 text-xs sm:text-sm mt-1 font-medium">
              Administrator: <strong className="text-[#FF6D1F]">{currentUser?.name || "Admin"}</strong>
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-xs text-emerald-300 font-bold flex items-center gap-2 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Registration Engine Active</span>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
              <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1">Total Students</div>
              <div className="text-2xl font-black text-[#FAF3E1]">{stats.totalStudents}</div>
            </div>
            <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
              <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1">Total Courses</div>
              <div className="text-2xl font-black text-[#FF6D1F]">{stats.totalCourses}</div>
            </div>
            <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
              <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1">Active Enrollments</div>
              <div className="text-2xl font-black text-emerald-400">{stats.totalEnrollments}</div>
            </div>
            <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg">
              <div className="text-xs text-[#FAF3E1]/60 font-bold uppercase tracking-wider mb-1">Waitlist Applicants</div>
              <div className="text-2xl font-black text-amber-400">{stats.totalWaitlisted}</div>
            </div>
          </div>
        )}

        {/* Add New Course Form */}
        <div className="bg-[#121216]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl space-y-6">
          <h2 className="text-xl font-black text-[#FAF3E1] flex items-center gap-2.5">
            <Plus className="w-5 h-5 text-[#FF6D1F]" />
            <span>Create New Course Offering</span>
          </h2>

          {formMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              {formMsg}
            </div>
          )}

          <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#FAF3E1]/70 mb-1.5 uppercase tracking-wider">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CS401"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#1A1A22] border border-[#F5E7C6]/15 rounded-xl px-4 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-[#FF6D1F] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#FAF3E1]/70 mb-1.5 uppercase tracking-wider">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full bg-[#1A1A22] border border-[#F5E7C6]/15 rounded-xl px-4 py-2.5 text-xs text-[#FAF3E1] focus:outline-none focus:border-[#FF6D1F] transition-colors"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#FAF3E1]/70 mb-1.5 uppercase tracking-wider">Course Title</label>
              <input
                type="text"
                placeholder="e.g. Cloud Computing & Distributed Systems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1A1A22] border border-[#F5E7C6]/15 rounded-xl px-4 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-[#FF6D1F] transition-colors"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#FAF3E1]/70 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea
                rows={3}
                placeholder="Course summary, learning objectives, and live session breakdown..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#1A1A22] border border-[#F5E7C6]/15 rounded-xl px-4 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-[#FF6D1F] transition-colors"
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FF6D1F]/25 cursor-pointer active:scale-95"
              >
                Create Online Course
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
