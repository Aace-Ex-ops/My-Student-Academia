import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Download,
  BookOpen,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { CourseDocument, getCourseMaterials } from "@/lib/courseMaterialsData";
import { generateCourseDocumentPDF } from "@/lib/pdfGenerator";

interface CourseMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseCode: string;
  courseTitle: string;
  isEnrolled: boolean;
  onReadDocument: (doc: CourseDocument) => void;
  onEnrollNow?: () => void;
}

export function CourseMaterialsModal({
  isOpen,
  onClose,
  courseCode,
  courseTitle,
  isEnrolled,
  onReadDocument,
  onEnrollNow,
}: CourseMaterialsModalProps) {
  if (!isOpen) return null;

  const materials = getCourseMaterials(courseCode);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#0E0E12] border border-[#F5E7C6]/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 text-[#FAF3E1]"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-[#14141A] border-b border-[#F5E7C6]/15 flex items-center justify-between gap-4 flex-shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#FF6D1F]/20 border border-[#FF6D1F]/30 text-[#FF6D1F] font-mono text-xs font-black">
                  {courseCode}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                    isEnrolled
                      ? "bg-emerald-950/80 border border-emerald-500/30 text-emerald-400"
                      : "bg-rose-950/80 border border-rose-500/30 text-rose-400"
                  }`}
                >
                  {isEnrolled ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Unlocked • Enrolled Student
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" /> Locked • Enrollment Required
                    </>
                  )}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#FAF3E1] leading-tight">
                {courseTitle} — Academic Courseware
              </h2>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#1A1A22] hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-4">
            {!isEnrolled ? (
              <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                  <Lock className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-base text-[#FAF3E1]">
                    Restricted Study Materials
                  </h3>
                  <p className="text-xs text-[#FAF3E1]/70 max-w-md mx-auto leading-relaxed">
                    Course documents, detailed lecture notes, problem set solutions, and lab manuals for{" "}
                    <strong>{courseCode}</strong> are exclusively available to enrolled students.
                  </p>
                </div>

                {onEnrollNow && (
                  <button
                    onClick={() => {
                      onClose();
                      onEnrollNow();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-[#FF6D1F]/25 cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Quick Enroll in {courseCode} to Unlock</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-[#FAF3E1]/60 px-1 flex items-center justify-between">
                  <span>Available Courseware Documents ({materials.length})</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Full Reading & PDF Export Granted
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.map((docItem) => (
                    <div
                      key={docItem.id}
                      className="p-4 rounded-2xl bg-[#161622] border border-[#F5E7C6]/10 hover:border-[#FF6D1F]/40 transition-all flex flex-col justify-between group space-y-3 shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-md bg-gradient-to-r ${docItem.badgeColor} text-white font-black text-[10px] uppercase tracking-wider`}
                          >
                            {docItem.typeLabel}
                          </span>
                          <span className="text-[10px] font-mono text-[#FAF3E1]/50">
                            {docItem.fileSize}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-[#FAF3E1] group-hover:text-[#FF6D1F] transition-colors line-clamp-2">
                          {docItem.title}
                        </h4>

                        <p className="text-[11px] text-[#FAF3E1]/60 line-clamp-2 leading-relaxed">
                          {docItem.summary}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#F5E7C6]/10 flex items-center gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            onReadDocument(docItem);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#FF6D1F]/15 hover:bg-[#FF6D1F]/25 text-[#FF6D1F] border border-[#FF6D1F]/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Read PDF Online</span>
                        </button>

                        <button
                          onClick={() => generateCourseDocumentPDF(docItem)}
                          className="py-2 px-3.5 rounded-xl bg-[#1A1A26] hover:bg-[#252538] text-[#FAF3E1] border border-[#F5E7C6]/15 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-[#FF6D1F]" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
