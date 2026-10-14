// AI Study Assistant Service & Academic Intelligence Engine
// My Student Academia Ecosystem

import { COURSE_MATERIALS_CATALOG } from "./courseMaterialsData";
import { EXPANDED_COURSE_CATALOG } from "./courseCatalogData";
import { StoredEnrollment } from "./enrollmentStorage";

export type AIMode = "CHAT" | "SUMMARIZE" | "FLASHCARDS" | "PRACTICE" | "STUDY_PLAN";

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  category?: string;
}

export interface PracticeQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  mode?: AIMode;
  courseCode?: string;
  modelUsed?: string;
  wasFlipped?: boolean;
  flashcards?: FlashcardItem[];
  quizQuestions?: PracticeQuestionItem[];
}

export type AIProvider = "gemini" | "openai" | "groq" | "offline";

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  modelName: string;
}

const STORAGE_CONFIG_KEY = "msa_ai_config_v1";
const CHAT_HISTORY_PREFIX = "msa_ai_chat_history_v1_";

// High-availability cascade for Gemini models (prioritizes 3.5 Flash and auto-flips on traffic buffer / token limits)
export const GEMINI_CASCADE_MODELS = [
  "gemini-3.5-flash",        // Primary user-requested flagship model
  "gemini-3-flash-preview",  // Ultra-fast preview fallback
  "gemini-3.1-flash-lite",   // Lightweight token-saver model
  "gemini-3.5-flash-lite",   // 3.5 series lite
  "gemini-3.8-flash",        // 3.8 series flash
  "gemini-flash-latest",     // General latest flash alias
  "gemma-4-26b-a4b-it",      // Open-weight high performance
  "gemma-4-31b-it",          // Gemma 31B
  "gemini-pro-latest",       // Pro tier
];

// In-memory model health & cooldown tracker
interface ModelHealthRecord {
  cooldownUntil: number;
  lastReason: string;
  failureCount: number;
}

const modelHealthMap: Record<string, ModelHealthRecord> = {};
let roundRobinIndex = 0;

export function getModelPoolHealth(): Record<
  string,
  { status: "ready" | "cooldown" | "buffered"; remainingSec: number; reason: string }
> {
  const now = Date.now();
  const result: Record<string, any> = {};
  for (const m of GEMINI_CASCADE_MODELS) {
    const record = modelHealthMap[m];
    if (record && record.cooldownUntil > now) {
      const remainingSec = Math.ceil((record.cooldownUntil - now) / 1000);
      result[m] = {
        status:
          record.lastReason.includes("503") || record.lastReason.includes("buffer")
            ? "buffered"
            : "cooldown",
        remainingSec,
        reason: record.lastReason,
      };
    } else {
      result[m] = {
        status: "ready",
        remainingSec: 0,
        reason: "Available & Ready",
      };
    }
  }
  return result;
}

export function markModelCooldown(model: string, status: number, errorMsg: string): void {
  const isTrafficBuffer = status === 503 || status === 504 || status === 500;
  const isExhausted = status === 429;
  const cooldownMs = isTrafficBuffer ? 25_000 : isExhausted ? 60_000 : 30_000;
  const existing = modelHealthMap[model] || { cooldownUntil: 0, lastReason: "", failureCount: 0 };
  modelHealthMap[model] = {
    cooldownUntil: Date.now() + cooldownMs,
    lastReason: isTrafficBuffer
      ? `Traffic buffer / high demand (${status})`
      : isExhausted
      ? `Token quota / rate limit exhausted (${status})`
      : `Status ${status}: ${errorMsg.slice(0, 50)}`,
    failureCount: existing.failureCount + 1,
  };
}

export function clearModelCooldown(model: string): void {
  delete modelHealthMap[model];
}

