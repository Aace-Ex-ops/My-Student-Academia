import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  UserCheck,
  TrendingUp,
  ChevronRight,
  PanelLeftClose,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/types";

interface VerticalMenuProps {
  currentUser?: User | null;
  onSwitchUser?: (userId: string) => void;
  users?: User[];
}

export function MenuVertical({ currentUser, onSwitchUser, users = [] }: VerticalMenuProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: GraduationCap,
    },
    {
      label: "Course Catalog",
      path: "/catalog",
      icon: BookOpen,
    },
    {
      label: "Performance Tracker",
      path: "/performance",
      icon: TrendingUp,
    },
    {
      label: "Available Faculty",
      path: "/instructor",
      icon: UserCheck,
    },
  ];

  return (
    <>
      {/* Mobile Top Floating Toggle Bar (for small screens) */}
      <div className="md:hidden sticky top-0 z-50 bg-[#0E0E12] border-b border-[#F5E7C6]/15 px-4 py-3 flex items-center justify-between shadow-md">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/android-chrome-512x512.png"
            alt="My Student Academia Logo"
            className="w-8 h-8 rounded-lg object-contain shadow-md shadow-[#FF6D1F]/20"
          />
          <span className="font-black text-sm text-[#FAF3E1] uppercase tracking-wider">My Student Academia</span>
        </Link>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-[#18181E] border border-[#F5E7C6]/20 text-[#FAF3E1] hover:text-[#FF6D1F] transition-colors"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Desktop Vertical Sidebar */}
      <aside
        className={cn(
          "bg-[#0E0E12] border-r border-[#F5E7C6]/15 h-screen sticky top-0 flex flex-col justify-between p-4 shadow-xl z-40 flex-shrink-0 select-none transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          /* Mobile Drawer Responsive positioning */
          "hidden md:flex",
          isMobileOpen && "!flex fixed left-0 top-0 w-64 z-50 shadow-2xl"
        )}
      >
        {/* Top Header Section: Brand Logo & Navigation Items */}
        <div className="space-y-6">
          {/* Header Row with Brand & Collapse Button */}
          <div className={cn("flex items-center py-1", isCollapsed ? "justify-center" : "justify-between px-1")}>
            {!isCollapsed ? (
              <>
                <Link to="/" className="flex items-center gap-3 group min-w-0">
                  <img
                    src="/android-chrome-512x512.png"
                    alt="My Student Academia Logo"
                    className="w-9 h-9 rounded-xl object-contain shadow-md shadow-[#FF6D1F]/20 group-hover:scale-105 transition-transform flex-shrink-0"
                  />

                  <div className="truncate">
                    <span className="font-black text-xs text-[#FAF3E1] group-hover:text-[#FF6D1F] transition-colors leading-tight block truncate uppercase tracking-wider">
                      My Student
                    </span>
                    <span className="font-black text-xs text-[#FF6D1F] leading-tight block truncate uppercase tracking-wider">
                      Academia
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-2 rounded-xl bg-[#18181E] hover:bg-[#222228] text-[#FAF3E1]/80 hover:text-[#FAF3E1] border border-[#F5E7C6]/15 transition-all cursor-pointer shadow-sm hidden md:flex items-center justify-center flex-shrink-0"
                  title="Collapse Sidebar Menu"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-11 h-11 rounded-xl bg-[#18181E] hover:bg-[#222228] border border-[#F5E7C6]/15 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
                title="Expand Sidebar Menu"
              >
                <img
                  src="/android-chrome-512x512.png"
                  alt="Expand Sidebar"
                  className="w-7 h-7 object-contain"
                />
              </button>
            )}
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1.5 pt-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all group relative cursor-pointer",
                    isActive
                      ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-lg shadow-[#FF6D1F]/30 font-black"
                      : "text-[#FAF3E1]/70 hover:text-[#FAF3E1] hover:bg-[#18181E] hover:border hover:border-[#F5E7C6]/15",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-[#FAF3E1]" : "text-[#FF6D1F]")} />

                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left uppercase tracking-wider text-[11px] font-bold">{item.label}</span>
                  )}

                  {!isCollapsed && isActive && (
                    <ChevronRight className="w-4 h-4 text-[#FAF3E1] opacity-90" />
                  )}

                  {/* Tooltip when collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#18181E] border border-[#F5E7C6]/20 text-[#FAF3E1] text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
