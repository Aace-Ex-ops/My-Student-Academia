import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  GraduationCap,
  Building2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { SplineRobot } from "@/components/ui/spline-robot";
import { AsciiTextAnimation } from "@/components/ui/ascii-text-animation";
import { User } from "@/types";

interface PortalAuthPageProps {
  currentUser?: User | null;
  onLoginUser?: (user: User) => void;
}

// ✦ PRE-CONFIGURED INSTITUTIONAL DEMO PROFILES ✦
const FACULTY_DEMO_ACCOUNTS: User[] = [
  {
    id: "faculty-sethi-01",
    name: "Dr. Vikram Sethi",
    email: "vikram.sethi@faculty.academia.edu",
    role: "INSTRUCTOR",
    major: "Computer Science & Artificial Intelligence",
    university: "Indian Institute of Technology (IIT) Kharagpur",
    avatar: "Researcher",
    avatarIcon: "🔬",
    avatarBg: "from-amber-600 to-orange-700",
  },
  {
    id: "faculty-deshmukh-02",
    name: "Dr. Priya Deshmukh",
    email: "priya.deshmukh@faculty.academia.edu",
    role: "INSTRUCTOR",
    major: "Machine Learning & Neural Architectures",
    university: "Indian Institute of Technology (IIT) Kharagpur",
    avatar: "Innovator",
    avatarIcon: "🚀",
    avatarBg: "from-purple-600 to-indigo-700",
  },
];

const ADMIN_DEMO_ACCOUNTS: User[] = [
  {
    id: "admin-central-01",
    name: "Dean of Academic Operations",
    email: "registrar@admin.academia.edu",
    role: "ADMIN",
    major: "Institutional Governance & Academic Operations",
    university: "Indian Institute of Technology (IIT) Kharagpur",
    avatar: "Astronaut",
    avatarIcon: "🏛️",
    avatarBg: "from-blue-700 to-indigo-900",
  },
];

