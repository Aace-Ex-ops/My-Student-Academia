import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
  Award,
} from "lucide-react";

interface ProfileDropdownProps {
  currentUser?: any;
  onSwitchUser?: (userId: string) => void;
  users?: any[];
  isCollapsed?: boolean;
}

const getInitials = (name: string) => {
  if (!name) return "AC";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const AVATAR_ICON_MAP: Record<string, { icon: string; bg: string }> = {
  scholar: { icon: "👨‍🎓", bg: "from-amber-500 to-orange-600" },
  coder: { icon: "💻", bg: "from-blue-600 to-cyan-600" },
  developer: { icon: "💻", bg: "from-blue-600 to-cyan-600" },
  researcher: { icon: "🔬", bg: "from-emerald-600 to-teal-600" },
  innovator: { icon: "🚀", bg: "from-purple-600 to-pink-600" },
  astronaut: { icon: "👨‍🚀", bg: "from-purple-600 to-indigo-600" },
  cyberpunk: { icon: "💻", bg: "from-blue-600 to-cyan-600" },
  minimalist: { icon: "✨", bg: "from-emerald-600 to-teal-500" },
  Scholar: { icon: "👨‍🎓", bg: "from-amber-500 to-orange-600" },
  Developer: { icon: "💻", bg: "from-blue-600 to-cyan-600" },
  Coder: { icon: "💻", bg: "from-blue-600 to-cyan-600" },
  Researcher: { icon: "🔬", bg: "from-emerald-600 to-teal-600" },
  Innovator: { icon: "🚀", bg: "from-purple-600 to-pink-600" },
  Astronaut: { icon: "👨‍🚀", bg: "from-purple-600 to-indigo-600" },
  Cyberpunk: { icon: "💻", bg: "from-blue-600 to-cyan-600" },
  Minimalist: { icon: "✨", bg: "from-emerald-600 to-teal-500" },
};

export const AvatarDisplay = ({ user, size = "w-8 h-8" }: { user: any; size?: string }) => {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(user?.name || "Student");

  // 1. Check if user avatar is an image URL (Google photo or custom uploaded photo)
  const photoUrl = user?.avatarUrl || user?.googlePhotoUrl || (user?.avatar?.startsWith("http") ? user.avatar : null);

  if (!imgError && photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={user?.name || "Avatar"}
        onError={() => setImgError(true)}
        className={`${size} rounded-2xl object-cover border-2 border-[#FF6D1F]/50 shadow-md flex-shrink-0`}
      />
    );
  }

  // 2. Check if user avatar is an onboarding avatar persona ID or emoji
  const avatarId = user?.avatarId || user?.avatar;
  const avatarPersona = AVATAR_ICON_MAP[avatarId] || (user?.avatarIcon ? { icon: user.avatarIcon, bg: user.avatarBg || "from-purple-600 to-indigo-600" } : null);

  if (avatarPersona || (user?.avatar && user.avatar.length <= 4)) {
    const icon = avatarPersona?.icon || user?.avatar || "👨‍🎓";
    const bg = avatarPersona?.bg || user?.avatarBg || "from-purple-600 to-indigo-600";

    return (
      <div
        className={`${size} rounded-2xl bg-gradient-to-tr ${bg} text-[#FAF3E1] flex items-center justify-center text-sm shadow-md border border-white/20 flex-shrink-0`}
      >
        {icon}
      </div>
    );
  }

  // 3. Fallback initials badge
  return (
    <div
      className={`${size} rounded-2xl bg-gradient-to-tr from-[#1E1E28] via-[#FF6D1F] to-[#FF6D1F] text-[#FAF3E1] flex items-center justify-center font-black text-xs shadow-md shadow-[#FF6D1F]/20 border border-[#FF6D1F]/40 flex-shrink-0`}
    >
      {initials}
    </div>
  );
};

