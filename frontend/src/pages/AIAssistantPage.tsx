import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  Send,
  Trash2,
  Download,
  Settings,
  BookOpen,
  FileText,
  Layers,
  HelpCircle,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Key,
  ShieldCheck,
  Lightbulb,
  ArrowRight,
  X,
  GraduationCap,
  Info,
  Zap,
} from "lucide-react";
import { User } from "@/types";
import {
  AIMode,
  ChatMessage,
  FlashcardItem,
  PracticeQuestionItem,
  AIConfig,
  getStoredAIConfig,
  saveStoredAIConfig,
  clearStoredAIConfig,
  testCloudAIConnection,
  getStoredChatHistory,
  saveStoredChatHistory,
  clearStoredChatHistory,
  sendAIMessage,
  DEFAULT_AI_CONFIG,
  getModelPoolHealth,
} from "@/lib/aiStudyService";
import { getLocalEnrollments, StoredEnrollment } from "@/lib/enrollmentStorage";
import { EXPANDED_COURSE_CATALOG } from "@/lib/courseCatalogData";

interface AIAssistantPageProps {
  currentUser?: User | null;
}

// ✦ RICH MARKDOWN & CODE BLOCK RENDERER ✦
function FormattedMessageContent({ content }: { content: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm sm:text-base leading-relaxed text-slate-200">
      {parts.map((part, pIdx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].trim();
          const isLanguageTag = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const language = isLanguageTag ? firstLine : "code";
          const codeBody = isLanguageTag ? lines.slice(1).join("\n") : lines.join("\n");

          return (
            <div
              key={pIdx}
              className="my-3 rounded-xl overflow-hidden border border-[#F5E7C6]/20 bg-[#0A0A0E] shadow-lg shadow-black/40 font-mono text-xs sm:text-sm"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-[#141318] border-b border-[#F5E7C6]/15 text-slate-400">
                <span className="text-xs uppercase font-bold tracking-wider text-[#FF6D1F]">
                  {language}
                </span>
                <button
                  onClick={() => handleCopyCode(codeBody, pIdx)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#201F25] hover:bg-[#2C2B33] text-slate-300 hover:text-white transition-colors"
                >
                  {copiedIndex === pIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-slate-200 selection:bg-[#FF6D1F]/30">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Process standard markdown blocks (headings, blockquotes, lists, tables)
        const paragraphs = part.split("\n\n");
        return (
          <React.Fragment key={pIdx}>
            {paragraphs.map((para, paraIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              // Table block
              if (trimmed.includes("|") && trimmed.split("\n").length >= 2) {
                const tableLines = trimmed.split("\n").filter((l) => l.includes("|"));
                if (tableLines.length >= 2) {
                  const headers = tableLines[0]
                    .split("|")
                    .map((h) => h.trim())
                    .filter((h) => h.length > 0);
                  const rows = tableLines.slice(2).map((r) =>
                    r
                      .split("|")
                      .map((c) => c.trim())
                      .filter((c) => c.length > 0)
                  );

                  return (
                    <div key={paraIdx} className="my-3 overflow-x-auto rounded-xl border border-[#F5E7C6]/15 bg-[#121217]">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-[#181822] text-[#FF6D1F] border-b border-[#F5E7C6]/15 uppercase font-bold tracking-wider">
                          <tr>
                            {headers.map((h, hIdx) => (
                              <th key={hIdx} className="px-3 sm:px-4 py-2.5">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5E7C6]/10">
                          {rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3 sm:px-4 py-2 text-slate-300">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
              }

              // Headings
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={paraIdx} className="text-base sm:text-lg font-bold text-[#FF6D1F] mt-4 mb-2 flex items-center gap-2">
                    {trimmed.replace(/^###\s+/, "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("#### ")) {
                return (
                  <h4 key={paraIdx} className="text-sm sm:text-base font-semibold text-[#60A5FA] mt-3 mb-1.5">
                    {trimmed.replace(/^####\s+/, "")}
                  </h4>
                );
              }

              // Blockquotes / Callout
              if (trimmed.startsWith("> ")) {
                return (
                  <blockquote
                    key={paraIdx}
                    className="my-3 p-3.5 rounded-xl border-l-4 border-[#FF6D1F] bg-[#FF6D1F]/10 text-slate-200 italic font-medium"
                  >
                    {trimmed.replace(/^>\s*/gm, "")}
                  </blockquote>
                );
              }

              // Bullet lists
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                const items = trimmed.split("\n").filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
                return (
                  <ul key={paraIdx} className="space-y-1.5 my-2 ml-2 list-none">
                    {items.map((it, itIdx) => {
                      const cleanIt = it.replace(/^[-*]\s+/, "");
                      return (
                        <li key={itIdx} className="flex items-start gap-2 text-slate-200">
                          <span className="text-[#FF6D1F] font-bold mt-0.5">•</span>
                          <span>{renderInlineMarkdown(cleanIt)}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              // Numbered lists
              if (/^\d+\.\s/.test(trimmed)) {
                const items = trimmed.split("\n").filter((l) => /^\d+\.\s/.test(l.trim()));
                return (
                  <ol key={paraIdx} className="space-y-1.5 my-2 ml-2 list-none">
                    {items.map((it, itIdx) => {
                      const matchNum = it.match(/^(\d+)\.\s*(.*)$/);
                      return (
                        <li key={itIdx} className="flex items-start gap-2 text-slate-200">
                          <span className="text-[#60A5FA] font-bold text-xs px-1.5 py-0.5 rounded bg-[#60A5FA]/15 mt-0.5">
                            {matchNum ? matchNum[1] : itIdx + 1}
                          </span>
                          <span>{renderInlineMarkdown(matchNum ? matchNum[2] : it)}</span>
                        </li>
                      );
                    })}
                  </ol>
                );
              }

              return (
                <p key={paraIdx} className="text-slate-200 leading-relaxed">
                  {renderInlineMarkdown(trimmed)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Inline formatting helper (bold, code, links)
function renderInlineMarkdown(text: string): React.ReactNode {
  // Split on bold **text** or inline `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-[#FAF3E1]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-[#201F25] text-[#FF6D1F] font-mono text-xs sm:text-sm border border-[#F5E7C6]/15"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ✦ INTERACTIVE FLASHCARD VIEWER WIDGET ✦
function InteractiveFlashcardDeck({ cards }: { cards: FlashcardItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  if (!cards || cards.length === 0) return null;

  const current = cards[currentIndex] || cards[0];

  const handleToggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(masteredIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setMasteredIds(next);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="my-4 p-4 rounded-2xl border border-[#FF6D1F]/30 bg-gradient-to-b from-[#181822] to-[#111116] shadow-xl">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF6D1F]" />
          <span className="font-bold text-[#FAF3E1] uppercase tracking-wider">
            Study Card {currentIndex + 1} of {cards.length}
          </span>
          {current.category && (
            <span className="px-2 py-0.5 rounded-full bg-[#FF6D1F]/20 text-[#FF6D1F] font-semibold text-[10px]">
              {current.category}
            </span>
          )}
        </div>
        <span className="text-slate-400">
          Mastered: <strong className="text-emerald-400">{masteredIds.size}</strong>/{cards.length}
        </span>
      </div>

      {/* Card Surface */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative min-h-[170px] cursor-pointer rounded-xl p-5 border border-[#F5E7C6]/20 bg-[#0E0E12] hover:border-[#FF6D1F]/50 transition-all flex flex-col justify-between group shadow-inner"
      >
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="uppercase tracking-widest font-bold text-[10px] text-[#60A5FA]">
            {isFlipped ? "Answer / Explanation" : "Question / Concept Prompt"}
          </span>
          <span className="text-[11px] text-slate-400 group-hover:text-[#FF6D1F] transition-colors">
            (Click card to flip ↻)
          </span>
        </div>

        <div className="my-auto py-2">
          <p className="text-base sm:text-lg font-medium text-slate-100 whitespace-pre-line leading-relaxed">
            {isFlipped ? current.back : current.front}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F5E7C6]/10 text-xs">
          <span className="text-[11px] text-slate-400">
            {isFlipped ? "Tap to view Question" : "Tap to reveal Answer"}
          </span>
          <button
            onClick={(e) => handleToggleMastered(current.id, e)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              masteredIds.has(current.id)
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {masteredIds.has(current.id) ? "Mastered" : "Mark Mastered"}
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-3 pt-2">
        <button
          onClick={handlePrev}
          disabled={cards.length <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#20202A] hover:bg-[#2A2A38] text-xs font-semibold text-slate-300 transition-colors disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex items-center gap-1.5">
          {cards.map((c, idx) => (
            <div
              key={idx}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(idx);
              }}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                idx === currentIndex
                  ? "bg-[#FF6D1F] w-5"
                  : masteredIds.has(c.id)
                  ? "bg-emerald-400"
                  : "bg-slate-700 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={cards.length <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#20202A] hover:bg-[#2A2A38] text-xs font-semibold text-slate-300 transition-colors disabled:opacity-40"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ✦ INTERACTIVE PRACTICE QUESTION WIDGET ✦
function InteractivePracticeWidget({ questions }: { questions: PracticeQuestionItem[] }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  if (!questions || questions.length === 0) return null;

  const handleSelect = (qId: string, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setShowResults((prev) => ({ ...prev, [qId]: true }));
  };

  return (
    <div className="my-4 space-y-4">
      {questions.map((q, qIdx) => {
        const userChoice = selectedAnswers[q.id];
        const isAnswered = showResults[q.id];
        const isCorrect = userChoice === q.correctIndex;

        return (
          <div
            key={q.id}
            className="p-4 rounded-xl border border-[#F5E7C6]/20 bg-[#121217] space-y-3 shadow-md"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#3B82F6]/20 text-[#60A5FA] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {qIdx + 1}
              </span>
              <p className="font-semibold text-sm sm:text-base text-slate-100">{q.question}</p>
            </div>

            <div className="space-y-2 pl-8">
              {q.options.map((opt, optIdx) => {
                let btnStyle = "border-[#F5E7C6]/15 bg-[#181822] text-slate-300 hover:border-[#FF6D1F]/50";
                if (isAnswered) {
                  if (optIdx === q.correctIndex) {
                    btnStyle = "border-emerald-500/60 bg-emerald-950/40 text-emerald-300 font-semibold";
                  } else if (userChoice === optIdx && !isCorrect) {
                    btnStyle = "border-red-500/60 bg-red-950/40 text-red-300";
                  } else {
                    btnStyle = "border-[#F5E7C6]/10 bg-[#121216] text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(q.id, optIdx)}
                    disabled={isAnswered}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && optIdx === q.correctIndex && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && userChoice === optIdx && !isCorrect && (
                      <X className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div
                className={`mt-2 p-3 rounded-lg text-xs leading-relaxed border ${
                  isCorrect
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                    : "bg-red-950/30 border-red-500/30 text-slate-300"
                }`}
              >
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Correct! Full marks.</span>
                    </>
                  ) : (
                    <>
                      <Info className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">Review Required:</span>
                    </>
                  )}
                </div>
                <p>{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ✦ MAIN AI ASSISTANT PAGE COMPONENT ✦
export function AIAssistantPage({ currentUser }: AIAssistantPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMode, setActiveMode] = useState<AIMode>("CHAT");
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>("");
  const [enrolledList, setEnrolledList] = useState<StoredEnrollment[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(getStoredAIConfig());

  // Settings form states
  const [tempApiKey, setTempApiKey] = useState("");
  const [tempProvider, setTempProvider] = useState<"gemini" | "openai" | "groq" | "offline">("gemini");
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const effectiveEmail = currentUser?.email || "guest@academia.edu";

  // 1. Initial Load: Chat History, Enrolled Courses, Config
  useEffect(() => {
    const savedConfig = getStoredAIConfig();
    setAiConfig(savedConfig);
    setTempApiKey(savedConfig.apiKey);
    setTempProvider(savedConfig.provider);

    const history = getStoredChatHistory(effectiveEmail);
    if (history.length > 0) {
      setMessages(history);
    } else {
      // Starter greeting message
      const welcomeMsg: ChatMessage = {
        id: "msg-welcome-0",
        role: "assistant",
        content: `### 🎓 Welcome to the AI Study Assistant & Academic Summarizer!

I am your intelligent copilot for coursework, lecture notes, and exam mastery.

#### What would you like to accomplish today?
- 📝 **Summarize Lecture Notes**: Paste dense articles or lecture transcripts to get structured takeaways, key definitions, and exam cheat-sheets.
- 🗂️ **Generate Flashcards**: Create interactive spaced-repetition cards for rapid recall.
- 🎯 **Test Your Knowledge**: Generate high-yield practice questions with instant grading.
- 📅 **Build a Study Plan**: Create a 7-day revision schedule tailored to your enrolled courses.

> **⚡ Academic Intelligence Ready**: Instant lecture notes summarization, flashcard generation, and exam prep. You can also connect your own Google Gemini API Key in **Settings** for live AI inference! Ask any question or paste your study notes below!`,
        timestamp: Date.now(),
        mode: "CHAT",
      };
      setMessages([welcomeMsg]);
      saveStoredChatHistory(effectiveEmail, [welcomeMsg]);
    }

    // Load enrolled courses
    const enrollments = getLocalEnrollments(effectiveEmail);
    setEnrolledList(enrollments);
    if (enrollments.length > 0 && !selectedCourseCode) {
      setSelectedCourseCode(enrollments[0].section?.course?.code || "");
    }
  }, [effectiveEmail]);

  // 2. Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // 3. Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // 4. Send Message Handler
  const handleSendMessage = async (customPrompt?: string, modeOverride?: AIMode) => {
    const textToSend = (customPrompt || inputValue).trim();
    if (!textToSend || isGenerating) return;

    const currentMode = modeOverride || activeMode;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: Date.now(),
      mode: currentMode,
      courseCode: selectedCourseCode || undefined,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsGenerating(true);

    try {
      const response = await sendAIMessage({
        prompt: textToSend,
        history: newHistory,
        mode: currentMode,
        courseContext: selectedCourseCode || undefined,
        enrolledList,
        config: aiConfig,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        mode: currentMode,
        courseCode: selectedCourseCode || undefined,
        modelUsed: response.modelUsed,
        wasFlipped: response.wasFlipped,
        flashcards: response.flashcards,
        quizQuestions: response.quizQuestions,
      };

      const finalHistory = [...newHistory, assistantMsg];
      setMessages(finalHistory);
      saveStoredChatHistory(effectiveEmail, finalHistory);
    } catch (err: any) {
      console.error("Failed to generate AI response:", err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `⚠️ **Processing Notice**: Could not complete request. ${err?.message || "Please check your network connection and try again."}`,
        timestamp: Date.now(),
        mode: currentMode,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // 5. Clear chat
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      clearStoredChatHistory(effectiveEmail);
      const welcome: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Conversation cleared. What course or study material would you like to review?`,
        timestamp: Date.now(),
        mode: "CHAT",
      };
      setMessages([welcome]);
      saveStoredChatHistory(effectiveEmail, [welcome]);
    }
  };

  // 6. Export chat notes
  const handleExportNotes = () => {
    const textData = messages
      .map((m) => {
        const dateStr = new Date(m.timestamp).toLocaleString();
        const speaker = m.role === "assistant" ? "ACADEMIA AI" : "STUDENT";
        return `=== ${speaker} (${dateStr}) ===\n\n${m.content}\n\n`;
      })
      .join("\n----------------------------------------\n\n");

    const blob = new Blob([textData], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Academia_AI_Study_Notes_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 7. Save AI settings
  const handleSaveSettings = () => {
    const newConfig: AIConfig = {
      provider: tempProvider,
      apiKey: tempApiKey.trim(),
      modelName:
        tempProvider === "gemini"
          ? "gemini-1.5-flash"
          : tempProvider === "openai"
          ? "gpt-4o-mini"
          : tempProvider === "groq"
          ? "llama-3.3-70b-versatile"
          : "offline",
    };

    saveStoredAIConfig(newConfig);
    setAiConfig(newConfig);
    setShowSettingsModal(false);
    setTestResult(null);
  };

  // 8. Test connection
  const handleTestKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    const res = await testCloudAIConnection({
      provider: tempProvider,
      apiKey: tempApiKey.trim(),
      modelName: "gemini-1.5-flash",
    });
    setTestResult(res);
    setIsTestingKey(false);
  };

  // 9. Revert / Disconnect key
  const handleDisconnectKey = () => {
    clearStoredAIConfig();
    setAiConfig(DEFAULT_AI_CONFIG);
    setTempApiKey("");
    setTempProvider("offline");
    setTestResult({ success: true, message: "Reverted to Built-in Academic Engine." });
  };

  // Quick Action Modes
  const MODES: { id: AIMode; label: string; icon: any; placeholder: string; badge: string }[] = [
    {
      id: "CHAT",
      label: "General Q&A",
      icon: HelpCircle,
      placeholder: "Ask about any academic concept, formula derivation, or software design...",
      badge: "Core Q&A",
    },
    {
      id: "SUMMARIZE",
      label: "Notes Summarizer",
      icon: FileText,
      placeholder: "Paste your raw lecture notes, chapter text, or syllabus to get a structured summary...",
      badge: "Executive TL;DR",
    },
    {
      id: "FLASHCARDS",
      label: "Flashcard Maker",
      icon: Layers,
      placeholder: "Enter a topic or paste text to generate interactive active-recall flashcards...",
      badge: "Spaced Repetition",
    },
    {
      id: "PRACTICE",
      label: "Practice Exam",
      icon: CheckCircle2,
      placeholder: "Ask for practice questions or specify a course topic for exam questions...",
      badge: "High-Yield Questions",
    },
    {
      id: "STUDY_PLAN",
      label: "Study Planner",
      icon: Calendar,
      placeholder: "Specify your upcoming exam dates and target hours to build a study schedule...",
      badge: "7-Day Roadmap",
    },
  ];

  const currentModeConfig = MODES.find((m) => m.id === activeMode) || MODES[0];
  const isCloudConnected =
    aiConfig.provider !== "offline" && Boolean(aiConfig.apiKey && aiConfig.apiKey.trim());

  return (
    <div className="h-full w-full flex flex-col min-h-0 overflow-hidden bg-[#0B0A09] text-[#FAF3E1] select-none">
      {/* ✦ 1. HEADER & CONTROL DOCK ✦ */}
      <header className="shrink-0 border-b border-[#F5E7C6]/15 bg-[#0F0E13] px-4 sm:px-6 py-3 sm:py-3.5 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6D1F] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#FF6D1F]/20 text-white font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#FAF3E1]">
                  AI Study Assistant
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#FF6D1F]/20 border border-[#FF6D1F]/40 text-[#FF6D1F] text-[11px] font-bold uppercase tracking-wider">
                  Academic Copilot
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant study material generation, lecture summarization & exam preparation
              </p>
            </div>
          </div>

          {/* Engine status indicator & Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div
              onClick={() => setShowSettingsModal(true)}
              className={`cursor-pointer px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                isCloudConnected
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-500/80"
                  : "bg-blue-950/40 border-blue-500/40 text-blue-300 hover:border-blue-500/80"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isCloudConnected ? "bg-emerald-400" : "bg-blue-400"
                }`}
              />
              <span>
                {isCloudConnected
                  ? `⚡ Gemini 3.5 Flash Active (+ Auto-Flip Balancer)`
                  : `🧠 Built-in Academic Engine (Free)`}
              </span>
            </div>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#1A1921] hover:bg-[#25242E] border border-[#F5E7C6]/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Configure AI Model & API Keys"
            >
              <Settings className="w-4 h-4 text-[#FF6D1F]" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={handleExportNotes}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#1A1921] hover:bg-[#25242E] border border-[#F5E7C6]/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Download Notes as Markdown"
            >
              <Download className="w-4 h-4 text-[#60A5FA]" />
              <span className="hidden sm:inline">Export Notes</span>
            </button>

            <button
              onClick={handleClearChat}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#1A1921] hover:bg-red-950/40 border border-[#F5E7C6]/20 text-slate-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </header>

      {/* ✦ 2. STUDY MODE SELECTOR & ENROLLED COURSES CONTEXT BAR ✦ */}
      <div className="shrink-0 border-b border-[#F5E7C6]/10 bg-[#0A0A0E] px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isActive = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMode(m.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#FF6D1F] text-white shadow-md shadow-[#FF6D1F]/30"
                      : "bg-[#141318] text-slate-400 hover:text-slate-200 hover:bg-[#1A1921] border border-[#F5E7C6]/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Enrolled Courses Quick Context */}
          {enrolledList.length > 0 && (
            <div className="flex items-center gap-2 text-xs overflow-x-auto">
              <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#60A5FA]" />
                Enrolled:
              </span>
              <div className="flex items-center gap-1.5">
                {enrolledList.map((enr) => {
                  const code = enr.section?.course?.code || "";
                  if (!code) return null;
                  const isSelected = selectedCourseCode === code;
                  return (
                    <button
                      key={enr.id}
                      onClick={() => setSelectedCourseCode(isSelected ? "" : code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-[#3B82F6] text-white shadow-md shadow-blue-500/20"
                          : "bg-[#181822] text-slate-400 hover:text-slate-200 border border-[#F5E7C6]/10"
                      }`}
                    >
                      {code}
                    </button>
                  );
                })}
                {selectedCourseCode && (
                  <button
                    onClick={() => setSelectedCourseCode("")}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Clear selected course filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✦ 3. CHAT CONVERSATION FEED ✦ */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-5xl mx-auto space-y-5">
          {messages.map((msg, index) => {
          const isUser = msg.role === "user";

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 sm:gap-4 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#FF6D1F] to-[#3B82F6] flex items-center justify-center shrink-0 shadow-md shadow-[#FF6D1F]/20 text-white mt-1">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-xl ${
                  isUser
                    ? "bg-gradient-to-r from-[#FF6D1F] to-[#E05615] text-white rounded-tr-none"
                    : "bg-[#14131A] border border-[#F5E7C6]/15 text-[#FAF3E1] rounded-tl-none"
                }`}
              >
                {/* Meta info badge */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/10 text-[11px] text-slate-300/80">
                  <span className="font-bold flex items-center gap-1.5">
                    {isUser ? (
                      currentUser?.name || "Student"
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-[#FF6D1F]" />
                        <span>Academia AI</span>
                      </>
                    )}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {msg.modelUsed && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border flex items-center gap-1 ${
                          msg.wasFlipped
                            ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                            : "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        }`}
                        title={
                          msg.wasFlipped
                            ? "Auto-flipped model to avoid token exhaustion / high-demand buffer"
                            : "Served by active model"
                        }
                      >
                        <Zap className="w-2.5 h-2.5" />
                        <span>{msg.modelUsed}</span>
                        {msg.wasFlipped && (
                          <span className="text-[9px] uppercase tracking-wide opacity-80">(auto-flipped)</span>
                        )}
                      </span>
                    )}
                    {msg.courseCode && (
                      <span className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-bold text-white/90">
                        {msg.courseCode}
                      </span>
                    )}
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>

                {/* Formatted Message Body */}
                <FormattedMessageContent content={msg.content} />

                {/* Interactive Flashcards Deck (if any) */}
                {msg.flashcards && msg.flashcards.length > 0 && (
                  <InteractiveFlashcardDeck cards={msg.flashcards} />
                )}

                {/* Interactive Practice Question Widget (if any) */}
                {msg.quizQuestions && msg.quizQuestions.length > 0 && (
                  <InteractivePracticeWidget questions={msg.quizQuestions} />
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2A2935] border border-[#F5E7C6]/20 flex items-center justify-center shrink-0 text-[#FAF3E1] font-bold text-xs mt-1">
                  {currentUser?.name?.slice(0, 2).toUpperCase() || "ST"}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Loading Indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-slate-400 text-xs sm:text-sm pl-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6D1F] to-[#3B82F6] flex items-center justify-center shrink-0 text-white animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 bg-[#14131A] px-4 py-2.5 rounded-2xl border border-[#F5E7C6]/15 shadow-md">
              <RefreshCw className="w-3.5 h-3.5 text-[#FF6D1F] animate-spin" />
              <span>Analyzing curriculum & formulating high-yield response...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ✦ 4. PROMPT SUGGESTION CHIPS ✦ */}
      <div className="shrink-0 max-w-5xl mx-auto w-full px-4 sm:px-6 py-2 bg-[#0B0A09]/80 backdrop-blur-sm border-t border-[#F5E7C6]/5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Suggestions:
          </span>
          {activeMode === "SUMMARIZE" ? (
            <>
              <button
                onClick={() =>
                  handleSendMessage(
                    selectedCourseCode
                      ? `Please summarize the key lecture notes and exam takeaways for ${selectedCourseCode}.`
                      : `Please summarize the key principles of Asymptotic Time Complexity and Big-O Notation.`
                  )
                }
                className="px-3 py-1 rounded-full bg-[#1A1922] hover:bg-[#252430] border border-[#F5E7C6]/10 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                Summarize {selectedCourseCode || "Big-O Notation"}
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    `Summarize the difference between Arrays vs Linked Lists, including cache locality, random access, and Big-O insertion costs.`
                  )
                }
                className="px-3 py-1 rounded-full bg-[#1A1922] hover:bg-[#252430] border border-[#F5E7C6]/10 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                Summarize Arrays vs Linked Lists
              </button>
            </>
          ) : activeMode === "FLASHCARDS" ? (
            <>
              <button
                onClick={() =>
                  handleSendMessage(
                    selectedCourseCode
                      ? `Generate 5 active recall flashcards for ${selectedCourseCode}.`
                      : `Generate 5 active recall flashcards covering Algorithm Complexity and Data Structures.`
                  )
                }
                className="px-3 py-1 rounded-full bg-[#1A1922] hover:bg-[#252430] border border-[#F5E7C6]/10 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                Flashcards for {selectedCourseCode || "Data Structures"}
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    `Generate flashcards on Database Normalization (1NF, 2NF, 3NF, BCNF) and ACID properties.`
                  )
                }
                className="px-3 py-1 rounded-full bg-[#1A1922] hover:bg-[#252430] border border-[#F5E7C6]/10 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                Database Normalization & ACID
              </button>
            </>
          ) : activeMode === "PRACTICE" ? (
            <>
              <button
                onClick={() =>
                  handleSendMessage(
                    selectedCourseCode
                      ? `Give me 3 challenging practice exam questions for ${selectedCourseCode} with detailed answer explanations.`
                      : `Give me 3 challenging exam questions on Algorithms and Big-O with answers.`
                  )
                }
                className="px-3 py-1 rounded-full bg-[#1A1922] hover:bg-[#252430] border border-[#F5E7C6]/10 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                Practice Test for {selectedCourseCode || "Algorithms"}
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    `Generate 3 exam practice questions testing Object-Oriented SOLID principles.`
                  )
                }
                className="px-3 py-1 rounded-full bg-[#1A1922] hover:bg-[#252430] border border-[#F5E7C6]/10 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                SOLID Principles Questions
              </button>
            </>
          ) : activeMode === "STUDY_PLAN" ? (
            <>
              <button
                onClick={() =>
                  handleSendMessage(
                    selectedCourseCode
                      ? `Create a 7-day study plan to achieve an A in ${selectedCourseCode}.`
                      : `Create a 7-day revision schedule for upcoming final exams studying 3 hours a day.`
                  )
                }
                className="px-3 py-1 rounded-full bg-[#1A1922] hover:bg-[#252430] border border-[#F5E7C6]/10 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                7-Day Plan for {selectedCourseCode || "Finals"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  handleSendMessage(
                    `Explain Dijkstra's shortest path algorithm step-by-step with an intuitive analogy and time complexity.`
                  )
                }
                className="px-3 py-1 rounded-full bg-[#1A1922] hover:bg-[#252430] border border-[#F5E7C6]/10 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                Explain Dijkstra's Algorithm
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    `What is the difference between a Process and a Thread in modern Operating Systems?`
                  )
                }
                className="px-3 py-1 rounded-full bg-[#1A1922] hover:bg-[#252430] border border-[#F5E7C6]/10 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                Processes vs Threads
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    `Show me how Dynamic Programming works using the 0/1 Knapsack Problem with code.`
                  )
                }
                className="px-3 py-1 rounded-full bg-[#1A1922] hover:bg-[#252430] border border-[#F5E7C6]/10 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
              >
                0/1 Knapsack Problem
              </button>
            </>
          )}
        </div>
      </div>

      {/* ✦ 5. INPUT DOCK & ACTION BAR ✦ */}
      <footer className="shrink-0 border-t border-[#F5E7C6]/15 bg-[#0F0E13] px-4 sm:px-6 py-3 sm:py-4 z-20">
        <div className="max-w-5xl mx-auto space-y-2">
          <div className="relative rounded-2xl border border-[#F5E7C6]/20 bg-[#16151E] focus-within:border-[#FF6D1F] transition-all shadow-xl shadow-black/40">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              placeholder={currentModeConfig.placeholder}
              className="w-full bg-transparent px-4 py-3.5 pr-14 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-none min-h-[52px]"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isGenerating}
              className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-[#FF6D1F] hover:bg-[#E05615] text-white disabled:opacity-40 disabled:hover:bg-[#FF6D1F] transition-all shadow-md shadow-[#FF6D1F]/30"
              title="Send (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <span>Mode:</span>
              <strong className="text-[#FF6D1F]">{currentModeConfig.badge}</strong>
              {selectedCourseCode && (
                <>
                  <span>• Grounded in:</span>
                  <strong className="text-[#60A5FA]">{selectedCourseCode}</strong>
                </>
              )}
            </span>
            <span className="hidden sm:inline">
              Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line
            </span>
          </div>
        </div>
      </footer>

      {/* ✦ 6. AI SETTINGS & API KEY CONFIGURATION MODAL ✦ */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl border border-[#F5E7C6]/25 bg-[#121218] p-6 shadow-2xl space-y-5"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSettingsModal(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6D1F]/20 border border-[#FF6D1F]/40 flex items-center justify-center text-[#FF6D1F]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#FAF3E1]">AI Model & API Key Settings</h3>
                  <p className="text-xs text-slate-400">
                    Connect an API key for live generative AI or use the built-in offline engine.
                  </p>
                </div>
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  AI Provider Engine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempProvider("gemini")}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      tempProvider === "gemini"
                        ? "border-[#FF6D1F] bg-[#FF6D1F]/10 text-white font-bold"
                        : "border-[#F5E7C6]/15 bg-[#181822] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold text-sm text-[#FF6D1F]">Google Gemini</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Gemini 3.5 Flash + Auto-Balancer</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTempProvider("offline")}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      tempProvider === "offline"
                        ? "border-[#3B82F6] bg-[#3B82F6]/10 text-white font-bold"
                        : "border-[#F5E7C6]/15 bg-[#181822] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold text-sm text-[#60A5FA]">Built-in Engine</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">No API Key / 100% Free</div>
                  </button>
                </div>
              </div>

              {/* Token Safeguard & Multi-Model Pool Monitor */}
              {tempProvider === "gemini" && (
                <div className="p-3.5 rounded-xl border border-[#F5E7C6]/15 bg-[#16151E] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-[#FF6D1F]">
                      <Zap className="w-3.5 h-3.5" /> Token Safeguard & Auto-Flipper
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Dynamic Balancer Active</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Prioritizes <strong>Gemini 3.5 Flash</strong>. If it experiences high-demand buffering (503) or token exhaustion (429), requests automatically flip across <strong>Gemini 3 Flash</strong>, <strong>Flash-Lite</strong>, and <strong>Gemma</strong> to prevent interruptions.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                    {Object.entries(getModelPoolHealth()).slice(0, 4).map(([m, h]) => (
                      <div key={m} className="p-2 rounded-lg bg-[#0E0E13] border border-white/5 flex items-center justify-between">
                        <span className="font-mono text-slate-300 truncate max-w-[120px]">{m}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${h.status === 'ready' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-amber-950/40 text-amber-400'}`}>
                          {h.status === 'ready' ? 'Ready' : `Buffered (${h.remainingSec}s)`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* API Key Input (if not offline) */}
              {tempProvider !== "offline" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {tempProvider === "gemini" ? "Google Gemini API Key" : "API Key"}
                    </label>
                    {tempProvider === "gemini" && (
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#FF6D1F] hover:underline flex items-center gap-1 font-semibold"
                      >
                        Get Free Key at Google AI Studio <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showKeyPassword ? "text" : "password"}
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full rounded-xl border border-[#F5E7C6]/20 bg-[#181822] px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:border-[#FF6D1F] focus:outline-none pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeyPassword(!showKeyPassword)}
                      className="absolute right-2.5 top-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      {showKeyPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Keys are saved locally in your browser's secure storage and are never sent to third parties.
                  </p>
                </div>
              )}

              {/* Test Connection Button */}
              {tempProvider !== "offline" && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={isTestingKey || !tempApiKey.trim()}
                    className="px-3.5 py-2 rounded-xl bg-[#20202A] hover:bg-[#2B2B38] border border-[#F5E7C6]/20 text-xs font-semibold text-slate-200 disabled:opacity-40 flex items-center gap-2 transition-colors"
                  >
                    {isTestingKey && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF6D1F]" />}
                    <span>Test Connection</span>
                  </button>

                  {testResult && (
                    <span
                      className={`text-xs font-semibold flex items-center gap-1.5 ${
                        testResult.success ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                      <span>{testResult.message}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#F5E7C6]/15">
                <button
                  type="button"
                  onClick={handleDisconnectKey}
                  className="text-xs text-slate-400 hover:text-red-400 font-semibold"
                >
                  Clear / Disconnect
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#1A1922] hover:bg-[#252430] text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-4 py-2 rounded-xl bg-[#FF6D1F] hover:bg-[#E05615] text-xs font-bold text-white shadow-md shadow-[#FF6D1F]/30 transition-colors"
                  >
                    Save & Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIAssistantPage;
