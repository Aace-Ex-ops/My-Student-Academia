import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  CheckSquare,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Layers,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { User } from "@/types";
import {
  CourseQuiz,
  QuizAttempt,
  AcademicStanding,
  getEnrolledCourseQuizzes,
  getStudentQuizAttempts,
  saveQuizAttempt,
  calculateAcademicStanding,
  scoreToGpaAndGrade,
} from "@/lib/quizStorage";

interface QuizzesPageProps {
  currentUser?: User | null;
}

export function QuizzesPage({ currentUser }: QuizzesPageProps) {
  const [quizzes, setQuizzes] = useState<CourseQuiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [standing, setStanding] = useState<AcademicStanding>({
    gpa: 0.0,
    totalQuizzesTaken: 0,
    averagePercentage: 0,
    honorTitle: "Pending Quiz Evaluation",
    honorBadge: "Unranked",
    cohortPercentile: "Take course quizzes to establish your GPA & Honor Standing",
    standingColor: "zinc",
  });
  const [selectedFilter, setSelectedFilter] = useState<"all" | "completed" | "pending">("all");

  // Active Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState<CourseQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<QuizAttempt | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);
  const gpaCounterRef = useRef<HTMLSpanElement>(null);

  const effectiveUser = currentUser || (() => {
    try {
      const saved = localStorage.getItem("msa_custom_user_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  })();

  const userIdentifier = effectiveUser?.id || effectiveUser?.email || "guest";

  // Load quizzes and current attempts
  const refreshQuizData = () => {
    const available = getEnrolledCourseQuizzes(userIdentifier);
    setQuizzes(available);

    const userAttempts = getStudentQuizAttempts(userIdentifier);
    setAttempts(userAttempts);

    const currentStanding = calculateAcademicStanding(userIdentifier);
    setStanding(currentStanding);

    // Animate GPA counter
    if (gpaCounterRef.current) {
      const targetGpa = currentStanding.gpa;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetGpa,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          if (gpaCounterRef.current) {
            gpaCounterRef.current.innerText = obj.val.toFixed(2);
          }
        },
      });
    }
  };

  useEffect(() => {
    refreshQuizData();

    // Listen for storage changes from other tabs or components
    const handleStorage = () => refreshQuizData();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("msa_quiz_updated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("msa_quiz_updated", handleStorage);
    };
  }, [effectiveUser]);

  useEffect(() => {
    if (starRef.current) {
      gsap.to(starRef.current, {
        rotation: 360,
        duration: 15,
        repeat: -1,
        ease: "none",
      });
    }
  }, []);

  // Launch a quiz modal
  const handleStartQuiz = (quiz: CourseQuiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
    setLastSubmissionResult(null);
  };

  // Select an option for current question
  const handleSelectOption = (optionIndex: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  // Submit current quiz
  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });

    const total = activeQuiz.questions.length;
    const pct = Math.round((score / total) * 100);
    const { gpa, grade } = scoreToGpaAndGrade(score, total);

    const attempt: QuizAttempt = {
      quizId: activeQuiz.id,
      courseCode: activeQuiz.courseCode,
      courseTitle: activeQuiz.courseTitle,
      score,
      totalQuestions: total,
      percentage: pct,
      gpa,
      grade,
      completedAt: new Date().toISOString(),
    };

    saveQuizAttempt(userIdentifier, attempt);
    setLastSubmissionResult(attempt);
    setIsQuizSubmitted(true);
    refreshQuizData();
  };

  // Filter quizzes list
  const filteredQuizzes = quizzes.filter((q) => {
    const isCompleted = attempts.some((a) => a.quizId === q.id);
    if (selectedFilter === "completed") return isCompleted;
    if (selectedFilter === "pending") return !isCompleted;
    return true;
  });

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left select-none font-sans relative overflow-hidden"
    >
      {/* ✦ ARCHITECTURAL BLUEPRINT GRID & NEBULA BACKGROUND ✦ */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-16 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute bottom-20 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5E7C6] to-transparent" />
        <div className="absolute top-0 bottom-0 left-12 sm:left-24 w-[1px] bg-gradient-to-b from-transparent via-[#F5E7C6] to-transparent" />
      </div>

      <div className="absolute top-14 right-20 pointer-events-none z-0 opacity-40">
        <span ref={starRef} className="inline-block text-[#FF6D1F] text-xl font-serif">✦</span>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Top Header / Welcome Banner */}
        <div className="bg-[#121216]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Assessment Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FAF3E1] tracking-tight">
              Course Milestone Quizzes
            </h1>
            <p className="text-[#FAF3E1]/70 text-xs sm:text-sm mt-1 font-medium">
              Quizzes are generated based on your enrolled courses. Your Cumulative GPA starts at 0.00 and is evaluated live based on your quiz scores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/catalog"
              className="px-4 py-2.5 rounded-xl bg-[#1A1A22] hover:bg-[#222228] border border-[#F5E7C6]/15 text-[#FAF3E1] text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-[#FF6D1F]" />
              <span>Course Catalog</span>
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

        {/* Dynamic Cumulative GPA & Honor Standing Dashboard Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Cumulative GPA (Evaluated from Quizzes) */}
          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg flex flex-col justify-between hover:border-[#FF6D1F]/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#FAF3E1]/60 uppercase tracking-wider">Cumulative GPA</span>
              <div className="w-8 h-8 rounded-xl bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 flex items-center justify-center text-[#FF6D1F]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span ref={gpaCounterRef} className="text-3xl font-black text-emerald-400">
                  {standing.gpa.toFixed(2)}
                </span>
                <span className="text-sm font-extrabold text-[#FAF3E1]/50">/ 4.00</span>
              </div>
              <div className="w-full bg-[#1C1C24] h-2 rounded-full overflow-hidden mt-3 border border-[#F5E7C6]/10">
                <div
                  className="h-full bg-gradient-to-r from-[#FF6D1F] to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${(standing.gpa / 4.0) * 100}%` }}
                />
              </div>
            </div>

            <span className="text-[11px] font-bold text-[#FAF3E1]/60 mt-2.5">
              {standing.totalQuizzesTaken === 0
                ? "Evaluated based on completed quizzes"
                : `Average: ${standing.averagePercentage}% across all modules`}
            </span>
          </div>

          {/* Card 2: Academic Honor Standing */}
          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg flex flex-col justify-between hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#FAF3E1]/60 uppercase tracking-wider">Academic Honor Score</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-base font-black text-[#FAF3E1] leading-tight">
                {standing.honorTitle}
              </div>
              <div className="inline-flex items-center gap-1 mt-2 text-xs font-black text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-emerald-400" /> {standing.honorBadge}
              </div>
            </div>

            <span className="text-[11px] font-bold text-[#FAF3E1]/60 mt-2.5">
              {standing.cohortPercentile}
            </span>
          </div>

          {/* Card 3: Quizzes Completed */}
          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg flex flex-col justify-between hover:border-[#FF6D1F]/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#FAF3E1]/60 uppercase tracking-wider">Completed Quizzes</span>
              <div className="w-8 h-8 rounded-xl bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 flex items-center justify-center text-[#FF6D1F]">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-[#FAF3E1]">
                  {attempts.length}
                </span>
                <span className="text-sm font-extrabold text-[#FAF3E1]/50">/ {quizzes.length} Available</span>
              </div>
              <div className="w-full bg-[#1C1C24] h-2 rounded-full overflow-hidden mt-3 border border-[#F5E7C6]/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#FF6D1F] rounded-full transition-all duration-700"
                  style={{ width: `${quizzes.length > 0 ? (attempts.length / quizzes.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <span className="text-[11px] font-bold text-[#FAF3E1]/60 mt-2.5">
              {quizzes.length - attempts.length} assessment modules pending
            </span>
          </div>

          {/* Card 4: Evaluation Scale Reference */}
          <div className="bg-[#121216]/90 backdrop-blur-xl p-5 rounded-2xl border border-[#F5E7C6]/15 shadow-lg flex flex-col justify-between hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#FAF3E1]/60 uppercase tracking-wider">Honor Thresholds</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center text-emerald-400 font-bold">
                <span>Summa Cum Laude:</span>
                <span className="font-mono">≥ 3.80</span>
              </div>
              <div className="flex justify-between items-center text-emerald-300 font-bold">
                <span>Dean's Honor Roll:</span>
                <span className="font-mono">≥ 3.50</span>
              </div>
              <div className="flex justify-between items-center text-amber-300 font-bold">
                <span>Cum Laude:</span>
                <span className="font-mono">≥ 3.00</span>
              </div>
            </div>

            <span className="text-[11px] font-bold text-[#FAF3E1]/60 mt-2.5">
              Retakes immediately recalculate your GPA
            </span>
          </div>

        </div>

        {/* Quizzes List Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5E7C6]/15 pb-4">
            <div>
              <h2 className="text-xl font-black text-[#FAF3E1] flex items-center gap-2.5">
                <CheckSquare className="w-5 h-5 text-[#FF6D1F]" />
                <span>Enrolled Course Assessments ({quizzes.length})</span>
              </h2>
              <p className="text-xs text-[#FAF3E1]/60 mt-1">
                Take quizzes to test your grasp on enrolled topics and improve your academic standing.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#181820] rounded-xl border border-[#F5E7C6]/10 text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedFilter === "all"
                    ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-md shadow-[#FF6D1F]/20 font-black"
                    : "text-[#FAF3E1]/60 hover:text-[#FAF3E1]"
                }`}
              >
                All Quizzes ({quizzes.length})
              </button>
              <button
                onClick={() => setSelectedFilter("completed")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedFilter === "completed"
                    ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-md shadow-[#FF6D1F]/20 font-black"
                    : "text-[#FAF3E1]/60 hover:text-[#FAF3E1]"
                }`}
              >
                Completed ({attempts.length})
              </button>
              <button
                onClick={() => setSelectedFilter("pending")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedFilter === "pending"
                    ? "bg-[#FF6D1F] text-[#FAF3E1] shadow-md shadow-[#FF6D1F]/20 font-black"
                    : "text-[#FAF3E1]/60 hover:text-[#FAF3E1]"
                }`}
              >
                Pending ({quizzes.length - attempts.length})
              </button>
            </div>
          </div>

          {filteredQuizzes.length === 0 ? (
            <div className="bg-[#121216]/90 backdrop-blur-xl p-10 text-center rounded-3xl border border-[#F5E7C6]/15 shadow-xl space-y-4">
              <CheckSquare className="w-12 h-12 text-[#FAF3E1]/20 mx-auto" />
              <h3 className="font-black text-lg text-[#FAF3E1]">No Quizzes in this category</h3>
              <p className="text-xs text-[#FAF3E1]/60 max-w-sm mx-auto">
                {selectedFilter === "completed"
                  ? "You haven't completed any quizzes yet. Start taking assessments below to establish your GPA!"
                  : "All available quizzes have been completed. You can retake any quiz to boost your score."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => {
                const previousAttempt = attempts.find((a) => a.quizId === quiz.id);

                return (
                  <div
                    key={quiz.id}
                    className="bg-[#121216]/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F5E7C6]/15 shadow-2xl flex flex-col justify-between hover:border-[#FF6D1F]/50 transition-all group relative"
                  >
                    <div>
                      {/* Course Code & Difficulty Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FF6D1F]/20 border border-[#FF6D1F]/30 text-[#FF6D1F] font-mono text-xs font-black">
                          {quiz.courseCode}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1A1A22] border border-[#F5E7C6]/10 text-[#FAF3E1]/70">
                            {quiz.difficulty}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 text-[#FAF3E1]/60">
                            5 Questions
                          </span>
                        </div>
                      </div>

                      {/* Quiz Title */}
                      <h3 className="font-black text-[#FAF3E1] text-base group-hover:text-[#FF6D1F] transition-colors leading-snug">
                        {quiz.quizTitle}
                      </h3>
                      
                      <p className="text-xs text-[#FAF3E1]/60 mt-1 line-clamp-1">
                        Course: {quiz.courseTitle}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#F5E7C6]/10 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[#FAF3E1]/70">
                          <span className="font-medium flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#FF6D1F]" /> Focus:
                          </span>
                          <span className="font-bold text-[#FAF3E1] truncate max-w-[170px]">{quiz.topic}</span>
                        </div>

                        {/* Status row */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-medium text-[#FAF3E1]/60">Status:</span>
                          {previousAttempt ? (
                            <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {previousAttempt.score}/{previousAttempt.totalQuestions} ({previousAttempt.percentage}%) • GPA {previousAttempt.gpa.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-400/80 bg-amber-950/50 border border-amber-500/20 px-2 py-0.5 rounded-md">
                              Not Attempted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-4 border-t border-[#F5E7C6]/10">
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                          previousAttempt
                            ? "bg-[#1A1A22] hover:bg-[#FF6D1F]/20 text-[#FAF3E1] hover:text-[#FF6D1F] border border-[#F5E7C6]/15 hover:border-[#FF6D1F]/40"
                            : "bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] shadow-[#FF6D1F]/25 hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                      >
                        {previousAttempt ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 text-[#FF6D1F]" />
                            <span>Retake Quiz to Boost GPA</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Start Assessment (5 Qs)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ✦ INTERACTIVE MODAL: LIVE QUIZ RUNNER ✦ */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121218] border border-[#F5E7C6]/20 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F5E7C6]/15 pb-4 mb-5">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-[#FF6D1F]/20 text-[#FF6D1F] font-mono text-xs font-black">
                  {activeQuiz.courseCode} Milestone Quiz
                </span>
                <h3 className="text-lg font-black text-[#FAF3E1] mt-1">
                  {activeQuiz.quizTitle}
                </h3>
              </div>

              <button
                onClick={() => setActiveQuiz(null)}
                className="text-[#FAF3E1]/60 hover:text-[#FAF3E1] p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* RESULTS VIEW */}
            {isQuizSubmitted && lastSubmissionResult ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6D1F] to-amber-400 flex items-center justify-center text-white mx-auto shadow-xl shadow-[#FF6D1F]/25">
                  <Award className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-2xl font-black text-[#FAF3E1]">
                    Assessment Completed!
                  </h4>
                  <p className="text-xs text-[#FAF3E1]/70 mt-1">
                    Your answers were evaluated and your academic standing has been recalculated.
                  </p>
                </div>

                {/* Score Summary Box */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-[#181822] rounded-2xl border border-[#F5E7C6]/15 max-w-md mx-auto">
                  <div>
                    <span className="text-[10px] text-[#FAF3E1]/60 font-bold uppercase block">Score</span>
                    <span className="text-xl font-black text-emerald-400">
                      {lastSubmissionResult.score} / {lastSubmissionResult.totalQuestions}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#FAF3E1]/60 font-bold uppercase block">Grade</span>
                    <span className="text-xl font-black text-[#FF6D1F]">
                      {lastSubmissionResult.grade}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#FAF3E1]/60 font-bold uppercase block">Module GPA</span>
                    <span className="text-xl font-black text-emerald-400">
                      {lastSubmissionResult.gpa.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Cumulative GPA Update Callout */}
                <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl max-w-md mx-auto text-xs text-emerald-300 flex items-center justify-center gap-2 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Cumulative GPA is now <strong>{standing.gpa.toFixed(2)}</strong> ({standing.honorTitle})</span>
                </div>

                {/* Answers Review list */}
                <div className="text-left space-y-3 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                  <h5 className="font-bold text-xs text-[#FAF3E1]/80 uppercase tracking-wider mb-2">Question Breakdown:</h5>
                  {activeQuiz.questions.map((q, idx) => {
                    const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-xl border text-xs ${
                          isCorrect
                            ? "bg-emerald-950/30 border-emerald-500/20 text-[#FAF3E1]"
                            : "bg-rose-950/30 border-rose-500/20 text-[#FAF3E1]"
                        }`}
                      >
                        <div className="flex items-start gap-2 font-bold">
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div>{idx + 1}. {q.prompt}</div>
                            <div className="text-[11px] text-[#FAF3E1]/70 font-normal mt-1">
                              <strong>Correct answer:</strong> {q.options[q.correctAnswer]}
                            </div>
                            <div className="text-[10px] text-amber-300/80 mt-0.5">
                              {q.explanation}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] text-xs font-black uppercase tracking-wider shadow-lg shadow-[#FF6D1F]/25 cursor-pointer transition-all"
                >
                  Return to Quizzes Dashboard
                </button>
              </div>
            ) : (
              /* ACTIVE QUESTION VIEW */
              <div className="space-y-6">
                {/* Progress Indicator */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-[#FAF3E1]/70 mb-2">
                    <span>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
                    <span className="text-[#FF6D1F] font-mono">
                      {Math.round(((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100)}% Completed
                    </span>
                  </div>
                  <div className="w-full bg-[#1C1C24] h-2 rounded-full overflow-hidden border border-[#F5E7C6]/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6D1F] to-amber-400 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="p-4 bg-[#181822] rounded-2xl border border-[#F5E7C6]/15">
                  <h4 className="font-black text-sm sm:text-base text-[#FAF3E1] leading-snug">
                    {activeQuiz.questions[currentQuestionIndex].prompt}
                  </h4>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {activeQuiz.questions[currentQuestionIndex].options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-3.5 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer border ${
                          isSelected
                            ? "bg-[#FF6D1F]/20 border-[#FF6D1F] text-[#FAF3E1] shadow-md shadow-[#FF6D1F]/20"
                            : "bg-[#181822] hover:bg-[#1E1E2C] border-[#F5E7C6]/10 text-[#FAF3E1]/80 hover:text-[#FAF3E1]"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                            isSelected
                              ? "bg-[#FF6D1F] border-[#FF6D1F] text-[#FAF3E1]"
                              : "border-[#F5E7C6]/30 text-[#FAF3E1]/60"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-[#F5E7C6]/15">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 rounded-xl bg-[#181822] hover:bg-[#20202C] disabled:opacity-30 text-xs font-bold text-[#FAF3E1] border border-[#F5E7C6]/10 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(activeQuiz.questions.length - 1, prev + 1))}
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      className="px-5 py-2 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] disabled:opacity-40 text-xs font-black text-[#FAF3E1] shadow-lg shadow-[#FF6D1F]/20 cursor-pointer disabled:cursor-not-allowed transition-all"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(selectedAnswers).length < activeQuiz.questions.length}
                      className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-xs font-black text-[#FAF3E1] shadow-lg shadow-emerald-500/20 cursor-pointer disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit & Evaluate GPA</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
