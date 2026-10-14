import { getLocalEnrollments } from "./enrollmentStorage";
import { EXPANDED_COURSE_CATALOG } from "./courseCatalogData";

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
}

export interface CourseQuiz {
  id: string;
  courseCode: string;
  courseTitle: string;
  quizTitle: string;
  topic: string;
  difficulty: "Introductory" | "Intermediate" | "Advanced";
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  quizId: string;
  courseCode: string;
  courseTitle: string;
  score: number; // correct questions count
  totalQuestions: number;
  percentage: number; // 0 to 100
  gpa: number; // 0.00 to 4.00
  grade: string;
  completedAt: string;
}

export interface AcademicStanding {
  gpa: number;
  totalQuizzesTaken: number;
  averagePercentage: number;
  honorTitle: string;
  honorBadge: string;
  cohortPercentile: string;
  standingColor: "emerald" | "amber" | "rose" | "zinc";
}

const STORAGE_KEY_PREFIX = "msa_quiz_attempts_v1_";

/**
 * Returns all stored quiz attempts for a user.
 */
export function getStudentQuizAttempts(userIdOrEmail?: string | null): QuizAttempt[] {
  if (!userIdOrEmail) return [];
  const key = `${STORAGE_KEY_PREFIX}${userIdOrEmail.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to read quiz attempts:", e);
    return [];
  }
}

/**
 * Saves or updates a quiz attempt for a user.
 */
export function saveQuizAttempt(userIdOrEmail: string, attempt: QuizAttempt): void {
  const key = `${STORAGE_KEY_PREFIX}${userIdOrEmail.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  const existing = getStudentQuizAttempts(userIdOrEmail);

  // Replace attempt if already taken for this quizId, otherwise append
  const filtered = existing.filter((a) => a.quizId !== attempt.quizId);
  const updated = [...filtered, attempt];

  try {
    localStorage.setItem(key, JSON.stringify(updated));
    // Trigger storage event so other components update synchronously
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("msa_quiz_updated", { detail: { attempt } }));
  } catch (e) {
    console.warn("Failed to save quiz attempt:", e);
  }
}

/**
 * Computes Cumulative GPA and relevant Honor Score based on quiz performance.
 * Starts strictly at 0.00 if no quizzes are taken!
 */
export function calculateAcademicStanding(userIdOrEmail?: string | null): AcademicStanding {
  const attempts = getStudentQuizAttempts(userIdOrEmail);

  if (attempts.length === 0) {
    return {
      gpa: 0.0,
      totalQuizzesTaken: 0,
      averagePercentage: 0,
      honorTitle: "Pending Quiz Evaluation",
      honorBadge: "Unranked",
      cohortPercentile: "Take course quizzes to establish your GPA & Honor Standing",
      standingColor: "zinc",
    };
  }

  // Calculate weighted GPA (average across all completed course quizzes)
  const totalGpaSum = attempts.reduce((acc, curr) => acc + curr.gpa, 0);
  const avgGpa = parseFloat((totalGpaSum / attempts.length).toFixed(2));

  const totalPercentageSum = attempts.reduce((acc, curr) => acc + curr.percentage, 0);
  const avgPct = Math.round(totalPercentageSum / attempts.length);

  // Relevant Honor Standing mapping
  if (avgGpa >= 3.8) {
    return {
      gpa: avgGpa,
      totalQuizzesTaken: attempts.length,
      averagePercentage: avgPct,
      honorTitle: "Dean's Highest Honors",
      honorBadge: "Summa Cum Laude",
      cohortPercentile: "Top 2% of Department • Gold Distinction",
      standingColor: "emerald",
    };
  } else if (avgGpa >= 3.5) {
    return {
      gpa: avgGpa,
      totalQuizzesTaken: attempts.length,
      averagePercentage: avgPct,
      honorTitle: "Dean's Honor Roll",
      honorBadge: "Magna Cum Laude",
      cohortPercentile: "Top 8% of Department • Silver Distinction",
      standingColor: "emerald",
    };
  } else if (avgGpa >= 3.0) {
    return {
      gpa: avgGpa,
      totalQuizzesTaken: attempts.length,
      averagePercentage: avgPct,
      honorTitle: "Distinguished Academic Standing",
      honorBadge: "Cum Laude",
      cohortPercentile: "Top 25% of Department • Bronze Distinction",
      standingColor: "amber",
    };
  } else if (avgGpa >= 2.0) {
    return {
      gpa: avgGpa,
      totalQuizzesTaken: attempts.length,
      averagePercentage: avgPct,
      honorTitle: "Good Academic Standing",
      honorBadge: "Satisfactory",
      cohortPercentile: "Standard Cohort • Progressing",
      standingColor: "amber",
    };
  } else {
    return {
      gpa: avgGpa,
      totalQuizzesTaken: attempts.length,
      averagePercentage: avgPct,
      honorTitle: "Academic Probation Warning",
      honorBadge: "Needs Improvement",
      cohortPercentile: "Revision Recommended • Retake Quizzes to Boost GPA",
      standingColor: "rose",
    };
  }
}

