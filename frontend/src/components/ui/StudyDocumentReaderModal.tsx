import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Printer,
  BookOpen,
  FileText,
  User,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { CourseDocument } from "@/lib/courseMaterialsData";
import {
  generateCourseDocumentPDF,
  printCourseDocument,
  getCourseDocumentPDFBlobUrl,
} from "@/lib/pdfGenerator";

interface StudyDocumentReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CourseDocument | null;
}

export function StudyDocumentReaderModal({
  isOpen,
  onClose,
  document,
}: StudyDocumentReaderModalProps) {
  const [viewMode, setViewMode] = useState<"PDF" | "CHAPTER">("PDF");
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (document) {
      try {
        const url = getCourseDocumentPDFBlobUrl(document);
        setPdfBlobUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error("Failed to generate PDF blob URL:", err);
      }
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const currentChapter = document.chapters[activeChapterIndex] || document.chapters[0];

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      generateCourseDocumentPDF(document);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const handlePrint = () => {
    printCourseDocument(document);
  };

  const handleOpenInNewTab = () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, "_blank");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 overflow-hidden">
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
          className="relative w-full max-w-6xl h-[94vh] max-h-[960px] bg-[#0E0E12] border border-[#F5E7C6]/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 text-[#FAF3E1]"
        >
          {/* ✦ TOP HEADER BAR ✦ */}
          <div className="px-5 py-3.5 bg-[#14141A] border-b border-[#F5E7C6]/15 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="px-2.5 py-1 rounded-lg bg-[#FF6D1F]/20 border border-[#FF6D1F]/40 text-[#FF6D1F] font-mono text-xs font-black flex-shrink-0">
                {document.courseCode}
              </span>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-black text-[#FAF3E1] truncate">
                  {document.title}
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-[#FAF3E1]/60 truncate">
                  <span>{document.courseTitle}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked Student Copy
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Mode Switcher (PDF Online vs Chapter Text) */}
            <div className="flex items-center p-1 rounded-xl bg-[#1A1A22] border border-[#F5E7C6]/15 text-xs font-bold">
              <button
                onClick={() => setViewMode("PDF")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "PDF"
                    ? "bg-[#FF6D1F] text-white shadow-md font-black"
                    : "text-[#FAF3E1]/70 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Read PDF Online</span>
              </button>
              <button
                onClick={() => setViewMode("CHAPTER")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "CHAPTER"
                    ? "bg-[#FF6D1F] text-white shadow-md font-black"
                    : "text-[#FAF3E1]/70 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Text Notes Mode</span>
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {pdfBlobUrl && (
                <button
                  onClick={handleOpenInNewTab}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A22] hover:bg-[#252530] border border-[#F5E7C6]/15 text-xs font-bold text-[#FAF3E1] transition-all cursor-pointer"
                  title="Open PDF in Full Browser Window"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#FF6D1F]" />
                  <span>Full Tab</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A22] hover:bg-[#252530] border border-[#F5E7C6]/15 text-xs font-bold text-[#FAF3E1] transition-all cursor-pointer active:scale-95"
                title="Print or Save via Browser PDF"
              >
                <Printer className="w-3.5 h-3.5 text-[#FF6D1F]" />
                <span>Print</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-[#FF6D1F]/30 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? "Saving..." : "Download PDF"}</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-[#1A1A22] hover:bg-rose-950/40 text-[#FAF3E1]/70 hover:text-rose-400 border border-[#F5E7C6]/15 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ✦ MAIN VIEW SWITCH: PDF EMBEDDED VIEWER vs CHAPTER TEXT CANVAS ✦ */}
          {viewMode === "PDF" ? (
            <div className="flex-1 w-full h-full bg-[#181822] relative flex flex-col overflow-hidden">
              {pdfBlobUrl ? (
                <iframe
                  src={`${pdfBlobUrl}#toolbar=1&navpanes=1`}
                  title={document.title}
                  className="w-full h-full border-0 rounded-b-3xl"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-xs text-[#FAF3E1]/70">
                  <div className="w-8 h-8 border-2 border-[#FF6D1F] border-t-transparent rounded-full animate-spin" />
                  <span>Compiling Vector PDF for Online Reading...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
              {/* Left Chapter Navigation Sidebar */}
              <div className="w-full md:w-72 bg-[#101016] border-r border-[#F5E7C6]/10 p-4 overflow-y-auto flex-shrink-0 space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#FAF3E1]/50 px-2 flex items-center justify-between">
                  <span>Table of Contents</span>
                  <span className="font-mono text-[#FF6D1F]">{document.chapters.length} Chapters</span>
                </div>

                <div className="space-y-1.5">
                  {document.chapters.map((chap, idx) => {
                    const isActive = idx === activeChapterIndex;
                    return (
                      <button
                        key={chap.id}
                        onClick={() => setActiveChapterIndex(idx)}
                        className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 cursor-pointer ${
                          isActive
                            ? "bg-[#FF6D1F]/20 border border-[#FF6D1F]/50 text-[#FAF3E1]"
                            : "bg-[#161620] hover:bg-[#1E1E2C] border border-transparent text-[#FAF3E1]/70"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 ${
                            isActive
                              ? "bg-[#FF6D1F] text-[#FAF3E1]"
                              : "bg-[#252532] text-[#FAF3E1]/60"
                          }`}
                        >
                          {chap.chapterNumber}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs leading-snug line-clamp-2">
                            {chap.title}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Topics Pills */}
                <div className="pt-4 border-t border-[#F5E7C6]/10 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#FAF3E1]/50 px-1">
                    Topics Covered
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {document.topicsCovered.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#1C1C28] text-[10px] font-semibold text-[#FAF3E1]/70 border border-[#F5E7C6]/10"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Reading Canvas */}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 text-left selection:bg-[#FF6D1F]/30">
                {/* Chapter Header */}
                <div className="space-y-2 pb-4 border-b border-[#F5E7C6]/10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6D1F]/15 border border-[#FF6D1F]/30 text-[#FF6D1F] text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Chapter {currentChapter.chapterNumber}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#FAF3E1] leading-tight">
                    {currentChapter.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#FAF3E1]/70 font-medium">
                    {currentChapter.summary}
                  </p>
                </div>

                {/* Key Takeaways Box */}
                {currentChapter.keyTakeaways && currentChapter.keyTakeaways.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 space-y-2.5">
                    <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Essential Concepts & Takeaways</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-amber-100/90 font-medium">
                      {currentChapter.keyTakeaways.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#FF6D1F] font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Main Chapter Text */}
                <div className="text-xs sm:text-sm text-[#FAF3E1]/90 leading-relaxed font-normal whitespace-pre-line space-y-4">
                  {currentChapter.content}
                </div>

                {/* Code Snippet / Mathematical Formulas Box */}
                {currentChapter.formulasOrCode && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-mono font-bold text-[#FF6D1F] uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Implementation Code / Mathematical Formulary</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#08080C] border border-[#F5E7C6]/15 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner leading-relaxed">
                      <pre>{currentChapter.formulasOrCode}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✦ BOTTOM FOOTER ✦ */}
          <div className="px-6 py-2.5 bg-[#121218] border-t border-[#F5E7C6]/15 flex items-center justify-between text-xs text-[#FAF3E1]/60 flex-shrink-0">
            <span>© 2026 My Student Academia • Authorized Student Material</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="hover:text-[#FF6D1F] transition-colors cursor-pointer font-bold"
              >
                Print Document
              </button>
              <span>•</span>
              <button
                onClick={handleDownload}
                className="text-[#FF6D1F] hover:underline font-bold cursor-pointer"
              >
                Download .PDF
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
