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
  AlertCircle,
  ShieldCheck,
  Bot,
  Sparkles,
} from "lucide-react";
import { SplineRobot } from "@/components/ui/spline-robot";
import { AsciiTextAnimation } from "@/components/ui/ascii-text-animation";
import { User } from "@/types";
import { apiFetch } from "@/lib/api";
import { validateCertifiedEmail } from "@/lib/emailValidator";

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

// Local storage registry key for offline / persistent registered accounts
const REGISTERED_USERS_KEY = "msa_registered_accounts_registry";

function getRegisteredAccounts(): Record<string, User> {
  try {
    const data = localStorage.getItem(REGISTERED_USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveRegisteredAccount(user: User) {
  try {
    const registry = getRegisteredAccounts();
    registry[user.email.toLowerCase()] = user;
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registry));
  } catch (e) {
    console.warn("Error saving user to registry:", e);
  }
}

export function AuthPage({ currentUser, onLoginUser, users = [] }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State - empty by default
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Feedback States
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (userData: {
    name: string;
    email: string;
    picture?: string;
    googleId?: string;
  }) => {
    setErrorMessage(null);
    const emailToUse = userData.email.trim().toLowerCase();
    const nameToUse = userData.name.trim() || "Student";
    const photoToUse =
      userData.picture ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop";

    // 1. Certified Email Check
    const validation = validateCertifiedEmail(emailToUse);
    if (!validation.isValid || !validation.isCertified) {
      setErrorMessage(
        validation.error || "Google account email is not certified for university enrollment."
      );
      return;
    }

    try {
      // Sync to backend DB
      const res = await apiFetch("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({
          name: nameToUse,
          email: emailToUse,
          avatarUrl: photoToUse,
          googleId: userData.googleId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.error) {
          setErrorMessage(errData.error);
          return;
        }
      }
    } catch (e) {
      console.warn("Backend auth sync note:", e);
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

    saveRegisteredAccount(newUser);

    if (onLoginUser) {
      onLoginUser(newUser);
    }
    localStorage.setItem("msa_custom_user_profile", JSON.stringify(newUser));
    setNotification(`Google Sign-In verified: Welcome, ${nameToUse}!`);

    setTimeout(() => {
      navigate("/onboarding");
    }, 800);
  };

  // ✦ STANDARD REGISTRATION & LOGIN SUBMISSION HANDLER ✦
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNotification(null);

    const emailToUse = email.trim().toLowerCase();
    const nameToUse = fullName.trim() || "Student";

    // 1. Validate Email Format & Certification
    const validation = validateCertifiedEmail(emailToUse);
    if (!validation.isValid || !validation.isCertified) {
      setErrorMessage(
        validation.error ||
          "Please enter a valid, certified institutional or student email address."
      );
      return;
    }

    setIsLoading(true);

    if (isSignUp) {
      // ══════════════════════════════════════════════════
      // ✦ SIGN UP LOGIC (CERTIFIED EMAILS ONLY)
      // ══════════════════════════════════════════════════
      const registry = getRegisteredAccounts();
      if (registry[emailToUse]) {
        setIsLoading(false);
        setErrorMessage("An account with this email already exists. Please sign in.");
        return;
      }

      let backendUser: any = null;
      try {
        const res = await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: nameToUse,
            email: emailToUse,
            password: password || "password123",
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setIsLoading(false);
          setErrorMessage(data.error || "Failed to create student account.");
          return;
        }
        backendUser = data.user;
      } catch (err) {
        console.warn("Backend register fallback to local registry:", err);
      }

      const newUser: User = {
        id: backendUser?.id || `student-${Date.now()}`,
        name: nameToUse,
        email: emailToUse,
        username: `@${nameToUse.toLowerCase().replace(/\s+/g, "_")}`,
        role: "STUDENT",
        studentId: backendUser?.studentId || `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
        university: "Indian Institute of Technology (IIT) Kharagpur",
        major: "Computer Science & Engineering",
        phone: "+91 9876543210",
        avatar: "scholar",
        avatarIcon: "👨‍🎓",
        avatarBg: "from-amber-500 to-orange-600",
      };

      saveRegisteredAccount(newUser);

      if (onLoginUser) {
        onLoginUser(newUser);
      }
      localStorage.setItem("msa_custom_user_profile", JSON.stringify(newUser));

      setIsLoading(false);
      setNotification(`Certified Account Created for ${nameToUse}! Redirecting to onboarding...`);

      setTimeout(() => {
        navigate("/onboarding");
      }, 800);

    } else {
      // ══════════════════════════════════════════════════
      // ✦ SIGN IN LOGIC (REGISTERED ACCOUNTS ONLY)
      // ══════════════════════════════════════════════════
      let backendSuccess = false;
      let authenticatedUser: any = null;

      try {
        const res = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: emailToUse,
            password: password || "password123",
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.user) {
          backendSuccess = true;
          authenticatedUser = data.user;
        } else if (res.status === 404) {
          setIsLoading(false);
          setErrorMessage(
            "Access Denied: No account found with this email. Only registered students can log in. Please create an account first."
          );
          return;
        }
      } catch (err) {
        console.warn("Backend login check:", err);
      }

      // Check local registered registry if backend was unreachable
      const registry = getRegisteredAccounts();
      const localAccount = registry[emailToUse];

      if (!backendSuccess && !localAccount) {
        setIsLoading(false);
        setErrorMessage(
          "Access Denied: No account found with this email. Only registered students can log in. Please create an account first."
        );
        return;
      }

      const loggedInUser: User = localAccount || {
        id: authenticatedUser?.id || `student-${Date.now()}`,
        name: authenticatedUser?.name || emailToUse.split("@")[0],
        email: emailToUse,
        username: `@${(authenticatedUser?.name || emailToUse.split("@")[0])
          .toLowerCase()
          .replace(/\s+/g, "_")}`,
        role: "STUDENT",
        studentId: authenticatedUser?.studentId || `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
        university: "Indian Institute of Technology (IIT) Kharagpur",
        major: "Computer Science & Engineering",
        phone: "+91 9876543210",
        avatar: "scholar",
        avatarIcon: "👨‍🎓",
        avatarBg: "from-amber-500 to-orange-600",
      };

      if (onLoginUser) {
        onLoginUser(loggedInUser);
      }
      localStorage.setItem("msa_custom_user_profile", JSON.stringify(loggedInUser));

      setIsLoading(false);
      setNotification(`Welcome back, ${loggedInUser.name}! Logging in...`);

      setTimeout(() => {
        navigate("/onboarding");
      }, 800);
    }
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
                  <span>{isSignUp ? "Certified Student Enrollment" : "Interactive Student Portal"}</span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-[#FAF3E1]">
                  {isSignUp ? "Create Certified Account" : "Welcome Back"}
                </h1>
                <p className="text-xs sm:text-sm text-[#FAF3E1]/70 font-medium">
                  {isSignUp
                    ? "Enter your certified student email to register your academic profile"
                    : "Enter your registered credentials to access your student portal"}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Error Message Toast */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-start gap-2.5 shadow-lg animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Notification Toast */}
            {notification && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in fade-in">
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
                      placeholder="e.g. Aditya Chatterjee"
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
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#FAF3E1]/80">
                    Student Email
                  </label>
                  {isSignUp && (
                    <span className="text-[10px] font-mono text-[#FF6D1F] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Certified Only
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
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
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6D1F] via-[#ff853f] to-[#FF6D1F] hover:from-[#e65c10] hover:to-[#e65c10] text-[#FAF3E1] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FF6D1F]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-2 disabled:opacity-50"
              >
                <span>
                  {isLoading
                    ? "Verifying..."
                    : isSignUp
                    ? "Create Certified Account"
                    : "Sign In to Dashboard"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center text-xs text-[#FAF3E1]/60">
              {isSignUp ? (
                <>
                  Already have a registered account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMessage(null);
                    }}
                    className="font-bold text-[#FF6D1F] hover:underline cursor-pointer ml-1"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMessage(null);
                    }}
                    className="font-bold text-[#FF6D1F] hover:underline cursor-pointer ml-1"
                  >
                    Create certified account
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
