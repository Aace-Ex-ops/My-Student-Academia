import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Send,
  Search,
  ArrowLeft,
  CheckCheck,
  Sparkles,
  UserCheck,
  BookOpen,
  Clock,
  Trash2,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  GraduationCap
} from "lucide-react";
import { User } from "@/types";
import {
  FacultyContact,
  ChatMessage,
  resolveUserFaculty,
  getThreadMessages,
  saveThreadMessage,
  clearThreadMessages,
  generateTeacherAutoResponse,
} from "@/lib/facultyChatData";

interface FacultyChatPageProps {
  currentUser?: User | null;
}

export function FacultyChatPage({ currentUser }: FacultyChatPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [facultyList, setFacultyList] = useState<FacultyContact[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyContact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEnrolledOnly, setFilterEnrolledOnly] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveUser = currentUser || (() => {
    try {
      const saved = localStorage.getItem("msa_custom_user_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  })();

  // 1. Load faculty directory & resolve enrolled instructors
  useEffect(() => {
    const list = resolveUserFaculty(effectiveUser);
    setFacultyList(list);

    // Check if faculty query param is passed in URL
    const requestedFacultyName = searchParams.get("faculty");
    if (requestedFacultyName) {
      const match = list.find(
        (f) =>
          f.name.toLowerCase() === requestedFacultyName.toLowerCase() ||
          f.name.toLowerCase().includes(requestedFacultyName.toLowerCase())
      );
      if (match) {
        setSelectedFaculty(match);
        setShowMobileChat(true);
        return;
      }
    }

    // Default to the first faculty member in the list
    if (list.length > 0 && !selectedFaculty) {
      setSelectedFaculty(list[0]);
    }
  }, [effectiveUser, searchParams]);

  // 2. Load conversation thread when active faculty changes
  useEffect(() => {
    if (!selectedFaculty) return;
    const thread = getThreadMessages(effectiveUser, selectedFaculty);
    setMessages(thread);
    setIsTyping(false);
  }, [selectedFaculty, effectiveUser]);

  // 3. Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle selecting a faculty member from the list
  const handleSelectFaculty = (faculty: FacultyContact) => {
    setSelectedFaculty(faculty);
    setSearchParams({ faculty: faculty.name });
    setShowMobileChat(true);
  };

  // Send student message and trigger simulated intelligent teacher response
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || !selectedFaculty) return;

    const studentName = effectiveUser?.name || "Student";
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "student",
      senderName: studentName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      courseContext: selectedFaculty.courses[0]?.code,
      status: "delivered",
    };

    // Save and update message thread
    const updated = saveThreadMessage(effectiveUser, selectedFaculty.name, newMessage);
    setMessages(updated);
    setInputValue("");

    // Simulate realistic typing and teacher pedagogical response
    setIsTyping(true);
    const delay = Math.min(2200, Math.max(1100, text.length * 20));

    setTimeout(() => {
      const teacherResponseText = generateTeacherAutoResponse(
        selectedFaculty,
        text,
        studentName
      );

      const teacherMsg: ChatMessage = {
        id: `msg-fac-${Date.now()}`,
        sender: "faculty",
        senderName: selectedFaculty.name,
        text: teacherResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        courseContext: selectedFaculty.courses[0]?.code,
        status: "read",
      };

      const withTeacherReply = saveThreadMessage(effectiveUser, selectedFaculty.name, teacherMsg);
      setMessages(withTeacherReply);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (!selectedFaculty) return;
    if (window.confirm(`Clear chat conversation history with ${selectedFaculty.name}?`)) {
      clearThreadMessages(effectiveUser, selectedFaculty.name);
      const reseeded = getThreadMessages(effectiveUser, selectedFaculty);
      setMessages(reseeded);
    }
  };

  // Filter faculty members based on search and enrollment filter
  const filteredFaculty = facultyList.filter((f) => {
    if (filterEnrolledOnly && !f.isEnrolled) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.title.toLowerCase().includes(q) ||
      f.courses.some((c) => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q))
    );
  });

  // Doubt query starter pills
  const doubtStarters = [
    { label: "Assignment deadline & requirements", query: "Could you clarify the upcoming assignment deadline and key test cases?" },
    { label: "Office hours consultation", query: "When are your office hours this week for a code review?" },
    { label: "Course notes & formula sheets", query: "Where can I find the recommended notes and formula summaries for this module?" },
    { label: "Exam & quiz preparation", query: "What core topics and problem types should we prioritize for the upcoming assessment?" },
    { label: "Code doubt & debugging help", query: "I have a doubt regarding computational complexity and edge cases in the recent lecture." },
  ];

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left select-none font-sans relative overflow-hidden">
      {/* ✦ ARCHITECTURAL BLUEPRINT GRID & NEBULA BACKGROUND ✦ */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute bottom-20 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 left-12 sm:left-24 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Welcome Banner - Identical styling to InstructorPage and Dashboard */}
        <div className="bg-[#121216]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Direct Messaging</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FAF3E1] tracking-tight">
              Faculty Consultation Hub
            </h1>
            <p className="text-[#FAF3E1]/70 text-xs sm:text-sm mt-1 font-medium">
              Direct, encrypted 1-on-1 academic consultation with your professors and department chairs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/instructor"
              className="px-4 py-2.5 rounded-xl bg-[#1A1A22] hover:bg-[#222228] border border-[#F5E7C6]/15 text-[#FAF3E1] text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-[#FF6D1F]" />
              <span>Available Faculty</span>
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2.5 rounded-xl bg-[#FF6D1F]/20 hover:bg-[#FF6D1F]/30 border border-[#FF6D1F]/40 text-[#FF6D1F] text-xs font-black flex items-center gap-2 transition-all shadow-sm"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Main Split Chat Layout - Harmonious with all pages */}
        <div className="bg-[#121216]/90 backdrop-blur-xl rounded-3xl border border-[#F5E7C6]/15 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[640px] max-h-[75vh] w-full min-w-0">
          
          {/* LEFT SIDEBAR: Faculty Contact Roster */}
          <div
            className={`w-full md:w-72 lg:w-80 border-r border-[#F5E7C6]/15 flex flex-col bg-[#0E0E13] flex-shrink-0 min-w-0 h-full overflow-hidden ${
              showMobileChat ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search and Filters Header */}
            <div className="p-3 border-b border-[#F5E7C6]/10 space-y-2.5 flex-shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#FAF3E1]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search faculty or course..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#181820] border border-[#F5E7C6]/15 rounded-xl text-xs text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-[#FF6D1F] transition-colors"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-[#181820] rounded-xl border border-[#F5E7C6]/10 text-xs font-bold">
                <button
                  onClick={() => setFilterEnrolledOnly(false)}
                  className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer text-[11px] ${
                    !filterEnrolledOnly
                      ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-md shadow-[#FF6D1F]/20 font-black"
                      : "text-[#FAF3E1]/60 hover:text-[#FAF3E1]"
                  }`}
                >
                  All Faculty ({facultyList.length})
                </button>
                <button
                  onClick={() => setFilterEnrolledOnly(true)}
                  className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer text-[11px] ${
                    filterEnrolledOnly
                      ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-md shadow-[#FF6D1F]/20 font-black"
                      : "text-[#FAF3E1]/60 hover:text-[#FAF3E1]"
                  }`}
                >
                  My Enrolled ({facultyList.filter((f) => f.isEnrolled).length})
                </button>
              </div>
            </div>

            {/* Faculty List Scrollable View */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#F5E7C6]/5 custom-scrollbar">
              {filteredFaculty.length === 0 ? (
                <div className="p-6 text-center text-[#FAF3E1]/50 space-y-1.5">
                  <UserCheck className="w-7 h-7 mx-auto opacity-30 text-[#FF6D1F]" />
                  <p className="text-xs font-bold">No instructors found</p>
                  <p className="text-[10px] text-[#FAF3E1]/40">
                    Try adjusting your search terms.
                  </p>
                </div>
              ) : (
                filteredFaculty.map((faculty) => {
                  const isSelected = selectedFaculty?.name === faculty.name;
                  const primaryCourse = faculty.courses[0];

                  return (
                    <button
                      key={faculty.id}
                      onClick={() => handleSelectFaculty(faculty)}
                      className={`w-full p-3 text-left flex items-start gap-2.5 transition-all cursor-pointer group relative ${
                        isSelected
                          ? "bg-[#FF6D1F]/15 border-l-4 border-l-[#FF6D1F]"
                          : "hover:bg-[#181820]"
                      }`}
                    >
                      {/* Avatar with status indicator */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={faculty.avatar}
                          alt={faculty.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#F5E7C6]/15 group-hover:border-[#FF6D1F]/50 transition-colors"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0E0E13] ${
                            faculty.status === "Online" ? "bg-emerald-500" : "bg-amber-400"
                          }`}
                          title={faculty.status}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h3
                            className={`font-black text-xs truncate ${
                              isSelected ? "text-[#FF6D1F]" : "text-[#FAF3E1] group-hover:text-[#FF6D1F]"
                            }`}
                          >
                            {faculty.name}
                          </h3>
                          {faculty.isEnrolled && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-black uppercase tracking-wider flex-shrink-0">
                              Enrolled
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-[#FAF3E1]/60 truncate font-medium leading-tight">
                          {faculty.title}
                        </p>

                        {primaryCourse && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[9px]">
                            <span className="px-1.5 py-0.5 rounded bg-[#FF6D1F]/15 text-[#FF6D1F] font-mono font-bold flex-shrink-0">
                              {primaryCourse.code}
                            </span>
                            <span className="text-[#FAF3E1]/50 truncate">{primaryCourse.title}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT VIEWPORT: Active Direct Message Thread */}
          <div
            className={`flex-1 min-w-0 flex flex-col bg-[#121216] relative h-full overflow-hidden ${
              !showMobileChat ? "hidden md:flex" : "flex"
            }`}
          >
            {selectedFaculty ? (
              <>
                {/* DM Header */}
                <div className="px-4 py-3 border-b border-[#F5E7C6]/15 bg-[#14141A] flex items-center justify-between gap-3 flex-shrink-0 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="md:hidden p-1.5 rounded-xl bg-[#1A1A22] border border-[#F5E7C6]/15 text-[#FAF3E1] hover:text-[#FF6D1F] transition-colors flex-shrink-0"
                      title="Back to Faculty Roster"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="relative flex-shrink-0">
                      <img
                        src={selectedFaculty.avatar}
                        alt={selectedFaculty.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border-2 border-[#FF6D1F]/40"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#14141A] ${
                          selectedFaculty.status === "Online" ? "bg-emerald-500" : "bg-amber-400"
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-black text-xs sm:text-sm text-[#FAF3E1] truncate">
                          {selectedFaculty.name}
                        </h2>
                        {selectedFaculty.isEnrolled && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-wider flex-shrink-0">
                            Your Instructor
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#FAF3E1]/70 mt-0.5 truncate">
                        <span className="text-[#FF6D1F] font-bold truncate">{selectedFaculty.title}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:flex text-emerald-400 font-semibold items-center gap-1 truncate">
                          <Clock className="w-3 h-3 flex-shrink-0" /> {selectedFaculty.officeHours}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={handleClearHistory}
                      className="p-2 rounded-xl bg-[#1A1A22] hover:bg-rose-950/40 text-[#FAF3E1]/60 hover:text-rose-400 border border-[#F5E7C6]/10 hover:border-rose-500/30 transition-all cursor-pointer shadow-sm"
                      title="Reset Conversation History"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Course Context Banner */}
                {selectedFaculty.courses.length > 0 && (
                  <div className="px-4 py-2 bg-[#181822] border-b border-[#F5E7C6]/10 flex items-center justify-between gap-3 text-xs flex-shrink-0 min-w-0">
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-0.5 min-w-0 flex-1">
                      <span className="text-[#FAF3E1]/60 font-bold flex-shrink-0 flex items-center gap-1 text-[11px]">
                        <BookOpen className="w-3.5 h-3.5 text-[#FF6D1F]" /> Active Curriculum:
                      </span>
                      {selectedFaculty.courses.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] font-mono font-bold text-[10px] flex-shrink-0 truncate max-w-[280px]"
                        >
                          {c.code} – {c.title}
                        </span>
                      ))}
                    </div>

                    <Link
                      to="/dashboard"
                      className="text-[#FF6D1F] hover:underline font-bold text-[10px] sm:text-[11px] whitespace-nowrap flex items-center gap-1 flex-shrink-0"
                    >
                      <span>Study Notes & PDFs</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Messages Viewport - Flex 1 & Scrolls Cleanly */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3.5 custom-scrollbar">
                  {/* Date Badge */}
                  <div className="text-center my-1">
                    <span className="px-3 py-0.5 rounded-full bg-[#1A1A22] border border-[#F5E7C6]/15 text-[10px] font-bold text-[#FAF3E1]/60 uppercase tracking-wider">
                      Academic Direct Channel • End-to-End Encrypted
                    </span>
                  </div>

                  {messages.map((msg) => {
                    const isStudent = msg.sender === "student";

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isStudent ? "justify-end" : "justify-start"}`}
                      >
                        {!isStudent && (
                          <img
                            src={selectedFaculty.avatar}
                            alt={selectedFaculty.name}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover border border-[#FF6D1F]/30 flex-shrink-0 mt-1"
                          />
                        )}

                        <div className="max-w-[88%] sm:max-w-[75%] space-y-1">
                          <div className={`flex items-center gap-2 px-1 ${isStudent ? "justify-end" : "justify-start"}`}>
                            <span className="text-[9px] font-bold text-[#FAF3E1]/50">
                              {isStudent ? "You" : selectedFaculty.name}
                            </span>
                            <span className="text-[9px] text-[#FAF3E1]/40">{msg.timestamp}</span>
                          </div>

                          <div
                            className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words ${
                              isStudent
                                ? "bg-gradient-to-r from-[#FF6D1F] to-[#e65c10] text-[#FAF3E1] rounded-tr-none shadow-md shadow-[#FF6D1F]/20 font-medium"
                                : "bg-[#181822] text-[#FAF3E1] border border-[#F5E7C6]/15 rounded-tl-none shadow-sm font-sans"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>

                          {isStudent && (
                            <div className="flex justify-end pr-1 text-emerald-400 text-[9px] font-bold items-center gap-1">
                              <CheckCheck className="w-3 h-3" />
                              <span>Delivered to Instructor</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-2.5 items-center">
                      <img
                        src={selectedFaculty.avatar}
                        alt={selectedFaculty.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover border border-[#FF6D1F]/30 flex-shrink-0"
                      />
                      <div className="bg-[#181822] border border-[#F5E7C6]/15 px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                        <span className="text-xs text-[#FAF3E1]/70 font-bold">{selectedFaculty.name} is typing</span>
                        <div className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6D1F] animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6D1F] animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6D1F] animate-bounce" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Doubt Starters Carousel - Compact & Scrollable */}
                <div className="px-3 py-1.5 border-t border-[#F5E7C6]/10 bg-[#101016] flex-shrink-0 min-w-0">
                  <div className="flex items-center gap-2 overflow-x-auto pb-0.5 custom-scrollbar min-w-0">
                    <span className="text-[10px] font-black text-[#FF6D1F] uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
                      <Sparkles className="w-3 h-3" /> Quick Queries:
                    </span>
                    {doubtStarters.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.query)}
                        className="px-2 py-0.5 rounded-lg bg-[#1A1A24] hover:bg-[#FF6D1F]/20 text-[#FAF3E1]/80 hover:text-[#FAF3E1] border border-[#F5E7C6]/10 hover:border-[#FF6D1F]/40 text-[10px] font-medium whitespace-nowrap transition-all cursor-pointer shadow-sm flex-shrink-0"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Input Bar - Always Pinned & Perfectly Visible */}
                <div className="p-3 sm:p-3.5 border-t border-[#F5E7C6]/15 bg-[#14141A] flex-shrink-0 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative flex-1 min-w-0">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message ${selectedFaculty.name} about ${selectedFaculty.courses[0]?.code || "course concepts"}...`}
                        className="w-full pl-3.5 pr-3 py-2 sm:py-2.5 bg-[#181822] border border-[#F5E7C6]/20 rounded-xl text-xs sm:text-sm text-[#FAF3E1] placeholder-[#FAF3E1]/40 focus:outline-none focus:border-[#FF6D1F] transition-all shadow-inner"
                      />
                    </div>

                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isTyping}
                      className="p-2 sm:p-2.5 bg-[#FF6D1F] hover:bg-[#e65c10] disabled:opacity-40 disabled:hover:bg-[#FF6D1F] text-[#FAF3E1] rounded-xl transition-all shadow-md shadow-[#FF6D1F]/20 cursor-pointer disabled:cursor-not-allowed flex-shrink-0 hover:scale-105 active:scale-95"
                      title="Send Consultation Message (Enter)"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#FAF3E1]/60 space-y-3">
                <UserCheck className="w-12 h-12 text-[#FAF3E1]/20" />
                <h3 className="font-black text-lg text-[#FAF3E1]">Select an Instructor</h3>
                <p className="text-xs max-w-sm">
                  Choose a faculty member from the directory on the left to start your 1-on-1 academic consultation.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
