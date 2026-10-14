import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldAlert, ArrowRight, X, Sparkles, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudyMaterialLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseCode?: string;
  courseTitle?: string;
  onEnrollNow?: () => void;
}

export function StudyMaterialLockedModal({
  isOpen,
  onClose,
  courseCode = "COURSE",
  courseTitle = "Selected Course",
  onEnrollNow,
}: StudyMaterialLockedModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleEnrollClick = () => {
    onClose();
    if (onEnrollNow) {
      onEnrollNow();
    } else {
      navigate("/catalog");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md bg-[#121218] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-center space-y-6 text-[#FAF3E1] overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Glowing Lock Badge */}
          <div className="relative mx-auto w-16 h-16 rounded-3xl bg-rose-500/15 border-2 border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-950/50">
            <Lock className="w-8 h-8 text-rose-400 stroke-[2.2]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 animate-ping opacity-60" />
          </div>

          {/* Title & Course Badge */}
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-black uppercase tracking-wider inline-block">
              {courseCode} • Access Restricted
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#FAF3E1]">
              Enrolled Students Only
            </h2>
            <p className="text-xs sm:text-sm text-[#FAF3E1]/70 leading-relaxed font-medium">
              Official lecture compendiums, full-length notes, lab manuals, and problem sets for{" "}
              <strong className="text-[#FAF3E1]">{courseTitle}</strong> are accessible exclusively to officially registered students.
            </p>
          </div>

          {/* Security & Access Banner */}
          <div className="p-4 rounded-2xl bg-[#1A1A24] border border-[#F5E7C6]/10 text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#FF6D1F] font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>Digital Rights & Academic Protocol</span>
            </div>
            <p className="text-[#FAF3E1]/60 text-[11px] leading-relaxed">
              Upon enrolling in this course, your institutional profile will instantly unlock all 4 study documents, downloadable PDFs, and live lecture resources.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleEnrollClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#FF6D1F]/25 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enroll in {courseCode} to Unlock</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-[#FAF3E1]/70 hover:text-[#FAF3E1] text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
