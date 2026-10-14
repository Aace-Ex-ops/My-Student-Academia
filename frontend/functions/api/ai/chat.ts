interface Env {
  GEMINI_API_KEY?: string;
}

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
];

const SYSTEM_INSTRUCTION = `You are "Academia AI", the elite intelligent Study Assistant and Academic Copilot for My Student Academia.
You provide crystal-clear, pedagogically rigorous, and high-yield academic assistance to college and university students.
Follow these academic formatting principles:
1. Executive TL;DR & Core Concept: Lead with high-impact intuition.
2. Pedagogical Clarity: Use clear analogies and structured bullet points.
3. High-Yield Exam Takeaways: Highlight common misconceptions, edge cases, and exam pitfalls.
4. Technical & Code Precision: Provide clean, commented runnable code and mathematical formulas where appropriate.`;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const apiKey = (context.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server AI key not configured', fallbackToOffline: true }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = (await context.request.json()) as any;
    const { prompt, history = [], mode = "CHAT", courseContext } = body || {};

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    let generatedText = "";
    let modelUsed = GEMINI_MODELS[0];
    let wasFlipped = false;
    let lastErrorMessage = "";

    // Multi-model auto-flip cascade
    for (let i = 0; i < GEMINI_MODELS.length; i++) {
      const targetModel = GEMINI_MODELS[i];
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

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = (await res.json()) as any;
          const candidate = json.candidates?.[0];
          const text = candidate?.content?.parts?.[0]?.text;

          if (text && text.trim()) {
            generatedText = text.trim();
            modelUsed = targetModel;
            wasFlipped = i > 0;
            break;
          }
        } else {
          const errJson = (await res.json().catch(() => ({}))) as any;
          lastErrorMessage = errJson?.error?.message || `HTTP ${res.status}`;
        }
      } catch (err: any) {
        lastErrorMessage = err?.message || String(err);
      }
    }

    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: lastErrorMessage, fallbackToOffline: true }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ content: generatedText, modelUsed, wasFlipped }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (globalErr: any) {
    return new Response(
      JSON.stringify({ error: globalErr?.message, fallbackToOffline: true }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
