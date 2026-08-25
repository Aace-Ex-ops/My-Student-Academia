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
  Bot,
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

  // Form State - empty by default so user enters their own details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

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
        const name = payload.name || payload.given_name || "Student";
        const emailAddr = payload.email || "";
        const picture =
          payload.picture ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop";

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
  }, []);

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

  const handleGoogleSuccess = async (userData: {
    name: string;
    email: string;
    picture?: string;
    googleId?: string;
  }) => {
    const nameToUse = userData.name.trim() || "Student";
    const emailToUse = userData.email.trim();
    const photoToUse =
      userData.picture ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop";

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
    setNotification(`Google Sign-In verified: Welcome, ${nameToUse}!`);

    setTimeout(() => {
      navigate("/onboarding");
    }, 800);
  };

  // Standard Email/Password Sign Up or Sign In
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameToUse = isSignUp
      ? fullName.trim() || "Student"
      : fullName.trim() || email.split("@")[0] || currentUser?.name || "Student";

    const emailToUse = email.trim() || currentUser?.email || "";

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
                      placeholder="e.g. John Doe"
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
                  placeholder="student@university.edu"
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#FAF3E1]/40 hover:text-[#FAF3E1] transition-colors p-1 cursor-pointer"
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
            <div className="pt-2 flex justify-center w-full min-h-[44px]">
              <div ref={googleBtnContainerRef} className="w-full flex justify-center" />
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