/**
 * Converts a percentage score to a standard 4.0 scale GPA and letter grade.
 */
export function scoreToGpaAndGrade(score: number, total: number): { gpa: number; grade: string } {
  const percentage = Math.round((score / total) * 100);

  if (percentage >= 90) return { gpa: 4.0, grade: "A+" };
  if (percentage >= 80) return { gpa: 3.5, grade: "A" };
  if (percentage >= 70) return { gpa: 3.0, grade: "B" };
  if (percentage >= 60) return { gpa: 2.5, grade: "C" };
  if (percentage >= 50) return { gpa: 2.0, grade: "D" };
  return { gpa: 1.0, grade: "F" };
}

/**
 * Built-in Question Repository tailored to the academic curriculum.
 */
const COURSE_QUESTION_BANK: Record<string, QuizQuestion[]> = {
  // CS101: Computational Thinking & Algorithm Design
  CS101: [
    {
      id: "cs101-q1",
      prompt: "What is the worst-case asymptotic time complexity of Merge Sort?",
      options: ["O(N log N)", "O(N^2)", "O(N)", "O(log N)"],
      correctAnswer: 0,
      explanation: "Merge sort divides the array in half log N times and performs O(N) merging work at each level, guaranteeing O(N log N) worst-case time complexity.",
    },
    {
      id: "cs101-q2",
      prompt: "Which data structure follows the Last-In, First-Out (LIFO) order?",
      options: ["Queue", "Stack", "Binary Heap", "Hash Table"],
      correctAnswer: 1,
      explanation: "A Stack restricts insertions and deletions to the top element, adhering to the LIFO discipline.",
    },
    {
      id: "cs101-q3",
      prompt: "In Big-O notation, what does an algorithm with O(1) complexity signify?",
      options: ["Linear execution time", "Logarithmic execution time", "Constant execution time independent of input size", "Exponential worst-case runtime"],
      correctAnswer: 2,
      explanation: "O(1) means the runtime remains constant regardless of how large the input grows.",
    },
    {
      id: "cs101-q4",
      prompt: "What is the base case in a recursive algorithm responsible for?",
      options: ["Increasing stack frames", "Terminating recursive calls to prevent infinite loops", "Allocating heap memory", "Optimizing pointer arithmetic"],
      correctAnswer: 1,
      explanation: "The base case defines the termination condition where the function returns without making further recursive invocations.",
    },
    {
      id: "cs101-q5",
      prompt: "Which search algorithm requires the input collection to be sorted prior to execution?",
      options: ["Linear Search", "Binary Search", "Breadth-First Search", "Depth-First Search"],
      correctAnswer: 1,
      explanation: "Binary search repeatedly divides the search interval in half, which is only valid if elements are sorted.",
    },
  ],

  // CS201: Data Structures & High-Performance Computing
  CS201: [
    {
      id: "cs201-q1",
      prompt: "What is the balance factor of a node in an AVL tree?",
      options: ["Height(Left) - Height(Right)", "Number of left children - right children", "Depth of parent node", "Degree of root node"],
      correctAnswer: 0,
      explanation: "In an AVL tree, the balance factor is defined as the height of the left subtree minus the height of the right subtree, strictly maintained in {-1, 0, 1}.",
    },
    {
      id: "cs201-q2",
      prompt: "Which algorithm finds the single-source shortest path in a graph with non-negative edge weights?",
      options: ["Bellman-Ford", "Dijkstra's Algorithm", "Kruskal's Algorithm", "Floyd-Warshall"],
      correctAnswer: 1,
      explanation: "Dijkstra's algorithm greedily extracts the minimum-distance vertex using a priority queue, operating in O((V + E) log V).",
    },
    {
      id: "cs201-q3",
      prompt: "What collision resolution technique links elements with the same hash key into a linked list?",
      options: ["Linear Probing", "Quadratic Probing", "Chaining", "Double Hashing"],
      correctAnswer: 2,
      explanation: "Separate chaining stores collisions in bucketed linked lists or tree nodes at that hash index.",
    },
    {
      id: "cs201-q4",
      prompt: "In a Red-Black tree, which color must the root node always be?",
      options: ["Red", "Black", "Either Red or Black", "Double Black"],
      correctAnswer: 1,
      explanation: "Property 2 of Red-Black trees dictates that the root must always be Black.",
    },
    {
      id: "cs201-q5",
      prompt: "What is the average lookup time in an efficiently sized Hash Map?",
      options: ["O(log N)", "O(N)", "O(1)", "O(N log N)"],
      correctAnswer: 2,
      explanation: "Under uniform hashing and a balanced load factor, average hash map lookup operates in O(1) amortized time.",
    },
  ],

  // CS301: Modern Full-Stack Architecture & Cloud Systems
  CS301: [
    {
      id: "cs301-q1",
      prompt: "What is the primary benefit of React Server Components (RSC)?",
      options: ["Rendering without sending JavaScript bundle for server components to the browser", "Replacing CSS styling", "Eliminating database queries", "Running directly in WebAssembly"],
      correctAnswer: 0,
      explanation: "RSCs execute exclusively on the server, streaming HTML/JSON to the client with zero client-side JS bundle overhead.",
    },
    {
      id: "cs301-q2",
      prompt: "Which protocol provides full-duplex, persistent communication channels over a single TCP connection?",
      options: ["HTTP/1.1", "WebSockets", "REST", "SOAP"],
      correctAnswer: 1,
      explanation: "WebSockets establish bidirectional, low-latency communication between browser and server without repeated HTTP polling.",
    },
    {
      id: "cs301-q3",
      prompt: "What is Apache Kafka primarily designed for?",
      options: ["Relational schema management", "Distributed event streaming and log processing", "Frontend DOM manipulation", "SSL certificate generation"],
      correctAnswer: 1,
      explanation: "Kafka is a high-throughput, partitioned, fault-tolerant distributed event store and message broker.",
    },
    {
      id: "cs301-q4",
      prompt: "What does an API Gateway accomplish in a microservices architecture?",
      options: ["Single entry point for routing, authentication, and rate limiting", "Physical database sharding", "Operating system kernel compilation", "Local storage caching"],
      correctAnswer: 0,
      explanation: "An API gateway acts as the reverse proxy front door, handling cross-cutting concerns like auth, SSL termination, and routing.",
    },
    {
      id: "cs301-q5",
      prompt: "In Docker, what is the layer caching mechanism used for?",
      options: ["Speeding up subsequent container builds by reusing unmodified intermediate layers", "Encrypting passwords", "Translating x86 to ARM", "Generating CSS style sheets"],
      correctAnswer: 0,
      explanation: "Docker caches intermediate layers created by each Dockerfile directive to avoid rebuilding unchanged steps.",
    },
  ],

  // AI301: Machine Learning & Statistical Pattern Recognition
  AI301: [
    {
      id: "ai301-q1",
      prompt: "What does the bias-variance tradeoff describe in supervised machine learning?",
      options: ["The tension between underfitting (high bias) and overfitting (high variance)", "GPU clock speed vs memory bandwidth", "Dataset batch size vs learning rate", "Label encoding vs one-hot encoding"],
      correctAnswer: 0,
      explanation: "High bias leads to underfitting by oversimplifying patterns, while high variance leads to overfitting on training noise.",
    },
    {
      id: "ai301-q2",
      prompt: "Which loss function is standard for multi-class classification models?",
      options: ["Mean Squared Error (MSE)", "Categorical Cross-Entropy", "Huber Loss", "L1 Regularization"],
      correctAnswer: 1,
      explanation: "Categorical Cross-Entropy penalizes divergences between predicted softmax probabilities and true one-hot ground truth labels.",
    },
    {
      id: "ai301-q3",
      prompt: "What is the primary role of the activation function in neural networks?",
      options: ["Introducing non-linearity to learn complex representations", "Normalizing weights to zero", "Saving weights to disk", "Increasing learning rate"],
      correctAnswer: 0,
      explanation: "Without non-linear activation functions (ReLU, GELU, Sigmoid), stacked layers collapse into a single linear transformation.",
    },
    {
      id: "ai301-q4",
      prompt: "In Gradient Descent, what happens if the learning rate is excessively large?",
      options: ["The model converges instantaneously", "The loss may oscillate or diverge away from the local minimum", "Memory consumption exceeds RAM", "Weights freeze at zero"],
      correctAnswer: 1,
      explanation: "A high learning rate causes gradient steps to overshoot the minimum, often leading to exploding loss values.",
    },
    {
      id: "ai301-q5",
      prompt: "What does Dropout do during neural network training?",
      options: ["Randomly deactivates a fraction of neurons to prevent co-adaptation and overfitting", "Permanently deletes weights", "Stops training early", "Disables backpropagation"],
      correctAnswer: 0,
      explanation: "Dropout acts as a regularizer by randomly dropping units during forward pass, forcing network redundancy.",
    },
  ],

  // AI402: Deep Learning, Transformers & Generative Vision
  AI402: [
    {
      id: "ai402-q1",
      prompt: "In the self-attention mechanism, how is the attention matrix calculated?",
      options: ["Softmax((Q * K^T) / sqrt(d_k)) * V", "Sigmoid(Q + K) * V", "ReLU(Q * K)", "tanh(W * x + b)"],
      correctAnswer: 0,
      explanation: "The scaled dot-product attention formula computes attention weights between Queries (Q) and Keys (K), scaled by sqrt(d_k), multiplied by Values (V).",
    },
    {
      id: "ai402-q2",
      prompt: "Why are positional encodings necessary in Transformer models?",
      options: ["Transformers process all tokens in parallel and lack inherent recurrence or sequence order", "To reduce matrix dimensions", "To replace layer normalization", "To convert integers to floats"],
      correctAnswer: 0,
      explanation: "Because self-attention is permutation-invariant, positional encodings inject token sequence order into the input vectors.",
    },
    {
      id: "ai402-q3",
      prompt: "What is the role of Layer Normalization in transformer blocks?",
      options: ["Normalizes activations across features for each sample independently to stabilize gradient flow", "Sorts embeddings alphabetically", "Reduces parameter counts", "Calculates cross-validation"],
      correctAnswer: 0,
      explanation: "LayerNorm stabilizes training by normalizing over feature dimensions, eliminating dependency on batch size.",
    },
    {
      id: "ai402-q4",
      prompt: "What is the key mechanism behind Diffusion Models in generative image synthesis?",
      options: ["Iteratively denoising Gaussian noise conditioned on text prompts", "Training adversarial generator and discriminator", "Autoencoding latent vectors only", "Applying bilateral filtering"],
      correctAnswer: 0,
      explanation: "Diffusion models learn the reverse process of a forward Markov chain that incrementally adds Gaussian noise to data.",
    },
    {
      id: "ai402-q5",
      prompt: "What is FlashAttention designed to optimize?",
      options: ["GPU SRAM memory IO efficiency by computing exact attention in tiled blocks", "Decreasing model accuracy", "Pruning dead neurons", "Quantizing to 1-bit"],
      correctAnswer: 0,
      explanation: "FlashAttention minimizes high-bandwidth memory (HBM) reads and writes by tiling the attention computation in fast on-chip SRAM.",
    },
  ],
};