export function PortalAuthPage({ currentUser, onLoginUser }: PortalAuthPageProps) {
  const navigate = useNavigate();

  // Redirect if already logged in as faculty or admin
  useEffect(() => {
    if (currentUser?.role === "INSTRUCTOR") {
      navigate("/instructor");
    } else if (currentUser?.role === "ADMIN") {
      navigate("/admin");
    }
  }, [currentUser, navigate]);

  // Tab State: Faculty vs Administrator
  const [activeRole, setActiveRole] = useState<"FACULTY" | "ADMIN">("FACULTY");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formCardRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Direct login execution
  const executeLogin = (userToLogin: User) => {
    setIsLoading(true);
    setErrorMessage(null);
    setNotification(`Authenticating ${userToLogin.name} as ${userToLogin.role}...`);

    localStorage.setItem("msa_custom_user_profile", JSON.stringify(userToLogin));
    if (onLoginUser) {
      onLoginUser(userToLogin);
    }

    setTimeout(() => {
      setIsLoading(false);
      if (userToLogin.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/instructor");
      }
    }, 700);
  };

  // Form submit handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Institutional email is required.");
      return;
    }

    const normEmail = email.trim().toLowerCase();
    const role = activeRole === "ADMIN" ? "ADMIN" : "INSTRUCTOR";
    const namePrefix = activeRole === "ADMIN" ? "Administrator" : "Professor";
    const cleanName = email.split("@")[0].replace(/[^a-zA-Z]/g, " ");
    const formattedName = cleanName
      ? cleanName
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ")
      : `${namePrefix} User`;

    const userObj: User = {
      id: `${role.toLowerCase()}-${Date.now()}`,
      name: `${activeRole === "ADMIN" ? "" : "Dr. "}${formattedName}`,
      email: normEmail,
      role: role as any,
      major: activeRole === "ADMIN" ? "Academic Operations" : "Computer Science & AI",
      university: "Indian Institute of Technology (IIT) Kharagpur",
      avatar: activeRole === "ADMIN" ? "Astronaut" : "Researcher",
      avatarIcon: activeRole === "ADMIN" ? "🏛️" : "🔬",
      avatarBg: activeRole === "ADMIN" ? "from-blue-700 to-indigo-900" : "from-amber-600 to-orange-700",
    };

    executeLogin(userObj);
  };

  return (
    <div
      ref={formContainerRef}
      className="min-h-screen w-full flex bg-[#09090b] text-[#FAF3E1] selection:bg-[#FF6D1F] selection:text-white font-sans overflow-hidden select-none relative"
    >
      {/* Top Left Navigation Button */}
      <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141418]/90 hover:bg-[#FF6D1F] border border-white/10 text-xs font-bold text-[#FAF3E1] transition-all shadow-lg cursor-pointer backdrop-blur-md group active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF6D1F] group-hover:text-[#FAF3E1] transition-colors" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Split Layout: Left Form + Right Interactive 3D Robot */}
      <div className="w-full flex flex-col lg:flex-row min-h-screen">

        {/* Left Side: Solid Still Auth Card Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 z-20 overflow-y-auto max-h-screen">
          <div
            ref={formCardRef}
            className="w-full max-w-[440px] bg-[#121216] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-5 relative overflow-hidden"
          >
            {/* Top Amber Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6D1F] to-transparent" />

            {/* Segmented Role Switcher: Faculty vs Administrator */}
            <div className="p-1 rounded-2xl bg-[#09090D] border border-white/10 flex items-center relative">
              <button
                type="button"
                onClick={() => {
                  setActiveRole("FACULTY");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all relative z-10 cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeRole === "FACULTY" ? "text-[#FAF3E1]" : "text-[#FAF3E1]/50 hover:text-[#FAF3E1]"
                }`}
              >
                {activeRole === "FACULTY" && (
                  <motion.div
                    layoutId="portal-auth-tab-pill"
                    className="absolute inset-0 bg-[#FF6D1F] rounded-xl shadow-md shadow-[#FF6D1F]/30"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <GraduationCap className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Faculty Member</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveRole("ADMIN");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all relative z-10 cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeRole === "ADMIN" ? "text-[#FAF3E1]" : "text-[#FAF3E1]/50 hover:text-[#FAF3E1]"
                }`}
              >
                {activeRole === "ADMIN" && (
                  <motion.div
                    layoutId="portal-auth-tab-pill"
                    className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-600/30"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <Building2 className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Administrator</span>
              </button>
            </div>

            {/* Header / Brand Title: EXACT "Welcome Faculty" AS REQUESTED */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5 text-left"
              >
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-[10px] font-black uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Institutional Access Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#FAF3E1]">
                  {activeRole === "FACULTY" ? "Welcome Faculty" : "Welcome Administrator"}
                </h1>
                <p className="text-xs text-[#FAF3E1]/60 font-medium">
                  {activeRole === "FACULTY"
                    ? "Access your assigned courses, lecture rosters, gradebooks, and academic portal"
                    : "Central university management, catalog publishing, and term registration control"}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2.5 shadow-lg">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Notification */}
            {notification && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{notification}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-[#FAF3E1]/70 uppercase tracking-wider">
                  {activeRole === "FACULTY" ? "Faculty Email" : "Administrator Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAF3E1]/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder={
                      activeRole === "FACULTY"
                        ? "professor.name@faculty.academia.edu"
                        : "admin.name@admin.academia.edu"
                    }
                    className="w-full bg-[#18181e] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/35 focus:outline-none focus:border-[#FF6D1F] focus:ring-2 focus:ring-[#FF6D1F]/30 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#FAF3E1]/70 uppercase tracking-wider">
                    Password / Token
                  </label>
                  <span className="text-[10px] text-[#FAF3E1]/40 font-mono">Institutional Auth</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAF3E1]/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full bg-[#18181e] border border-white/10 rounded-2xl pl-10 pr-11 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/35 focus:outline-none focus:border-[#FF6D1F] focus:ring-2 focus:ring-[#FF6D1F]/30 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#FAF3E1]/40 hover:text-[#FAF3E1] transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-2xl text-[#FAF3E1] font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-2 disabled:opacity-50 ${
                  activeRole === "FACULTY"
                    ? "bg-gradient-to-r from-[#FF6D1F] via-[#ff853f] to-[#FF6D1F] hover:from-[#e65c10] hover:to-[#e65c10] shadow-[#FF6D1F]/25"
                    : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/25"
                }`}
              >
                <span>
                  {isLoading
                    ? "Authenticating Credentials..."
                    : activeRole === "FACULTY"
                    ? "Sign In to Faculty Portal"
                    : "Sign In to Admin Console"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#121216] px-3 text-[10px] font-mono text-[#FAF3E1]/40 uppercase tracking-widest absolute">
                Instant Demo Access
              </span>
            </div>

            {/* 1-Click Fast Demo Accounts */}
            <div className="space-y-2 pt-1">
              {activeRole === "FACULTY" ? (
                <>
                  <button
                    type="button"
                    onClick={() => executeLogin(FACULTY_DEMO_ACCOUNTS[0])}
                    className="w-full p-2.5 rounded-xl bg-[#18181E] hover:bg-[#222228] border border-white/10 hover:border-[#FF6D1F]/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#FAF3E1] group-hover:text-[#FF6D1F] transition-colors">
                        Dr. Vikram Sethi
                      </div>
                      <div className="text-[10px] text-[#FAF3E1]/50 truncate">
                        CS & AI Department Chair (4 Sections)
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#FF6D1F] px-2 py-0.5 rounded-md bg-[#FF6D1F]/15 shrink-0">
                      1-Click Login →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeLogin(FACULTY_DEMO_ACCOUNTS[1])}
                    className="w-full p-2.5 rounded-xl bg-[#18181E] hover:bg-[#222228] border border-white/10 hover:border-[#FF6D1F]/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#FAF3E1] group-hover:text-[#FF6D1F] transition-colors">
                        Dr. Priya Deshmukh
                      </div>
                      <div className="text-[10px] text-[#FAF3E1]/50 truncate">
                        Machine Learning & Neural Architectures
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#FF6D1F] px-2 py-0.5 rounded-md bg-[#FF6D1F]/15 shrink-0">
                      1-Click Login →
                    </span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => executeLogin(ADMIN_DEMO_ACCOUNTS[0])}
                  className="w-full p-2.5 rounded-xl bg-[#18181E] hover:bg-[#222228] border border-white/10 hover:border-blue-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#FAF3E1] group-hover:text-blue-400 transition-colors">
                      Dean of Academic Operations
                    </div>
                    <div className="text-[10px] text-[#FAF3E1]/50 truncate">
                      Central Registrar & Term Governance Console
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 px-2 py-0.5 rounded-md bg-blue-500/15 shrink-0">
                    1-Click Login →
                  </span>
                </button>
              )}
            </div>

            {/* Back to Student Portal Link */}
            <div className="pt-2 border-t border-white/10 text-center">
              <Link
                to="/auth"
                className="text-xs text-[#FAF3E1]/60 hover:text-[#FF6D1F] transition-colors font-medium inline-flex items-center gap-1"
              >
                <span>Are you a student?</span>
                <strong className="underline underline-offset-2">Enter Student Portal →</strong>
              </Link>
            </div>

          </div>
        </div>

        {/* Right Side: The 3D Interactive Robot Hero Panel (IDENTICAL TO STUDENT LOGIN) */}
        <div className="hidden lg:flex w-1/2 relative bg-[#09090b] items-center justify-center overflow-hidden border-l border-white/10">

          {/* Spotlight Ambient Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#FF6D1F]/15 rounded-full blur-[180px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />

          {/* ASCII Text Animation Banner: "WELCOME FACULTY" */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full flex flex-col items-center justify-center text-center px-4">
            <AsciiTextAnimation
              text={activeRole === "FACULTY" ? "WELCOME FACULTY" : "WELCOME ADMIN"}
              className="opacity-75 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Interactive Spline 3D Robot Scene */}
          <div className="relative z-10 w-full h-full min-h-[600px] flex items-center justify-center">
            <SplineRobot
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>

        </div>

      </div>
    </div>
  );
}

export default PortalAuthPage;
