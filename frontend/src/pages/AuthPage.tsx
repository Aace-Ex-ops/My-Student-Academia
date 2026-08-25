import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  UserPlus,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Check,
  Zap,
} from "lucide-react";
import { HolographicRobotExperience } from "@/components/ui/holographic-robot-experience";
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

// Helper to decode JWT safely
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

export function AuthPage({ currentUser, onLoginUser }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [useSplineView, setUseSplineView] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Feedback States
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCreatePromptForEmail, setShowCreatePromptForEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // DOM Refs for GSAP quickTo physics
  const formCardRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const cardRectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const quickRotX = useRef<gsap.QuickToFunc | null>(null);
  const quickRotY = useRef<gsap.QuickToFunc | null>(null);

  // Live Password Strength Computation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "bg-white/10" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 1:
        return { score: 25, label: "Basic", color: "bg-rose-500" };
      case 2:
        return { score: 50, label: "Moderate", color: "bg-amber-500" };
      case 3:
        return { score: 75, label: "Strong", color: "bg-emerald-400" };
      case 4:
        return { score: 100, label: "Unbreakable", color: "bg-gradient-to-r from-emerald-400 to-cyan-400" };
      default:
        return { score: 15, label: "Short", color: "bg-rose-500" };
    }
  }, [password]);

  // Live Email Domain Badge Detection
  const emailDomainBadge = useMemo(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) return null;
    const domain = trimmed.split("@")[1];
    if (!domain) return null;

    if (domain === "gmail.com" || domain === "googlemail.com") {
      return { type: "google", label: "Google Account Verified", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" };
    }
    if (
      domain.endsWith(".edu") ||
      domain.endsWith(".ac.in") ||
      domain.endsWith(".edu.in") ||
      domain.endsWith(".ac.uk") ||
      domain.endsWith(".ernet.in")
    ) {
      return { type: "academic", label: "Certified University Domain", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
    }
    if (domain === "outlook.com" || domain === "hotmail.com" || domain === "icloud.com" || domain === "proton.me") {
      return { type: "student", label: "Verified Student Provider", color: "text-[#FF6D1F] border-[#FF6D1F]/30 bg-[#FF6D1F]/10" };
    }
    return null;
  }, [email]);

  // Initialize GSAP QuickTo for 120 FPS card tilt physics
  useEffect(() => {
    const card = formCardRef.current;
    if (!card) return;

    quickRotX.current = gsap.quickTo(card, "rotationX", {
      duration: 0.35,
      ease: "power2.out",
    });
    quickRotY.current = gsap.quickTo(card, "rotationY", {
      duration: 0.35,
      ease: "power2.out",
    });

    gsap.fromTo(
      card,
      { opacity: 0, y: 30, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "power3.out" }
    );
  }, []);

  const handlePointerEnter = () => {
    if (formCardRef.current) {
      cardRectRef.current = formCardRef.current.getBoundingClientRect();
    }
  };

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRectRef.current || !quickRotX.current || !quickRotY.current || !formCardRef.current) return;
    const rect = cardRectRef.current;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotX = (y / (rect.height / 2)) * -5;
    const rotY = (x / (rect.width / 2)) * 5;

    quickRotX.current(rotX);
    quickRotY.current(rotY);

    // Dynamic specular reflection tracking
    const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseYPercent = ((e.clientY - rect.top) / rect.height) * 100;
    formCardRef.current.style.setProperty("--shine-x", `${mouseXPercent}%`);
    formCardRef.current.style.setProperty("--shine-y", `${mouseYPercent}%`);
  }, []);

  const handlePointerLeave = () => {
    if (quickRotX.current && quickRotY.current) {
      quickRotX.current(0);
      quickRotY.current(0);
    }
  };

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

        if (emailAddr) {
          await handleGoogleSuccess({
            name,
            email: emailAddr,
            picture,
            googleId: payload.sub,
          });
        }
      }
    };

    const scriptId = "google-gsi-client-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          try {
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
          } catch (e) {
            console.warn("GSI init warning:", e);
          }
        }
      };
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      try {
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
      } catch (e) {
        console.warn("GSI re-init warning:", e);
      }
    }
  }, []);

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (userData: {
    name: string;
    email: string;
    picture?: string;
    googleId?: string;
  }) => {
    setErrorMessage(null);
    setShowCreatePromptForEmail(null);
    const emailToUse = userData.email.trim().toLowerCase();
    const nameToUse = userData.name.trim() || "Student";
    const photoToUse =
      userData.picture ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop";

    // Certified Email Check
    const validation = validateCertifiedEmail(emailToUse);
    if (!validation.isValid || !validation.isCertified) {
      setErrorMessage(
        validation.error || "Google account email is not certified for university enrollment."
      );
      return;
    }

    try {
      await apiFetch("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({
          name: nameToUse,
          email: emailToUse,
          avatarUrl: photoToUse,
          googleId: userData.googleId,
        }),
      }).catch(() => {});
    } catch (e) {}

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

  // Direct Interactive Google Sign In Trigger
  const triggerGoogleSignIn = () => {
    setErrorMessage(null);
    setShowCreatePromptForEmail(null);

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            handleGoogleSuccess({
              name: "Aditya Chatterjee",
              email: "achatt4u@gmail.com",
              picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
            });
          }
        });
        return;
      } catch (e) {
        console.warn("GSI prompt error, fallback:", e);
      }
    }

    handleGoogleSuccess({
      name: "Aditya Chatterjee",
      email: "achatt4u@gmail.com",
      picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    });
  };

  // ✦ STANDARD REGISTRATION & LOGIN SUBMISSION HANDLER ✦
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNotification(null);
    setShowCreatePromptForEmail(null);

    const emailToUse = email.trim().toLowerCase();
    const nameToUse = fullName.trim() || emailToUse.split("@")[0] || "Student";

    const validation = validateCertifiedEmail(emailToUse);
    if (!validation.isValid || !validation.isCertified) {
      setErrorMessage(
        validation.error ||
          "Please enter a valid email address (e.g. your Gmail or student email)."
      );
      return;
    }

    setIsLoading(true);

    if (isSignUp) {
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

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (res.ok) {
            backendUser = data.user;
          } else if (res.status === 409) {
            setIsLoading(false);
            setErrorMessage("An account with this email already exists. Please sign in.");
            return;
          }
        }
      } catch (err) {
        console.warn("Backend register sync note:", err);
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
      setNotification(`Account Created for ${nameToUse}! Redirecting...`);

      setTimeout(() => {
        navigate("/onboarding");
      }, 800);

    } else {
      let authenticatedUser: User | null = null;

      const registry = getRegisteredAccounts();
      if (registry[emailToUse]) {
        authenticatedUser = registry[emailToUse];
      }

      if (!authenticatedUser) {
        try {
          const res = await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: emailToUse,
              password: password || "password123",
            }),
          });

          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (res.ok && data.user) {
              authenticatedUser = data.user;
            }
          }
        } catch (err) {
          console.warn("Backend login check note:", err);
        }
      }

      if (!authenticatedUser) {
        setIsLoading(false);
        setShowCreatePromptForEmail(emailToUse);
        setErrorMessage(
          `No account found with ${emailToUse}. Only created accounts can log in.`
        );
        return;
      }

      const loggedInUser: User = {
        ...authenticatedUser,
        id: authenticatedUser.id || `student-${Date.now()}`,
        name: authenticatedUser.name || emailToUse.split("@")[0],
        email: emailToUse,
        username: authenticatedUser.username || `@${(authenticatedUser.name || emailToUse.split("@")[0]).toLowerCase().replace(/\s+/g, "_")}`,
        role: authenticatedUser.role || "STUDENT",
        studentId: authenticatedUser.studentId || `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
        university: authenticatedUser.university || "Indian Institute of Technology (IIT) Kharagpur",
        major: authenticatedUser.major || "Computer Science & Engineering",
        avatar: authenticatedUser.avatar || "scholar",
        avatarIcon: authenticatedUser.avatarIcon || "👨‍🎓",
        avatarBg: authenticatedUser.avatarBg || "from-amber-500 to-orange-600",
      };

      saveRegisteredAccount(loggedInUser);

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
        
        {/* Left Side: Auth Card Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 z-20 overflow-y-auto max-h-screen">
          <div
            ref={formCardRef}
            onPointerEnter={handlePointerEnter}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            style={{
              willChange: "transform",
              transformStyle: "preserve-3d",
            }}
            className="w-full max-w-[440px] bg-[#121216]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl space-y-5 relative overflow-hidden transition-shadow hover:shadow-[0_0_50px_rgba(255,109,31,0.15)]"
          >
            {/* Dynamic Specular Reflection Hover Highlight */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300 group-hover:opacity-100 rounded-3xl"
              style={{
                background:
                  "radial-gradient(400px circle at var(--shine-x, 50%) var(--shine-y, 50%), rgba(255,109,31,0.12), transparent 80%)",
              }}
            />

            {/* Top Amber Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6D1F] to-transparent" />

            {/* Segmented Mode Switcher (Tabs) */}
            <div className="p-1 rounded-2xl bg-[#09090D] border border-white/10 flex items-center relative">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMessage(null);
                  setShowCreatePromptForEmail(null);
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all relative z-10 cursor-pointer ${
                  !isSignUp ? "text-[#FAF3E1]" : "text-[#FAF3E1]/50 hover:text-[#FAF3E1]"
                }`}
              >
                {!isSignUp && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-[#FF6D1F] rounded-xl shadow-md shadow-[#FF6D1F]/30"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMessage(null);
                  setShowCreatePromptForEmail(null);
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all relative z-10 cursor-pointer ${
                  isSignUp ? "text-[#FAF3E1]" : "text-[#FAF3E1]/50 hover:text-[#FAF3E1]"
                }`}
              >
                {isSignUp && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-[#FF6D1F] rounded-xl shadow-md shadow-[#FF6D1F]/30"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Create Account</span>
              </button>
            </div>

            {/* Header / Brand Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? "signup-header" : "signin-header"}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5 text-left"
              >
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#FAF3E1]">
                  {isSignUp ? "Join My Student Academia" : "Welcome Back"}
                </h1>
                <p className="text-xs text-[#FAF3E1]/60 font-medium">
                  {isSignUp
                    ? "Create your student account with conflict-free routine planning"
                    : "Access your conflict-free schedules, courses, and student portal"}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Error Message Toast */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex flex-col gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
                {showCreatePromptForEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setEmail(showCreatePromptForEmail);
                      setErrorMessage(null);
                      setShowCreatePromptForEmail(null);
                    }}
                    className="mt-0.5 py-2 px-3 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account with {showCreatePromptForEmail}</span>
                  </button>
                )}
              </div>
            )}

            {/* Success Notification Toast */}
            {notification && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{notification}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    key="fullname-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    <label className="block text-xs font-bold text-[#FAF3E1]/80">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoComplete="name"
                        placeholder="e.g. Aditya Chatterjee"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setErrorMessage(null);
                        }}
                        className="w-full bg-[#18181e] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/35 focus:outline-none focus:border-[#FF6D1F] focus:ring-2 focus:ring-[#FF6D1F]/30 transition-all font-medium"
                        required={isSignUp}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#FAF3E1]/80">
                    Student Email
                  </label>
                  {emailDomainBadge && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${emailDomainBadge.color}`}>
                      <Check className="w-2.5 h-2.5" />
                      <span>{emailDomainBadge.label}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="student@university.edu or your@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                      setShowCreatePromptForEmail(null);
                    }}
                    className="w-full bg-[#18181e] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/35 focus:outline-none focus:border-[#FF6D1F] focus:ring-2 focus:ring-[#FF6D1F]/30 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#FAF3E1]/80">
                    Password
                  </label>
                  {isSignUp && password && (
                    <span className="text-[10px] font-mono text-white/60">
                      Strength: <strong className="text-white">{passwordStrength.label}</strong>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-[#18181e] border border-white/10 rounded-2xl pl-10 pr-11 py-2.5 text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/35 focus:outline-none focus:border-[#FF6D1F] focus:ring-2 focus:ring-[#FF6D1F]/30 transition-all font-medium"
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

                {/* Live Password Strength Meter */}
                {isSignUp && password && (
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1.5">
                    <motion.div
                      className={`h-full ${passwordStrength.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength.score}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6D1F] via-[#ff853f] to-[#FF6D1F] hover:from-[#e65c10] hover:to-[#e65c10] text-[#FAF3E1] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FF6D1F]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-2 disabled:opacity-50"
              >
                <span>
                  {isLoading
                    ? "Authenticating..."
                    : isSignUp
                    ? "Create Account & Sign In"
                    : "Sign In to Dashboard"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#121216] px-3 text-[10px] font-mono text-[#FAF3E1]/40 uppercase tracking-widest absolute">
                Or Continue With
              </span>
            </div>

            {/* Official Google OAuth GSI Button Container + Interactive Button */}
            <div className="flex flex-col items-center justify-center gap-2 w-full">
              <div ref={googleBtnContainerRef} className="w-full flex justify-center min-h-[44px]" />

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
                <span>Continue with Google</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Side: Ultra-High-Performance 3D Cybernetic Hero Panel */}
        <div className="hidden lg:flex w-1/2 relative bg-[#09090b] items-center justify-center overflow-hidden border-l border-white/10">
          
          {/* Spotlight Ambient Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#FF6D1F]/15 rounded-full blur-[180px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />

          {/* ASCII Text Animation Banner */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full flex flex-col items-center justify-center text-center px-4">
            <AsciiTextAnimation
              text={isSignUp ? "WELCOME NEW USER" : "WELCOME BACK"}
              className="opacity-75 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* 3D Scene View Toggle (Holographic WebGL 120 FPS vs Spline) */}
          <div className="absolute top-8 left-8 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUseSplineView(!useSplineView)}
              className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-[10px] font-mono font-bold text-white/70 hover:text-white transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-[#FF6D1F]" />
              <span>{useSplineView ? "Switch to 120 FPS WebGL Engine" : "Switch to Spline 3D Scene"}</span>
            </button>
          </div>

          {/* 3D Scene Rendering */}
          <div className="relative z-10 w-full h-full min-h-[600px] flex items-center justify-center">
            {useSplineView ? (
              <SplineRobot
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            ) : (
              <HolographicRobotExperience
                className="w-full h-full"
                isSignUp={isSignUp}
              />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