export function ProfileDropdown({
  currentUser,
  onSwitchUser,
  users = [],
  isCollapsed = false,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    setIsOpen(false);
    localStorage.removeItem("msa_custom_user_profile");
    // Reload the page to clear any React state in App.tsx
    window.location.href = "/";
  };

  const activeUser = currentUser || {
    name: "Alex Chen",
    role: "STUDENT",
    studentId: "STU-2026-8942",
    major: "Computer Science",
    avatar: "Astronaut",
  };

  return (
    <div className="relative inline-block text-left select-none">
      
      {/* Sleek Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-[#121216] hover:bg-[#1A1A22] border border-[#F5E7C6]/20 hover:border-[#FF6D1F] transition-all cursor-pointer shadow-md group"
      >
        {/* Avatar Image / Persona Badge */}
        <div className="relative flex-shrink-0">
          <AvatarDisplay user={activeUser} size="w-8 h-8" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#121216]" />
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-extrabold text-[#FAF3E1] truncate leading-tight group-hover:text-[#FF6D1F] transition-colors">
              {activeUser.name}
            </span>
            <span className="text-[10px] font-bold text-[#FF6D1F] uppercase tracking-wider leading-tight">
              {activeUser.role}
            </span>
          </div>
        )}

        <ChevronDown
          className={`w-4 h-4 text-[#FAF3E1]/60 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#FF6D1F]" : ""
          }`}
        />
      </button>

      {/* Animated Dropdown Menu Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 rounded-3xl bg-[#121216]/95 backdrop-blur-2xl border border-[#F5E7C6]/20 shadow-2xl p-2.5 z-50 space-y-1 text-left"
          >
            
            {/* Header Badge */}
            <div className="p-3 rounded-2xl bg-[#1A1A22] border border-[#F5E7C6]/15 mb-2">
              <div className="flex items-center gap-3 mb-2">
                <AvatarDisplay user={activeUser} size="w-10 h-10" />
                <div className="min-w-0 text-left">
                  <h4 className="text-xs font-black text-[#FAF3E1] truncate">
                    {activeUser.name}
                  </h4>
                  {activeUser.username && (
                    <span className="text-[10px] font-mono font-bold text-[#FF6D1F] block truncate">
                      {activeUser.username.startsWith("@") ? activeUser.username : `@${activeUser.username}`}
                    </span>
                  )}
                  {activeUser.email && (
                    <span className="text-[10px] text-[#FAF3E1]/70 block truncate">
                      {activeUser.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-[10px] font-semibold text-[#FAF3E1]/70 bg-[#121216] px-2.5 py-1 rounded-xl border border-[#F5E7C6]/10 flex justify-between items-center">
                <span>ID: {activeUser.studentId || "STU-2026-001"}</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
            </div>

            {/* Menu Option 1: Profile */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-[#FAF3E1]/80 hover:text-[#FAF3E1] hover:bg-[#1A1A22] transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-[#FF6D1F]" />
              <span>Student Profile</span>
            </button>

            {/* Menu Option 2: Term Status */}
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#FAF3E1]/80 hover:bg-[#1A1A22] transition-colors">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#FF6D1F]" />
                <span>Academic Term</span>
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Fall 2026
              </span>
            </div>

            {/* Menu Option 3: Credit Limit */}
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#FAF3E1]/80 hover:bg-[#1A1A22] transition-colors">
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-[#FF6D1F]" />
                <span>Max Credit Load</span>
              </div>
              <span className="text-[10px] font-extrabold bg-[#FF6D1F]/20 text-[#FF6D1F] border border-[#FF6D1F]/30 px-2 py-0.5 rounded-md">
                18 Max
              </span>
            </div>

            {/* Menu Option 4: Settings */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-[#FAF3E1]/80 hover:text-[#FAF3E1] hover:bg-[#1A1A22] transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#FAF3E1]/70" />
              <span>Account Settings</span>
            </button>

            {/* Menu Option 5: Security */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-[#FAF3E1]/80 hover:text-[#FAF3E1] hover:bg-[#1A1A22] transition-colors cursor-pointer"
            >
              <Shield className="w-4 h-4 text-[#FAF3E1]/70" />
              <span>Terms & Policies</span>
            </button>

            {/* Menu Option 6: Sign Out */}
            <div className="pt-1 border-t border-[#F5E7C6]/15">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/40 hover:bg-rose-950/70 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