export function getPrioritizedModelPool(): string[] {
  const now = Date.now();
  const ready = GEMINI_CASCADE_MODELS.filter(
    (m) => !modelHealthMap[m] || modelHealthMap[m].cooldownUntil <= now
  );
  const cooldown = GEMINI_CASCADE_MODELS.filter(
    (m) => modelHealthMap[m] && modelHealthMap[m].cooldownUntil > now
  );

  let pool: string[] = [];
  if (ready.includes("gemini-3.5-flash")) {
    // If gemini-3.5-flash is ready, prioritize it while balancing load across other ready models
    const others = ready.filter((m) => m !== "gemini-3.5-flash");
    if (roundRobinIndex % 2 === 0 || others.length === 0) {
      pool = ["gemini-3.5-flash", ...others];
    } else {
      const rotIdx = roundRobinIndex % others.length;
      pool = [others[rotIdx], "gemini-3.5-flash", ...others.filter((_, i) => i !== rotIdx)];
    }
    roundRobinIndex++;
  } else {
    pool = ready.length > 0 ? ready : GEMINI_CASCADE_MODELS;
  }

  return [...new Set([...pool, ...cooldown, ...GEMINI_CASCADE_MODELS])];
}

// Default configurations (offline built-in engine; keys are only stored in the user's private browser localStorage)
export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "offline",
  apiKey: "",
  modelName: "gemini-3.5-flash",
};

// ✦ 1. CONFIGURATION STORAGE & RETRIEVAL ✦
export function getStoredAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          provider: parsed.provider || "offline",
          apiKey: (parsed.apiKey || "").trim(),
          modelName: parsed.modelName || "gemini-3.5-flash",
        };
      }
    }
  } catch (e) {
    console.warn("Failed to retrieve AI configuration:", e);
  }

  return DEFAULT_AI_CONFIG;
}

export function saveStoredAIConfig(config: AIConfig): void {
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent("msa_ai_config_updated", { detail: config }));
  } catch (e) {
    console.error("Failed to save AI configuration:", e);
  }
}

export function clearStoredAIConfig(): void {
  try {
    localStorage.removeItem(STORAGE_CONFIG_KEY);
    window.dispatchEvent(new CustomEvent("msa_ai_config_updated", { detail: DEFAULT_AI_CONFIG }));
  } catch (e) {
    console.error("Failed to clear AI config:", e);
  }
}

// ✦ 2. CHAT HISTORY PERSISTENCE ✦
export function getStoredChatHistory(userKey?: string | null): ChatMessage[] {
  const key = (userKey || "guest").toLowerCase().trim();
  try {
    const raw = localStorage.getItem(`${CHAT_HISTORY_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to read chat history:", e);
  }
  return [];
}

export function saveStoredChatHistory(userKey: string | null | undefined, messages: ChatMessage[]): void {
  const key = (userKey || "guest").toLowerCase().trim();
  try {
    localStorage.setItem(`${CHAT_HISTORY_PREFIX}${key}`, JSON.stringify(messages));
  } catch (e) {
    console.error("Failed to save chat history:", e);
  }
}

export function clearStoredChatHistory(userKey?: string | null): void {
  const key = (userKey || "guest").toLowerCase().trim();
  try {
    localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${key}`);
  } catch (e) {
    console.error("Failed to clear chat history:", e);
  }
}

// ✦ 3. CLOUD API TEST FUNCTION ✦
export async function testCloudAIConnection(config: AIConfig): Promise<{ success: boolean; message: string }> {
  if (!config.apiKey || !config.apiKey.trim()) {
    return { success: false, message: "API key cannot be empty." };
  }

  const cleanKey = config.apiKey.trim();

  if (config.provider === "gemini") {
    let lastErrorMsg = "";
    for (const model of GEMINI_CASCADE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello! Respond with 'CONNECTED'." }] }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (text) {
            return { success: true, message: `Successfully connected to Google Gemini (${model})!` };
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          lastErrorMsg = errData?.error?.message || `HTTP ${res.status}`;
        }
      } catch (e: any) {
        lastErrorMsg = e?.message || String(e);
      }
    }
    return { success: false, message: `Google Gemini API Notice: ${lastErrorMsg}` };
  } else if (config.provider === "openai") {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanKey}`,
        },
        body: JSON.stringify({
          model: config.modelName || "gpt-4o-mini",
          messages: [{ role: "user", content: "Ping" }],
          max_tokens: 5,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: `OpenAI API Error: ${err?.error?.message || res.statusText}` };
      }
      return { success: true, message: "Successfully connected to OpenAI API!" };
    } catch (e: any) {
      return { success: false, message: `Network error reaching OpenAI: ${e?.message || e}` };
    }
  } else if (config.provider === "groq") {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: "Ping" }],
          max_tokens: 5,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: `Groq API Error: ${err?.error?.message || res.statusText}` };
      }
      return { success: true, message: "Successfully connected to Groq API!" };
    } catch (e: any) {
      return { success: false, message: `Network error reaching Groq: ${e?.message || e}` };
    }
  }

  return { success: true, message: "Built-in Offline Study Engine is active and ready." };
}

// ✦ 4. ACADEMIC SYSTEM INSTRUCTIONS ✦
const ACADEMIC_SYSTEM_INSTRUCTION = `You are "Academia AI", the elite intelligent Study Assistant and Academic Copilot for My Student Academia.
Your mission is to provide university-level academic guidance, crystal-clear conceptual explanations, concise study summaries, active recall flashcards, and exam preparation.

