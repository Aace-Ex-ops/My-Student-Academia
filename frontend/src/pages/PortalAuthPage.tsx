import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  ChevronRight,
  Building2,
  KeyRound,
  ArrowLeft,
  X,
} from "lucide-react";
import { User } from "@/types";

interface PortalAuthPageProps {
  currentUser?: User | null;
  onLoginUser?: (user: User) => void;
}

// ✦ 6. CUSTOM TYPEWRITER HOOK (PER SPECIFICATION) ✦
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let intervalId: any;
    const timeoutId = setTimeout(() => {
      let index = 0;
      intervalId = setInterval(() => {
        index++;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          setDone(true);
          clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// ✦ PRE-CONFIGURED INSTITUTIONAL DEMO ACCOUNTS ✦
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
    name: "Office of the Dean & Registrar",
    email: "registrar@admin.academia.edu",
    role: "ADMIN",
    major: "Institutional Governance & Academic Registrar",
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

  // ✦ SPECIFICATION STATE ✦
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [services, setServices] = useState<string[]>(["Digital", "Brand"]);
  const { displayed, done } = useTypewriter("we'd love to\nhear from you!", 38, 600);

  // ✦ AUTHENTICATION MODAL / DRAWER STATE ✦
  const [activeTab, setActiveTab] = useState<"FACULTY" | "ADMIN">("FACULTY");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ✦ 3. BACKGROUND VIDEO SCRUBBING REF & EFFECT HOOKS (PER SPECIFICATION) ✦
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef<number | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const targetTimeRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Desktop Mouse Scrubbing Hook
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return; // Disable scrubbing below 1024px width
      if (!video.duration || isNaN(video.duration)) return;

      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }

      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      // Update target scrub time: (delta / window.innerWidth) * 0.8 * video.duration
      targetTimeRef.current += (delta / window.innerWidth) * 0.8 * video.duration;

      // Clamp between 0 and duration
      if (targetTimeRef.current < 0) targetTimeRef.current = 0;
      if (targetTimeRef.current > video.duration) targetTimeRef.current = video.duration;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    };

    const handleSeeked = () => {
      isSeekingRef.current = false;
      if (video && Math.abs(video.currentTime - targetTimeRef.current) > 0.05) {
        video.currentTime = targetTimeRef.current;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    video.addEventListener("seeked", handleSeeked);

    // Mobile Autoplay Hook: Screens < 1024 width
    if (window.innerWidth < 1024) {
      video.autoplay = true;
      video.loop = true;
      video.play().catch(() => {});
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, []);

  // Toggle service pill selection
  const toggleService = (srv: string) => {
    setServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  // Direct login execution
  const executeLogin = (userToLogin: User) => {
    setAuthError(null);
    setAuthSuccess(`Authenticating ${userToLogin.name} as ${userToLogin.role}...`);

    localStorage.setItem("msa_custom_user_profile", JSON.stringify(userToLogin));
    if (onLoginUser) {
      onLoginUser(userToLogin);
    }

    setTimeout(() => {
      if (userToLogin.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/instructor");
      }
    }, 700);
  };

  // Handle Form Submit
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setAuthError("Institutional email is required.");
      return;
    }

    const normEmail = email.trim().toLowerCase();
    const role = activeTab === "ADMIN" ? "ADMIN" : "INSTRUCTOR";
    const namePrefix = activeTab === "ADMIN" ? "Administrator" : "Professor";
    const cleanName = email.split("@")[0].replace(/[^a-zA-Z]/g, " ");
    const formattedName = cleanName
      ? cleanName
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ")
      : `${namePrefix} User`;

    const userObj: User = {
      id: `${role.toLowerCase()}-${Date.now()}`,
      name: `${activeTab === "ADMIN" ? "" : "Dr. "}${formattedName}`,
      email: normEmail,
      role: role as any,
      major: activeTab === "ADMIN" ? "Academic Operations" : "Computer Science & AI",
      university: "Indian Institute of Technology (IIT) Kharagpur",
      avatar: activeTab === "ADMIN" ? "Astronaut" : "Researcher",
      avatarIcon: activeTab === "ADMIN" ? "🏛️" : "🔬",
      avatarBg: activeTab === "ADMIN" ? "from-blue-700 to-indigo-900" : "from-amber-600 to-orange-700",
    };

    executeLogin(userObj);
  };

  const SERVICE_OPTIONS = ["Brand", "Digital", "Campaign", "Other"];

  return (
    // ✦ 2. GENERAL PAGE STRUCTURE (PER SPECIFICATION) ✦
    <div className="relative bg-white text-neutral-900 font-sans selection:bg-[#EAECE9] selection:text-[#1C2E1E] antialiased overflow-x-hidden flex flex-col lg:block lg:min-h-screen">
      
      {/* ✦ 4. INTERACTIVE NAVBAR (PER SPECIFICATION) ✦ */}
      <header className="fixed top-0 inset-x-0 z-30 px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center bg-transparent">
        {/* Logo (Left side) */}
        <Link to="/" className="flex flex-row items-center gap-3 group">
          <span className="text-[21px] sm:text-[26px] tracking-tight text-black font-medium select-none">
            Mainframe&reg;
          </span>
          <span className="text-[25px] sm:text-[30px] text-black select-none tracking-[-0.02em] font-medium leading-none mb-1">
            &#10033;
          </span>
        </Link>

        {/* Desktop Nav Links (Center) */}
        <nav className="flex-row hidden md:flex items-center text-[23px] text-black select-none">
          {["Labs", "Studio", "Openings", "Shop"].map((link, idx, arr) => (
            <React.Fragment key={link}>
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="hover:opacity-60 transition-opacity cursor-pointer font-normal"
              >
                {link}
              </button>
              {idx < arr.length - 1 && <span className="opacity-40">,&nbsp;</span>}
            </React.Fragment>
          ))}
        </nav>

        {/* Desktop CTA (Right) */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setShowAuthModal(true)}
            className="text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer font-normal"
          >
            Get in touch
          </button>

          <Link
            to="/auth"
            className="px-4 py-2 rounded-full border border-black/20 hover:border-black text-sm font-semibold text-black transition-colors"
          >
            Student Portal
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col items-center justify-center w-8 h-8 gap-1.5 z-40 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </header>

      {/* Mobile Full Screen Navigation Overlay */}
      <div
        className={`fixed inset-0 z-[25] bg-white/95 backdrop-blur-sm flex flex-col justify-center items-center gap-8 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-6 text-2xl font-medium text-black">
          {["Labs", "Studio", "Openings", "Shop"].map((link) => (
            <button
              key={link}
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowAuthModal(true);
              }}
              className="hover:opacity-60 transition-opacity"
            >
              {link}
            </button>
          ))}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setShowAuthModal(true);
            }}
            className="underline underline-offset-4 text-emerald-900 mt-2"
          >
            Sign In to Portal
          </button>
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm text-neutral-500 mt-4"
          >
            ← Back to Landing Page
          </Link>
        </div>
      </div>

      {/* ✦ 3. BACKGROUND VIDEO COMPONENT (WITH NATIVE SCRUBBING) (PER SPECIFICATION) ✦ */}
      <div className="order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-neutral-50 lg:bg-transparent">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4"
          className="w-full h-full object-cover object-right lg:object-right-bottom"
        />
      </div>

      {/* ✦ 5. CONTENT LAYOUT CONTAINER (PER SPECIFICATION) ✦ */}
      <div className="relative z-10 flex flex-col order-first lg:order-none w-full bg-white lg:bg-transparent pb-8 lg:pb-0 lg:min-h-screen">
        <main
          id="spade-hero"
          className="w-full max-w-7xl mx-auto px-6 py-12 pt-28 lg:pt-36 flex-1 flex flex-col justify-center"
        >
          <div className="max-w-3xl">
            {/* Top Academic Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/5 border border-neutral-900/10 text-neutral-800 text-xs font-semibold mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF6D1F]" />
              <span>Institutional Portal • Faculty & Administrative Console</span>
            </div>

            {/* ✦ 6. TYPEWRITER HEADLINE (PER SPECIFICATION) ✦ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-[76px] font-normal tracking-tight text-black leading-[1.08] mb-8 select-none w-full whitespace-pre-wrap">
                {displayed}
                {!done && (
                  <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" />
                )}
              </h1>
            </motion.div>

            {/* ✦ 7. SECONDARY DESCRIPTION TEXT (PER SPECIFICATION) ✦ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-lg md:text-xl text-[#5A635A] leading-relaxed font-normal mb-14 max-w-2xl">
                Whether you have questions, feedback, <br />
                drop us a message and we'll get back to you as soon as possible.
              </p>
            </motion.div>

            {/* ✦ 8. INTERACTIVE MULTI-SELECT SERVICE PILLS (PER SPECIFICATION) ✦ */}
            <div className="mb-10">
              <h2 className="text-2xl font-medium tracking-tight mb-2 text-neutral-900">
                What sort of service?
              </h2>
              <p className="opacity-85 text-[#738273] mb-8 text-sm">
                Select all that apply
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                {SERVICE_OPTIONS.map((srv) => {
                  const isSelected = services.includes(srv);
                  return (
                    <motion.button
                      key={srv}
                      type="button"
                      onClick={() => toggleService(srv)}
                      whileTap={{ scale: 0.96 }}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? "bg-[#1C2E1E] text-white shadow-md shadow-emerald-950/5 transform"
                          : "bg-white text-[#1C2E1E] border border-[#F1F3F1] hover:bg-[#F1F3F1]/55"
                      }`}
                    >
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <Check className="w-4 h-4 text-emerald-400" />
                        </motion.span>
                      )}
                      <span>{srv}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Contingent Feedback Status Banner (Per Specification) */}
              <AnimatePresence mode="wait">
                {services.length === 0 ? (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    className="italic text-xs text-neutral-500"
                  >
                    Please click to select services above.
                  </motion.p>
                ) : (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#FAFBF9] border border-neutral-200/80 rounded-2xl shadow-sm">
                      <span className="text-xs sm:text-sm text-neutral-800 font-medium">
                        Ready to inquire about:{" "}
                        <strong className="text-black font-semibold">
                          {services.join(", ")}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(true)}
                        className="inline-flex items-center gap-1.5 text-[#4D6D47] uppercase text-xs font-bold tracking-wider hover:opacity-75 transition-opacity cursor-pointer"
                      >
                        <span>Let's Go</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Direct Faculty & Admin Sign-In Trigger Card */}
            <div className="p-6 rounded-3xl bg-neutral-900 text-white shadow-2xl space-y-4 max-w-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FF6D1F]/20 border border-[#FF6D1F]/40 flex items-center justify-center text-[#FF6D1F]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#FAF3E1]">
                      Institutional Staff Authentication
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Sign in directly to access the Faculty or Admin dashboard
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-xs font-bold text-white transition-all shadow-md shadow-[#FF6D1F]/30"
                >
                  Enter Portal
                </button>
              </div>

              {/* Fast 1-Click Demo Profiles */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                  Quick Access Demo Profiles
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => executeLogin(FACULTY_DEMO_ACCOUNTS[0])}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF6D1F]/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white group-hover:text-[#FF6D1F] transition-colors">
                        Dr. Vikram Sethi
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                        Faculty
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-0.5 truncate">
                      CS & AI Dept Chair
                    </span>
                  </button>

                  <button
                    onClick={() => executeLogin(ADMIN_DEMO_ACCOUNTS[0])}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors">
                        Admin Registrar
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                        Admin
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-0.5 truncate">
                      Dean & Operations Console
                    </span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ✦ 9. FULL FACULTY & ADMIN AUTHENTICATION MODAL ✦ */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-[#121218] border border-[#F5E7C6]/25 p-6 sm:p-8 shadow-2xl text-[#FAF3E1] space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError(null);
                }}
                className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6D1F] to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-[#FF6D1F]/25 text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-[#FAF3E1]">
                  Institutional Portal Login
                </h3>
                <p className="text-xs text-neutral-400">
                  Select your role and authenticate to access your dashboard
                </p>
              </div>

              {/* Role Switcher Tabs */}
              <div className="p-1 rounded-2xl bg-[#09090D] border border-white/10 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("FACULTY");
                    setAuthError(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "FACULTY"
                      ? "bg-[#FF6D1F] text-white shadow-md shadow-[#FF6D1F]/30"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Faculty Member</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("ADMIN");
                    setAuthError(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "ADMIN"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Administrator</span>
                </button>
              </div>

              {/* Feedback messages */}
              {authError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium">
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                  {authSuccess}
                </div>
              )}

              {/* Standard Form */}
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    {activeTab === "FACULTY" ? "Faculty Email" : "Administrator Email"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        activeTab === "FACULTY"
                          ? "professor.name@faculty.academia.edu"
                          : "admin.name@admin.academia.edu"
                      }
                      className="w-full rounded-2xl bg-[#1A1A22] border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6D1F] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Password / Token
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-2xl bg-[#1A1A22] border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6D1F] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "FACULTY"
                      ? "bg-[#FF6D1F] hover:bg-[#e65c10] shadow-[#FF6D1F]/30"
                      : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
                  }`}
                >
                  <span>
                    Sign In to {activeTab === "FACULTY" ? "Faculty Portal" : "Admin Console"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Fast 1-Click Demo Profiles in Modal */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block text-center">
                  Instant Demo Access (No Password Required)
                </span>
                <div className="space-y-1.5">
                  {activeTab === "FACULTY" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => executeLogin(FACULTY_DEMO_ACCOUNTS[0])}
                        className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs font-semibold flex items-center justify-between text-neutral-200 transition-colors"
                      >
                        <span>Dr. Vikram Sethi (CS & AI Chair)</span>
                        <span className="text-[#FF6D1F] text-[11px]">Instant Login →</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => executeLogin(FACULTY_DEMO_ACCOUNTS[1])}
                        className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs font-semibold flex items-center justify-between text-neutral-200 transition-colors"
                      >
                        <span>Dr. Priya Deshmukh (Neural Systems)</span>
                        <span className="text-[#FF6D1F] text-[11px]">Instant Login →</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => executeLogin(ADMIN_DEMO_ACCOUNTS[0])}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs font-semibold flex items-center justify-between text-neutral-200 transition-colors"
                    >
                      <span>Dean of Academic Operations & Registrar</span>
                      <span className="text-blue-400 text-[11px]">Instant Login →</span>
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default PortalAuthPage;
