import { Router, Request, Response } from 'express';

const router = Router();

// Cascade pool prioritizing Gemini 3.5 Flash
const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
];

// Track model cooldowns to prevent cascading into known rate-limited models
const modelHealth: Record<string, { cooldownUntil: number; reason: string }> = {};

function getActiveModelPool(): string[] {
  const now = Date.now();
  const available = GEMINI_MODELS.filter(
    (m) => !modelHealth[m] || modelHealth[m].cooldownUntil <= now
  );
  return available.length > 0 ? available : GEMINI_MODELS;
}

const SYSTEM_INSTRUCTION = `You are "Academia AI", the elite intelligent Study Assistant and Academic Copilot for My Student Academia.
You provide crystal-clear, pedagogically rigorous, and high-yield academic assistance to college and university students.
Follow these academic formatting principles:
1. Executive TL;DR & Core Concept: Lead with high-impact intuition.
2. Pedagogical Clarity: Use clear analogies and structured bullet points.
3. High-Yield Exam Takeaways: Highlight common misconceptions, edge cases, and exam pitfalls.
4. Technical & Code Precision: Provide clean, commented runnable code and mathematical formulas where appropriate.`;

router.post('/chat', async (req: Request, res: Response) => {
  const { prompt, history = [], mode = "CHAT", courseContext, enrolledList } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(503).json({
      error: 'Server Gemini API key not configured',
      fallbackToOffline: true,
    });
  }

  // Grounding instructions based on study mode
  let modeInstruction = "";
  if (mode === "SUMMARIZE") {
    modeInstruction = `\n\n[MODE: SUMMARIZATION. Format your response into: 1) Executive TL;DR, 2) Key Terminology & Definitions, 3) Structured Chapter Breakdown, 4) High-Yield Exam Takeaways & Pitfalls to Avoid.]`;
  } else if (mode === "FLASHCARDS") {
    modeInstruction = `\n\n[MODE: FLASHCARDS. Create 5-8 structured Question & Answer pairs for active recall spaced repetition.]`;
  } else if (mode === "PRACTICE") {
    modeInstruction = `\n\n[MODE: PRACTICE EXAM. Create 3-5 challenging multiple-choice or analytical exam questions with comprehensive solutions and explanations.]`;
  } else if (mode === "STUDY_PLAN") {
    modeInstruction = `\n\n[MODE: STUDY PLAN. Generate a realistic day-by-day revision roadmap with hourly allocations and milestones.]`;
  }

  let courseInstruction = "";
  if (courseContext) {
    courseInstruction = `\n\n[COURSE CONTEXT: The student is enrolled in ${courseContext}. Ground your examples and terminology in this curriculum.]`;
  }

  // Format conversation history for Gemini API
  const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
  for (const m of recentHistory) {
    formattedContents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    });
  }

  formattedContents.push({
    role: 'user',
    parts: [{ text: `${prompt}${courseInstruction}${modeInstruction}` }],
  });

  const pool = getActiveModelPool();
  let generatedText = "";
  let modelUsed = pool[0];
  let wasFlipped = false;
  let lastErrorMessage = "";

  for (let i = 0; i < pool.length; i++) {
    const targetModel = pool[i];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
      const payload = {
        contents: formattedContents,
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const json = (await response.json()) as any;
        const candidate = json.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        if (text && text.trim()) {
          generatedText = text.trim();
          modelUsed = targetModel;
          wasFlipped = i > 0;
          delete modelHealth[targetModel];
          break;
        }
      } else {
        const errJson = (await response.json().catch(() => ({}))) as any;
        lastErrorMessage = errJson?.error?.message || `HTTP ${response.status}`;
        console.warn(`[AI Proxy] Gemini model ${targetModel} returned status ${response.status}. Cascading...`);

        // Record cooldown: 60s for 429 quota exhaustion, 25s for 503 traffic buffer
        const cooldownMs = response.status === 429 ? 60000 : 25000;
        modelHealth[targetModel] = {
          cooldownUntil: Date.now() + cooldownMs,
          reason: lastErrorMessage,
        };
      }
    } catch (netErr: any) {
      lastErrorMessage = netErr?.message || String(netErr);
      modelHealth[targetModel] = {
        cooldownUntil: Date.now() + 30000,
        reason: lastErrorMessage,
      };
    }
  }

  if (!generatedText) {
    return res.status(503).json({
      error: `All AI models temporarily busy: ${lastErrorMessage}`,
      fallbackToOffline: true,
    });
  }

  return res.json({
    content: generatedText,
    modelUsed,
    wasFlipped,
  });
});

// Health check endpoint for model status
router.get('/status', (req: Request, res: Response) => {
  const now = Date.now();
  const status: Record<string, any> = {};

  for (const m of GEMINI_MODELS) {
    const health = modelHealth[m];
    if (health && health.cooldownUntil > now) {
      status[m] = {
        status: 'buffered',
        remainingSec: Math.ceil((health.cooldownUntil - now) / 1000),
        reason: health.reason,
      };
    } else {
      status[m] = {
        status: 'ready',
        remainingSec: 0,
      };
    }
  }

  res.json({
    active: true,
    models: status,
    primaryModel: "gemini-3.5-flash",
  });
});

export default router;
