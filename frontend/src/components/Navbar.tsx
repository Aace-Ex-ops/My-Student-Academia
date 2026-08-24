import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Calendar, BookOpen } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  studentId?: string;
  major?: string;
}

interface NavbarProps {
  currentUser: User | null;
  onSwitchUser: (userId: string) => void;
  users: User[];
}

export function Navbar({ currentUser, onSwitchUser, users }: NavbarProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#FAF3E1]/90 backdrop-blur-xl border-b border-[#F5E7C6] shadow-sm shadow-[#222222]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo with android-chrome-512x512 */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/android-chrome-512x512.png"
            alt="My Student Academia Logo"
            className="w-10 h-10 object-contain rounded-xl shadow-md shadow-[#FF6D1F]/20 group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-bold text-lg text-[#222222] group-hover:text-[#FF6D1F] transition-colors">
              My Student Academia
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-[#FF6D1F] font-bold -mt-1">
              Course Portal
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              isActive('/dashboard') 
                ? 'bg-[#FF6D1F] text-[#FAF3E1] shadow-sm shadow-[#FF6D1F]/20' 
                : 'text-[#222222]/80 hover:text-[#222222] hover:bg-[#F5E7C6]/60'
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${isActive('/dashboard') ? 'text-[#FAF3E1]' : 'text-[#FF6D1F]'}`} />
            Student Dashboard
          </Link>
          <Link
            to="/catalog"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              isActive('/catalog') 
                ? 'bg-[#FF6D1F] text-[#FAF3E1] shadow-sm shadow-[#FF6D1F]/20' 
                : 'text-[#222222]/80 hover:text-[#222222] hover:bg-[#F5E7C6]/60'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${isActive('/catalog') ? 'text-[#FAF3E1]' : 'text-[#FF6D1F]'}`} />
            Course Catalog
          </Link>
          <Link
            to="/timetable"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              isActive('/timetable') 
                ? 'bg-[#FF6D1F] text-[#FAF3E1] shadow-sm shadow-[#FF6D1F]/20' 
                : 'text-[#222222]/80 hover:text-[#222222] hover:bg-[#F5E7C6]/60'
            }`}
          >
            <Calendar className={`w-4 h-4 ${isActive('/timetable') ? 'text-[#FAF3E1]' : 'text-[#FF6D1F]'}`} />
            Schedule Timetable
          </Link>
        </nav>
      </div>
    </header>
  );
}