GUIDELINES:
1. Academic Rigor & Clarity: Be concise, clear, and pedagogically sound. Use structured Markdown with bold keywords, numbered lists, bullet points, and code blocks with syntax highlighting.
2. Summarization Mode: When asked to summarize text or notes, provide:
   - 📌 **Executive Overview (TL;DR)**
   - 🔑 **Core Concepts & Key Definitions**
   - 📋 **Structured Breakdown**
   - 🎯 **High-Yield Exam Takeaways & Common Mistakes to Avoid**
3. Flashcards Mode: When generating flashcards, return clear, memorable Question and Answer pairs designed for spaced repetition and active recall.
4. Practice Questions Mode: When generating practice tests, provide multiple-choice or analytical questions accompanied by thorough pedagogical explanations.
5. Tone: Encouraging, intellectually sharp, professorial yet accessible.
6. Mathematical & Technical Precision: Present formulas with clear mathematical notations and provide runnable, well-commented code snippets where relevant.`;

// ✦ 5. BUILT-IN OFFLINE INTELLIGENCE & NLP SUMMARIZER ✦
// Works 100% offline with zero API keys or external network dependencies!

function extractKeySentences(text: string, count: number = 4): string[] {
  const rawSentences = text
    .split(/(?<=[.?!])\s+(?=[A-Z0-9])|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !s.startsWith("#"));

  if (rawSentences.length <= count) return rawSentences;

  // Keyword scoring
  const keywords = [
    "fundamental", "crucial", "important", "defined", "algorithm", "complexity",
    "theorem", "principle", "therefore", "specifically", "formula", "function",
    "architecture", "process", "memory", "optimal", "key", "result", "analysis",
    "equation", "performance", "system", "structure", "rule", "model"
  ];

  const scored = rawSentences.map((sentence, idx) => {
    let score = 0;
    const lower = sentence.toLowerCase();
    keywords.forEach((kw) => {
      if (lower.includes(kw)) score += 2;
    });
    // Boost earlier sentences (introductory definitions)
    if (idx < 3) score += 3;
    // Penalize overly long sentences
    if (sentence.length > 250) score -= 1;
    return { sentence, score, idx };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, count).sort((a, b) => a.idx - b.idx);
  return selected.map((s) => s.sentence);
}

function extractKeyTerms(text: string): { term: string; explanation: string }[] {
  const terms: { term: string; explanation: string }[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const clean = line.replace(/^[-*•\d.]+\s*/, "").trim();
    // Look for definitions like "Term: definition" or "Term - definition" or "**Term**: definition"
    const colonMatch = clean.match(/^\**([A-Za-z0-9\s_-]{3,35})\**\s*[:—–-]\s*(.+)$/);
    if (colonMatch && colonMatch[1] && colonMatch[2]) {
      terms.push({
        term: colonMatch[1].trim(),
        explanation: colonMatch[2].trim(),
      });
      if (terms.length >= 6) break;
    }
  }

  // Fallback if no colon patterns found
  if (terms.length < 2) {
    const commonAcademicTerms: Record<string, string> = {
      "Time Complexity": "Measure of the amount of computational time taken by an algorithm to run as a function of the length of the input.",
      "Space Complexity": "Total amount of working memory required by an algorithm during execution.",
      "Invariance": "A condition or mathematical property that remains true throughout algorithmic execution.",
      "Recursion": "Method of solving a computational problem where the solution depends on solutions to smaller instances of the same problem.",
      "Cache Locality": "Principle where computational access to memory exhibits spatial and temporal proximity.",
      "Data Abstraction": "Separation of logical properties of data from their physical implementation details.",
    };

    for (const [k, v] of Object.entries(commonAcademicTerms)) {
      if (text.toLowerCase().includes(k.toLowerCase())) {
        terms.push({ term: k, explanation: v });
      }
    }
  }

  return terms;
}

// Offline response generator
function generateOfflineResponse(
  prompt: string,
  mode: AIMode,
  courseContext?: string,
  enrolledList?: StoredEnrollment[]
): {
  content: string;
  flashcards?: FlashcardItem[];
  quizQuestions?: PracticeQuestionItem[];
} {
  const pLower = prompt.toLowerCase();

  // Try to locate course in catalog if referenced
  let targetCourse: any = null;
  if (courseContext) {
    targetCourse = EXPANDED_COURSE_CATALOG.find(
      (c) => c.code.toLowerCase() === courseContext.toLowerCase() || c.id === courseContext
    );
  } else {
    // Check if prompt mentions a course code like CS101, CS201, etc.
    const match = prompt.match(/\b([A-Z]{2,4}\s*\d{3})\b/i);
    if (match) {
      const codeClean = match[1].replace(/\s+/g, "").toUpperCase();
      targetCourse = EXPANDED_COURSE_CATALOG.find(
        (c) => c.code.replace(/\s+/g, "").toUpperCase() === codeClean
      );
    }
  }

  // Check if course materials exist
  const materials = targetCourse ? COURSE_MATERIALS_CATALOG[targetCourse.code] || [] : [];
  const primaryDoc = materials[0];

  // ── MODE 1: SUMMARIZATION ──
  if (mode === "SUMMARIZE" || pLower.includes("summariz") || pLower.includes("summary") || pLower.includes("tldr")) {
    const keySentences = extractKeySentences(prompt, 4);
    const keyTerms = extractKeyTerms(prompt);

    if (keySentences.length > 0 && prompt.length > 80) {
      let result = `### 📌 Executive Overview & Core Takeaway\n\n`;
      result += `> ${keySentences[0]}\n\n`;

      result += `### 🔑 Essential Concepts & Key Definitions\n\n`;
      if (keyTerms.length > 0) {
        keyTerms.forEach((t) => {
          result += `- **${t.term}**: ${t.explanation}\n`;
        });
      } else {
        result += `- **Core Principle**: Concepts revolve around systematic modularization, analytical rigor, and disciplined problem verification.\n`;
        result += `- **Key Functionality**: High-yield synthesis indicates strong interdependence between theoretical assumptions and practical execution boundaries.\n`;
      }

      result += `\n### 📋 Structured Breakdown of Key Points\n\n`;
      keySentences.slice(1).forEach((s, idx) => {
        result += `${idx + 1}. **Concept ${idx + 1}**: ${s}\n`;
      });

      result += `\n### 🎯 High-Yield Exam Takeaways & Common Pitfalls\n\n`;
      result += `- 💡 **Exam Tip**: Ensure precise definitions are committed to memory. Many exam deductions occur when failing to articulate edge conditions.\n`;
      result += `- ⚠️ **Common Trap**: Conflating asymptotic upper bounds ($O$) with tight asymptotic bounds ($\\Theta$). Always verify whether worst-case or average-case bounds are specified.\n`;

      return { content: result };
    }

    if (targetCourse && primaryDoc) {
      let result = `### 📌 Course Summary: ${targetCourse.code} — ${targetCourse.title}\n\n`;
      result += `> **Instructor / Curriculum**: ${primaryDoc.author} (${primaryDoc.authorTitle})\n\n`;
      result += `${primaryDoc.summary}\n\n`;

      result += `### 🔑 Topics Covered & Syllabus Core\n\n`;
      primaryDoc.topicsCovered.forEach((t) => {
        result += `- **${t}**: Fundamental component of the ${targetCourse.code} accredited curriculum.\n`;
      });

      result += `\n### 📋 Chapter Compendium Highlights\n\n`;
      primaryDoc.chapters.slice(0, 3).forEach((ch) => {
        result += `#### Chapter ${ch.chapterNumber}: ${ch.title}\n`;
        result += `${ch.summary}\n`;
        if (ch.keyTakeaways && ch.keyTakeaways.length > 0) {
          ch.keyTakeaways.forEach((k) => (result += `  • *${k}*\n`));
        }
        if (ch.formulasOrCode) {
          result += `\n\`\`\`\n${ch.formulasOrCode}\n\`\`\`\n\n`;
        }
      });

      result += `\n### 🎯 Exam Preparation Strategy\n\n`;
      result += `- Focus heavily on problem sets and laboratory manuals.\n`;
      result += `- Review active practice quizzes on the **Quizzes** page to benchmark your GPA.\n`;

      return { content: result };
    }

    return {
      content: `### 📝 Study Material Summarizer\n\nPaste your lecture slides, textbook excerpts, or reading notes into the input box below and click **Send**. \n\nI will instantly break down the material into:\n1. **Executive TL;DR**\n2. **Key Formulas & Terminology**\n3. **Structured Chapter Breakdown**\n4. **High-Yield Exam Tips & Common Traps**\n\n*(Tip: You can also select one of your enrolled courses from the chips above for an instant curriculum summary!)*`,
    };
  }

  // ── MODE 2: FLASHCARDS ──
  if (mode === "FLASHCARDS" || pLower.includes("flashcard") || pLower.includes("cards")) {
    let cards: FlashcardItem[] = [];

    if (targetCourse) {
      cards = [
        {
          id: "fc-1",
          front: `What is the primary objective of ${targetCourse.code} (${targetCourse.title})?`,
          back: targetCourse.description || `To master the core principles, algorithms, and analytical frameworks of ${targetCourse.title}.`,
          category: targetCourse.code,
        },
        {
          id: "fc-2",
          front: `What are the key prerequisites or credits for ${targetCourse.code}?`,
          back: `${targetCourse.credits} Credits. Emphasizes structured problem-solving and rigorous academic implementation.`,
          category: targetCourse.code,
        },
        {
          id: "fc-3",
          front: `What is the optimal study method for ${targetCourse.code}?`,
          back: `Combine theoretical lecture notes with weekly problem set derivations and timed practice assessments.`,
          category: "Study Strategy",
        },
        {
          id: "fc-4",
          front: `How does ${targetCourse.code} evaluate academic mastery?`,
          back: `Through milestone problem sets, course quizzes (impacting cumulative GPA), and laboratory implementations.`,
          category: "Grading",
        },
      ];
    } else {
      cards = [
        {
          id: "fc-1",
          front: "What is Time Complexity vs Space Complexity?",
          back: "Time Complexity measures total CPU instructions/operations as input size $N$ grows ($O(N)$). Space Complexity measures auxiliary working memory required in RAM.",
          category: "Algorithms",
        },
        {
          id: "fc-2",
          front: "What distinguishes an Array from a Singly Linked List in memory?",
          back: "Arrays allocate contiguous memory blocks offering $O(1)$ random indexing. Linked Lists use scattered node pointers with $O(N)$ lookup and $O(1)$ node insertion/deletion.",
          category: "Data Structures",
        },
        {
          id: "fc-3",
          front: "What is the Feynman Technique for rapid learning?",
          back: "1. Select a concept.\n2. Explain it in simple terms as if teaching a beginner.\n3. Identify gaps in understanding.\n4. Review and simplify with analogies.",
          category: "Metacognition",
        },
        {
          id: "fc-4",
          front: "What is the Big-O difference between MergeSort and QuickSort?",
          back: "MergeSort guarantees $O(N \\log N)$ worst-case time using $O(N)$ memory. QuickSort achieves $O(N \\log N)$ average with $O(1)$ auxiliary space, but degrades to $O(N^2)$ on unbalanced pivots.",
          category: "Sorting",
        },
        {
          id: "fc-5",
          front: "What is the ACID principle in Database Systems?",
          back: "Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent transactions execute independently), Durability (committed changes persist).",
          category: "Databases",
        },
      ];
    }

    const cardSummary = `### 🗂️ Active Recall Study Flashcards Generated (${cards.length} Cards)\n\nI have generated interactive flashcards based on **${targetCourse ? targetCourse.code + ' — ' + targetCourse.title : 'Core Academic Foundations'}**. Click the cards below to flip between the Question and Answer:`;

    return {
      content: cardSummary,
      flashcards: cards,
    };
  }

  // ── MODE 3: PRACTICE EXAM / QUIZ QUESTIONS ──
  if (mode === "PRACTICE" || pLower.includes("practice") || pLower.includes("exam") || pLower.includes("test")) {
    const questions: PracticeQuestionItem[] = [
      {
        id: "pq-1",
        question: `When analyzing an algorithm with nested loops where the outer loop runs $N$ times and the inner loop halves its range ($j = N; j > 0; j /= 2$), what is the total asymptotic time complexity?`,
        options: ["O(N log N)", "O(N^2)", "O(log N)", "O(N)"],
        correctIndex: 0,
        explanation: `The outer loop executes $N$ times. For each iteration, the inner loop halves $N$ down to 1, taking $\\log_2 N$ steps. Multiplying these gives $O(N \\log N)$.`,
      },
      {
        id: "pq-2",
        question: `Which data structure provides amortized $O(1)$ time complexity for insertions and lookups by key?`,
        options: ["Hash Table", "Binary Search Tree", "Balanced AVL Tree", "Sorted Array"],
        correctIndex: 0,
        explanation: `Hash Tables compute a hash index for direct bucket address lookup, offering amortized $O(1)$ access when collisions are handled with uniform distribution.`,
      },
      {
        id: "pq-3",
        question: `In Object-Oriented Software Design, what does the 'L' in the SOLID principles stand for?`,
        options: [
          "Liskov Substitution Principle",
          "Linear Invariance Protocol",
          "Layered Isolation Principle",
          "Logical Abstraction Standard",
        ],
        correctIndex: 0,
        explanation: `The Liskov Substitution Principle (LSP) asserts that objects of a superclass should be replaceable with objects of a subclass without breaking application correctness.`,
      },
    ];

    return {
      content: `### 🎯 High-Yield Exam Practice Questions\n\nTest your mastery with these analytical exam-style questions. Select your answers below to verify your reasoning:`,
      quizQuestions: questions,
    };
  }

  // ── MODE 4: STUDY PLAN ──
  if (mode === "STUDY_PLAN" || pLower.includes("plan") || pLower.includes("schedule") || pLower.includes("revision")) {
    const courseName = targetCourse ? `${targetCourse.code} (${targetCourse.title})` : "Enrolled Curriculum";
    let plan = `### 📅 Structured 7-Day Academic Revision Roadmap: ${courseName}\n\n`;
    plan += `| Day | Academic Phase | Targeted Objectives | Recommended Hours |\n`;
    plan += `| :--- | :--- | :--- | :--- |\n`;
    plan += `| **Day 1** | Conceptual Diagnostics | Review syllabus topics, highlight weak chapters, review definitions | 2.5 hrs |\n`;
    plan += `| **Day 2** | Core Theoretical Foundations | Deep-dive lecture compendiums, annotate key theorems and proofs | 3.0 hrs |\n`;
    plan += `| **Day 3** | Analytical Problem Sets | Solve odd-numbered worked solutions without checking the answers | 3.5 hrs |\n`;
    plan += `| **Day 4** | Laboratory & Code Practice | Implement benchmark algorithms, reproduce experimental testbeds | 3.0 hrs |\n`;
    plan += `| **Day 5** | Active Recall & Flashcards | Run through chapter flashcard decks, teach concepts out loud | 2.5 hrs |\n`;
    plan += `| **Day 6** | Timed Mock Assessment | Take the official course quiz under strict timed conditions | 2.0 hrs |\n`;
    plan += `| **Day 7** | Error Analysis & Rapid Review | Review flashcard misses, formula cheat-sheet, rest & sleep well | 2.0 hrs |\n\n`;

    plan += `### 💡 Pro-Tip for Top GPA Performance\n`;
    plan += `- Never practice in passive reading mode. Always write out derivations on scratch paper.\n`;
    plan += `- Take the course quiz on the **Quizzes** page to record your evaluated GPA on the Dean's Honor Roll!\n`;

    return { content: plan };
  }

  // ── DEFAULT: GENERAL STUDY Q&A ──
  let response = `### 🎓 Academia AI Study Copilot\n\n`;

  if (targetCourse) {
    response += `I am ready to help you excel in **${targetCourse.code}: ${targetCourse.title}** (${targetCourse.credits} Credits).\n\n`;
    response += `**Course Overview**: ${targetCourse.description}\n\n`;
    response += `Here is what we can do together:\n`;
    response += `1. **📝 Summarize Notes**: Paste lecture text or ask me to summarize official course chapters.\n`;
    response += `2. **🗂️ Generate Flashcards**: Create interactive Q&A cards for active recall.\n`;
    response += `3. **🎯 Exam Practice**: Generate practice questions to test your knowledge.\n`;
    response += `4. **📅 Revision Roadmap**: Build a personalized study plan for upcoming midterms or finals.\n\n`;
    response += `*Ask me anything about ${targetCourse.code} or paste your study notes below!*`;
  } else {
    response += `Welcome to your academic study copilot! I am specialized in transforming dense study materials into crystal-clear summaries, flashcards, and exam preparation guides.\n\n`;
    response += `#### Quick Ways I Can Help You Right Now:\n\n`;
    response += `- 📝 **Notes Summarization**: Paste any lecture excerpt, article, or PDF text to receive a bulleted executive summary with high-yield takeaways.\n`;
    response += `- 🗂️ **Active Recall Flashcards**: Ask me to turn any concept into study cards.\n`;
    response += `- 🎯 **Exam Prep & Problem Walkthroughs**: Get step-by-step mathematical proofs, algorithm traces, and code explanations.\n`;
    response += `- 📅 **Personalized Study Plans**: Build a balanced study timetable around your enrolled courses.\n\n`;
    response += `Select a study mode from the toolbar or ask any question to get started!`;
  }

  return { content: response };
}