/**
 * Generates dynamic academic questions for courses not in the hardcoded bank.
 */
function generateFallbackQuizQuestions(courseCode: string, courseTitle: string): QuizQuestion[] {
  return [
    {
      id: `${courseCode.toLowerCase()}-q1`,
      prompt: `In the study of ${courseTitle} (${courseCode}), what is the foundational principle underlying module 1?`,
      options: [
        "Systematic problem formalization and theoretical validation",
        "Arbitrary trial and error without metrics",
        "Ignoring boundary constraints",
        "Purely mechanical memorization",
      ],
      correctAnswer: 0,
      explanation: "Rigorous academic study requires structured formalization, proof verification, and systematic modeling.",
    },
    {
      id: `${courseCode.toLowerCase()}-q2`,
      prompt: `Which approach is standard when optimizing performance in ${courseTitle}?`,
      options: [
        "Analyzing asymptotic complexity and eliminating redundant bottlenecks",
        "Increasing hardware frequency blindly",
        "Removing all validation assertions",
        "Multiplying memory footprint arbitrarily",
      ],
      correctAnswer: 0,
      explanation: "Performance optimization focuses on algorithmic efficiency, memory layout, and eliminating computational bottlenecks.",
    },
    {
      id: `${courseCode.toLowerCase()}-q3`,
      prompt: `What is the significance of peer-reviewed empirical evaluation in ${courseTitle}?`,
      options: [
        "Ensures reproducibility, statistical validity, and benchmark consistency",
        "Increases publication cost",
        "Replaces mathematical proofs entirely",
        "Only applies to industrial projects",
      ],
      correctAnswer: 0,
      explanation: "Empirical benchmarking validates that theoretical advancements yield measurable and reproducible results.",
    },
    {
      id: `${courseCode.toLowerCase()}-q4`,
      prompt: `When encountering non-linear edge cases in ${courseTitle}, what is the best practice?`,
      options: [
        "Formal boundary-testing and defining safety invariant fallbacks",
        "Discarding unexpected input data silently",
        "Assuming edge cases never occur in production",
        "Disabling error handlers",
      ],
      correctAnswer: 0,
      explanation: "Robust systems explicitly define and assert invariants for boundary conditions and edge cases.",
    },
    {
      id: `${courseCode.toLowerCase()}-q5`,
      prompt: `How do interdisciplinary applications elevate the practical impact of ${courseTitle}?`,
      options: [
        "By applying core stream models to solve adjacent real-world challenges",
        "By restricting models to legacy single-domain silos",
        "By increasing abstraction until implementation is impossible",
        "By avoiding collaboration with other engineering departments",
      ],
      correctAnswer: 0,
      explanation: "Stream-adjacent cross-pollination allows core foundational tools to unlock breakthroughs in medicine, finance, and engineering.",
    },
  ];
}

