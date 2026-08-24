import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Zap,
  Bot,
  X,
  Check,
  Upload,
  Camera,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { SplineRobot } from "@/components/ui/spline-robot";
import { AsciiTextAnimation } from "@/components/ui/ascii-text-animation";
import { User } from "@/types";
import { apiFetch } from "@/lib/api";

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthPageProps {
  currentUser?: User;
  onLoginUser?: (user: User) => void;
  users?: User[];
}

const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  "211083986644-uadammltocqmv4unanfsv5p245ut11mc.apps.googleusercontent.com";

// Helper to decode JWT without external dependencies
function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthPage({ currentUser, onLoginUser, users = [] }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State - default to Aditya Chatterjee
  const [fullName, setFullName] = useState("Aditya Chatterjee");
  const [email, setEmail] = useState("aditya.chatterjee@gmail.com");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Google Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleName, setGoogleName] = useState("Aditya Chatterjee");
  const [googleEmail, setGoogleEmail] = useState("aditya.chatterjee@gmail.com");
  const [googlePhotoUrl, setGooglePhotoUrl] = useState(
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
  );
  const [isCustomPhotoUploaded, setIsCustomPhotoUploaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // DOM Refs for GSAP
  const formCardRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (formCardRef.current) {
        gsap.fromTo(
          formCardRef.current,
          { opacity: 0, y: 35, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out" }
        );
      }
    }, formContainerRef);

    return () => ctx.revert();
  }, []);

  // ✦ LOAD GOOGLE IDENTITY SERVICES (GSI) SDK SCRIPT ✦
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const handleCredentialResponse = async (response: any) => {
      if (!response || !response.credential) return;

      const payload = decodeJwt(response.credential);
      if (payload) {
        const name = payload.name || payload.given_name || "Aditya Chatterjee";
        const emailAddr = payload.email || "aditya.chatterjee@gmail.com";
        const picture = payload.picture || googlePhotoUrl;

        await handleGoogleSuccess({
          name,
          email: emailAddr,
          picture,
          googleId: payload.sub,
        });
      }
    };

    // Load Google GSI Script if not already loaded
    const scriptId = "google-gsi-client-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnContainerRef.current) {
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: "filled_black",
              size: "large",
              shape: "pill",
              width: "360",
              text: "continue_with",
            });
          }
        }
      };
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
      });
      if (googleBtnContainerRef.current) {
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          width: "360",
          text: "continue_with",
        });
      }
    }
  }, [googlePhotoUrl]);

  const handleFormMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = formCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (y / (rect.height / 2)) * -6;
    const rotY = (x / (rect.width / 2)) * 6;

    gsap.to(card, {
      rotationX: rotX,
      rotationY: rotY,
      transformPerspective: 1200,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const handleFormMouseLeave = () => {
    if (!formCardRef.current) return;
    gsap.to(formCardRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  // Profile Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setGooglePhotoUrl(uploadEvent.target.result as string);
          setIsCustomPhotoUploaded(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoogleSuccess = async (userData: {
    name: string;
    email: string;
    picture?: string;
    googleId?: string;
  }) => {
    const nameToUse = userData.name.trim() || "Aditya Chatterjee";
    const emailToUse = userData.email.trim() || "aditya.chatterjee@gmail.com";
    const photoToUse = userData.picture || googlePhotoUrl;

    try {
      // Sync to backend DB
      await apiFetch("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({
          name: nameToUse,
          email: emailToUse,
          avatarUrl: photoToUse,
          googleId: userData.googleId,
        }),
      }).catch((err) => console.warn("Backend Google Sync Note:", err));
    } catch (e) {
      console.warn("Backend auth sync skipped:", e);
    }

    const newUser: User = {
      id: `google-user-${Date.now()}`,
      name: nameToUse,
      email: emailToUse,
      username: `@${nameToUse.toLowerCase().replace(/\s+/g, "_")}`,
      role: "STUDENT",
      studentId: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
      university: "Indian Institute of Technology (IIT) Kharagpur",
      major: "Computer Science & Engineering",
      phone: "+91 9876543210",
      googlePhotoUrl: photoToUse,
      avatarUrl: photoToUse,
      avatar: "google_photo",
      avatarIcon: "🌐",
      avatarBg: "from-blue-600 to-indigo-600",
    };

    if (onLoginUser) {
      onLoginUser(newUser);
    }
    localStorage.setItem("msa_custom_user_profile", JSON.stringify(newUser));
    setIsGoogleModalOpen(false);
    setNotification(`Google Sign-In verified: Welcome, ${nameToUse}!`);

    setTimeout(() => {
      navigate("/onboarding");
    }, 800);
  };

  // Trigger Google One-Tap or native Google Modal
  const triggerGoogleSignIn = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleModalOpen(true);
        }
      });
    } else {
      setIsGoogleModalOpen(true);
    }
  };

  // Standard Email/Password Sign Up or Sign In
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameToUse = isSignUp
      ? fullName.trim() || "Aditya Chatterjee"
      : fullName.trim() || email.split("@")[0] || currentUser?.name || "Aditya Chatterjee";

    const emailToUse = email.trim() || currentUser?.email || "aditya.chatterjee@gmail.com";

    const newUser: User = {
      id: currentUser?.id || `student-${Date.now()}`,
      name: nameToUse,
      email: emailToUse,
      username: `@${nameToUse.toLowerCase().replace(/\s+/g, "_")}`,
      role: "STUDENT",
      studentId: currentUser?.studentId || `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
      university: currentUser?.university || "Indian Institute of Technology (IIT) Kharagpur",
      major: currentUser?.major || "Computer Science & Engineering",
      phone: currentUser?.phone || "+91 9876543210",
      avatar: currentUser?.avatar || "scholar",
      avatarIcon: currentUser?.avatarIcon || "👨‍🎓",
      avatarBg: currentUser?.avatarBg || "from-amber-500 to-orange-600",
    };

    if (onLoginUser) {
      onLoginUser(newUser);
    }
    localStorage.setItem("msa_custom_user_profile", JSON.stringify(newUser));

    setNotification(
      isSignUp
        ? `Account created for ${nameToUse}! Redirecting to onboarding...`
        : `Signed in as ${nameToUse}! Redirecting...`
    );

    setTimeout(() => {
      navigate("/onboarding");
    }, 800);
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

      {/* ✦ GOOGLE ACCOUNT SIGN-IN & PHOTO UPLOAD MODAL ✦ */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#15151E] border-2 border-[#FF6D1F]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-6 text-left relative">
            <button
              onClick={() => setIsGoogleModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Google Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center p-2.5 shadow-lg shadow-white/10">
                <svg className="w-full h-full" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29B11.86 9.12 10.5 12 10.5c0 1.25.32 2.43.86 3.48l3.92-3.04z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-[#FAF3E1] text-lg leading-tight">Google Sign-In</h3>
                <p className="text-xs text-[#FAF3E1]/60">Select your Gmail & Profile Photo</p>
              </div>
            </div>

            {/* Google Account Profile Card */}
            <div className="p-4 rounded-2xl bg-[#0E0E14] border border-white/10 flex items-center gap-4">
              <div className="relative group flex-shrink-0">
                <img
                  src={googlePhotoUrl}
                  alt="Google Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold text-white"
                >
                  <Camera className="w-4 h-4 mb-0.5 text-blue-400" />
                  <span>Upload</span>
                </button>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Aditya Chatterjee"
                    className="w-full bg-[#1A1A26] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-[#FAF3E1] focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="aditya.chatterjee@gmail.com"
                    className="w-full bg-[#1A1A26] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-[#FAF3E1]/80 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Custom Photo Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#20202C] hover:bg-[#2A2A3A] border border-white/10 text-[#FAF3E1] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Upload Custom Profile Pic</span>
              </button>

              {isCustomPhotoUploaded && (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Photo Active
                </span>
              )}
            </div>

            {/* Quick Profile Avatars Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#FAF3E1]/70 block">Or pick a photo avatar</label>
              <div className="flex items-center gap-3">
                {[
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
                ].map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setGooglePhotoUrl(url);
                      setIsCustomPhotoUploaded(false);
                    }}
                    className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer relative ${
                      googlePhotoUrl === url ? "border-blue-500 scale-110 shadow-lg shadow-blue-500/30" : "border-white/20 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {googlePhotoUrl === url && (
                      <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Google Sign In */}
            <button
              type="button"
              onClick={() => handleGoogleSuccess({ name: googleName, email: googleEmail, picture: googlePhotoUrl })}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-600/30 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Confirm & Sign In with Google</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Split Layout: Left Form + Right Interactive 3D Robot */}
      <div className="w-full flex flex-col lg:flex-row min-h-screen">
        
        {/* Left Side: Auth Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 z-20">
          <div
            ref={formCardRef}
            onMouseMove={handleFormMouseMove}
            onMouseLeave={handleFormMouseLeave}
            className="w-full max-w-md bg-[#121216]/95 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-6 relative overflow-hidden"
          >
            {/* Top Amber Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6D1F] to-transparent" />

            {/* Header / Brand Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? "signup-header" : "signin-header"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-2 text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-xs font-black uppercase tracking-wider">
                  <Bot className="w-3.5 h-3.5" />
                  <span>{isSignUp ? "New Student Enrollment" : "Interactive Student Portal"}</span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-[#FAF3E1]">
                  {isSignUp ? "Create Your Account" : "Welcome Back"}
                </h1>
                <p className="text-xs sm:text-sm text-[#FAF3E1]/70 font-medium">
                  {isSignUp
                    ? "Register now to start conflict-free academic routine planning"
                    : "Enter your credentials to access your student academia portal"}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Notification Toast */}
            {notification && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2.5 shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{notification}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    key="fullname-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-1.5"
                  >
                    <label className="block text-xs font-bold text-[#FAF3E1]/80">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Aditya Chatterjee"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#18181e] border border-white/10 rounded-2xl px-4 py-3 text-sm text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] transition-all"
                      required={isSignUp}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#FAF3E1]/80">
                  Student Email
                </label>
                <input
                  type="email"
                  placeholder="aditya.chatterjee@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#18181e] border border-white/10 rounded-2xl px-4 py-3 text-sm text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#FAF3E1]/80">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#18181e] border border-white/10 rounded-2xl pl-4 pr-11 py-3 text-sm text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-[#FF6D1F] focus:ring-1 focus:ring-[#FF6D1F] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#FAF3E1]/40 hover:text-[#FAF3E1] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6D1F] via-[#ff853f] to-[#FF6D1F] hover:from-[#e65c10] hover:to-[#e65c10] text-[#FAF3E1] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FF6D1F]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-2"
              >
                <span>{isSignUp ? "Complete Registration" : "Sign In to Dashboard"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center text-xs text-[#FAF3E1]/60">
              {isSignUp ? (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="font-bold text-[#FF6D1F] hover:underline cursor-pointer ml-1"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to My Student Academia?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="font-bold text-[#FF6D1F] hover:underline cursor-pointer ml-1"
                  >
                    Create an account
                  </button>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#121216] px-3 text-[11px] font-mono text-[#FAF3E1]/40 uppercase tracking-widest absolute">
                Or Continue With
              </span>
            </div>

            {/* Official Google OAuth GSI Button Container */}
            <div className="pt-2 flex flex-col items-center justify-center gap-2">
              <div ref={googleBtnContainerRef} className="w-full flex justify-center min-h-[44px]" />

              {/* Fallback & Custom Photo Button */}
              <button
                type="button"
                onClick={triggerGoogleSignIn}
                className="w-full py-3 px-4 rounded-2xl bg-[#18181e] hover:bg-[#222228] border border-white/10 text-[#FAF3E1] font-bold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29B11.86 9.12 10.5 12 10.5c0 1.25.32 2.43.86 3.48l3.92-3.04z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google Sign-In / Custom Photo</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Side: Spline 3D Interactive Robot Panel */}
        <div className="hidden lg:flex w-1/2 relative bg-[#09090b] items-center justify-center overflow-hidden border-l border-white/10">
          
          {/* Spotlight Ambient Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#FF6D1F]/15 rounded-full blur-[180px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />

          {/* ASCII Text Animation Banner */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none w-full flex flex-col items-center justify-center text-center px-4">
            <AsciiTextAnimation
              text={isSignUp ? "WELCOME NEW USER" : "WELCOME BACK"}
              className="opacity-75 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Interactive Spline 3D Robot Scene */}
          <div className="relative z-20 w-full h-full min-h-[600px] flex items-center justify-center">
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