// ✦ 6. MASTER DISPATCHER: SENDS MESSAGE VIA CLOUD LLM OR BUILT-IN ENGINE ✦
export async function sendAIMessage({
  prompt,
  history,
  mode = "CHAT",
  courseContext,
  enrolledList,
  config,
}: {
  prompt: string;
  history: ChatMessage[];
  mode?: AIMode;
  courseContext?: string;
  enrolledList?: StoredEnrollment[];
  config?: AIConfig;
}): Promise<{
  content: string;
  modelUsed?: string;
  wasFlipped?: boolean;
  flashcards?: FlashcardItem[];
  quizQuestions?: PracticeQuestionItem[];
}> {
  const activeConfig = config || getStoredAIConfig();

  // ── PATH A: GOOGLE GEMINI API (When Key Provided) ──
  if (activeConfig.provider === "gemini" && activeConfig.apiKey && activeConfig.apiKey.trim()) {
    try {
      const apiKey = activeConfig.apiKey.trim();
      const model = activeConfig.modelName || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      // Build context grounding
      let contextPrefix = "";
      if (courseContext) {
        const found = EXPANDED_COURSE_CATALOG.find(
          (c) => c.code.toLowerCase() === courseContext.toLowerCase() || c.id === courseContext
        );
        if (found) {
          contextPrefix += `[COURSE CONTEXT: The student is enrolled in ${found.code} - ${found.title}. Description: ${found.description}]\n\n`;
        }
      }

      let modeInstruction = "";
      if (mode === "SUMMARIZE") {
        modeInstruction = `[MODE: SUMMARIZATION. Format your response into: 1) Executive TL;DR, 2) Key Terminology & Definitions, 3) Structured Chapter Breakdown, 4) High-Yield Exam Takeaways & Pitfalls to Avoid.]\n\n`;
      } else if (mode === "FLASHCARDS") {
        modeInstruction = `[MODE: FLASHCARDS. Create 5-8 structured Question & Answer pairs for active recall spaced repetition. Present each clearly.]\n\n`;
      } else if (mode === "PRACTICE") {
        modeInstruction = `[MODE: PRACTICE EXAM. Create 3-5 challenging multiple-choice or analytical exam questions with comprehensive solutions and explanations.]\n\n`;
      } else if (mode === "STUDY_PLAN") {
        modeInstruction = `[MODE: STUDY PLAN. Generate a realistic day-by-day revision roadmap with hourly allocations and milestones.]\n\n`;
      }

      // Convert conversation history to Gemini contents format
      const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      // Include recent history (last 6 messages for context)
      const recentHistory = history.slice(-6);
      for (const m of recentHistory) {
        formattedContents.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        });
      }

      // Current prompt with instructions
      formattedContents.push({
        role: "user",
        parts: [{ text: `${contextPrefix}${modeInstruction}${prompt}` }],
      });

      let generatedText: string | null = null;
      let lastErrorMessage = "";
      let activeModelUsed = "";
      let wasFlipped = false;

      // Dynamic model pool prioritizing 3.5 Flash and auto-flipping on traffic buffer / token limits
      const prioritizedPool = getPrioritizedModelPool();

      for (let i = 0; i < prioritizedPool.length; i++) {
        const targetModel = prioritizedPool[i];
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: formattedContents,
              systemInstruction: {
                parts: [{ text: ACADEMIC_SYSTEM_INSTRUCTION }],
              },
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2500,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              generatedText = text;
              activeModelUsed = targetModel;
              wasFlipped = i > 0 || targetModel !== "gemini-3.5-flash";
              clearModelCooldown(targetModel);
              break;
            }
          } else {
            const errJson = await response.json().catch(() => ({}));
            lastErrorMessage = errJson?.error?.message || `HTTP ${response.status}`;
            console.warn(`Gemini model ${targetModel} status ${response.status}, cascading...`);
            markModelCooldown(targetModel, response.status, lastErrorMessage);
          }
        } catch (mErr: any) {
          lastErrorMessage = mErr?.message || String(mErr);
          markModelCooldown(targetModel, 500, lastErrorMessage);
        }
      }

      if (!generatedText) {
        console.warn("All Gemini cascade models unavailable, falling back:", lastErrorMessage);
        const offlineResult = generateOfflineResponse(prompt, mode, courseContext, enrolledList);
        return {
          ...offlineResult,
          content: `> ⚠️ *Note: Gemini API notice (${lastErrorMessage}). Switched automatically to Built-in Academic Engine:*\n\n${offlineResult.content}`,
        };
      }

      if (generatedText) {
        // If in flashcards mode, extract or attach interactive cards if prompt allows
        let flashcards: FlashcardItem[] | undefined;
        let quizQuestions: PracticeQuestionItem[] | undefined;

        if (mode === "FLASHCARDS") {
          const offlineCards = generateOfflineResponse(prompt, "FLASHCARDS", courseContext, enrolledList).flashcards;
          flashcards = offlineCards;
        } else if (mode === "PRACTICE") {
          const offlineQuizzes = generateOfflineResponse(prompt, "PRACTICE", courseContext, enrolledList).quizQuestions;
          quizQuestions = offlineQuizzes;
        }

        return {
          content: generatedText,
          modelUsed: activeModelUsed,
          wasFlipped,
          flashcards,
          quizQuestions,
        };
      }
    } catch (err: any) {
      console.warn("Gemini API network error, falling back to offline engine:", err);
      const fallback = generateOfflineResponse(prompt, mode, courseContext, enrolledList);
      return {
        ...fallback,
        content: `> ⚠️ *Connection issue with Gemini API (${err?.message || "Network Error"}). Showing answer from Built-in Study Engine:*\n\n${fallback.content}`,
      };
    }
  }

  // ── PATH B: OPENAI API (When Key Provided) ──
  if (activeConfig.provider === "openai" && activeConfig.apiKey && activeConfig.apiKey.trim()) {
    try {
      const apiKey = activeConfig.apiKey.trim();
      const messages = [
        { role: "system", content: ACADEMIC_SYSTEM_INSTRUCTION },
        ...history.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: prompt },
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: activeConfig.modelName || "gpt-4o-mini",
          messages,
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          return { content: text };
        }
      }
    } catch (e) {
      console.warn("OpenAI API call failed, falling back to offline:", e);
    }
  }

  // ── PATH C: BUILT-IN OFFLINE ACADEMIC ENGINE (Default & Free) ──
  return generateOfflineResponse(prompt, mode, courseContext, enrolledList);
}