/**
 * Resolves available quizzes tailored to the student's enrolled courses.
 */
export function getEnrolledCourseQuizzes(userIdOrEmail?: string | null): CourseQuiz[] {
  const userIdentifier = userIdOrEmail || "";
  const enrollments = userIdentifier ? getLocalEnrollments(userIdentifier) : [];

  const enrolledCourseCodes = new Map<string, { code: string; title: string; difficulty?: string }>();

  enrollments.forEach((e) => {
    const code = e.section?.course?.code || e.section?.course?.id || e.section?.courseId;
    const title = e.section?.course?.title || "Enrolled Course";
    if (code) {
      const cleanCode = code.toUpperCase().trim();
      if (!enrolledCourseCodes.has(cleanCode)) {
        enrolledCourseCodes.set(cleanCode, { code: cleanCode, title });
      }
    }
  });

  // If user has enrollments, generate quizzes specifically for those courses!
  if (enrolledCourseCodes.size > 0) {
    const list: CourseQuiz[] = [];
    enrolledCourseCodes.forEach(({ code, title }) => {
      const catalogMatch = EXPANDED_COURSE_CATALOG.find((c) => c.code.toUpperCase() === code);
      const questions = COURSE_QUESTION_BANK[code] || generateFallbackQuizQuestions(code, title);

      list.push({
        id: `quiz-${code.toLowerCase()}-mod1`,
        courseCode: code,
        courseTitle: catalogMatch?.title || title,
        quizTitle: `${code} Milestone Assessment: Core Principles`,
        topic: catalogMatch?.tags?.[0] || "Foundations & Theory",
        difficulty: catalogMatch?.difficulty === "Advanced" ? "Advanced" : catalogMatch?.difficulty === "Capstone" ? "Advanced" : "Intermediate",
        questions,
      });

      // Second assessment for enrolled courses with high credits
      list.push({
        id: `quiz-${code.toLowerCase()}-mod2`,
        courseCode: code,
        courseTitle: catalogMatch?.title || title,
        quizTitle: `${code} Applied Practicum: Advanced Concepts`,
        topic: catalogMatch?.tags?.[1] || "Algorithms & Architecture",
        difficulty: "Advanced",
        questions: questions.slice().reverse(),
      });
    });

    return list;
  }

  // Fallback: If student has not enrolled in any courses yet, supply representative core quizzes
  return [
    {
      id: "quiz-cs101-mod1",
      courseCode: "CS101",
      courseTitle: "Computational Thinking & Algorithm Design",
      quizTitle: "CS101 Milestone Assessment: Core Principles",
      topic: "Complexity & Data Structures",
      difficulty: "Introductory",
      questions: COURSE_QUESTION_BANK["CS101"],
    },
    {
      id: "quiz-cs201-mod1",
      courseCode: "CS201",
      courseTitle: "Data Structures & High-Performance Computing",
      quizTitle: "CS201 Milestone Assessment: Advanced Structures",
      topic: "Graphs & Balancing Trees",
      difficulty: "Intermediate",
      questions: COURSE_QUESTION_BANK["CS201"],
    },
    {
      id: "quiz-ai301-mod1",
      courseCode: "AI301",
      courseTitle: "Machine Learning & Statistical Pattern Recognition",
      quizTitle: "AI301 Milestone Assessment: Statistical Learning",
      topic: "Supervised Learning & Regularization",
      difficulty: "Intermediate",
      questions: COURSE_QUESTION_BANK["AI301"],
    },
  ];
}
