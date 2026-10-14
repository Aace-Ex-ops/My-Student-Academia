import { EXPANDED_COURSE_CATALOG, CourseCatalogItem } from "./courseCatalogData";
import { getLocalEnrollments } from "./enrollmentStorage";
import { User } from "@/types";

export interface ChatMessage {
  id: string;
  sender: "student" | "faculty";
  senderName: string;
  text: string;
  timestamp: string; // ISO or formatted
  courseContext?: string;
  status?: "sent" | "delivered" | "read";
}

export interface FacultyContact {
  id: string;
  name: string;
  title: string;
  avatar: string;
  officeHours: string;
  email: string;
  status: "Online" | "In Office Hours" | "In Lecture" | "Available";
  courses: Array<{
    code: string;
    title: string;
    credits: number;
    description?: string;
  }>;
  isEnrolled: boolean;
}

/**
 * Resolves all faculty members relevant to the current user,
 * placing instructors of the student's enrolled courses first.
 */
export function resolveUserFaculty(currentUser?: User | null): FacultyContact[] {
  const userIdentifier = currentUser?.id || currentUser?.email || "";
  const enrollments = userIdentifier ? getLocalEnrollments(userIdentifier) : [];

  // Deduplicate enrolled course codes
  const enrolledCodes = new Set<string>();
  enrollments.forEach((e) => {
    const code = e.section?.course?.code || e.section?.course?.id || e.section?.courseId;
    if (code) enrolledCodes.add(code.toLowerCase().replace(/[^a-z0-9]/g, ""));
  });

  const facultyMap = new Map<string, FacultyContact>();

  // 1. First populate from user's actual enrollments
  enrollments.forEach((e) => {
    const rawCourse = e.section?.course || {};
    const rawCode = rawCourse.code || rawCourse.id || "";
    const cleanCode = rawCode.toLowerCase().replace(/[^a-z0-9]/g, "");

    const catalogMatch = EXPANDED_COURSE_CATALOG.find((c) => {
      const cCodeClean = c.code.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cIdClean = c.id.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cleanCode && (cCodeClean === cleanCode || cIdClean === cleanCode);
    });

    const instructorObj = catalogMatch?.instructor || (typeof e.section?.instructor === "object" ? e.section.instructor : null);
    const facultyName = instructorObj?.name || (typeof e.section?.instructor === "string" ? e.section.instructor : "") || "Dr. Vikram Sethi";
    
    if (facultyName === "Faculty Assigned" || facultyName === "Faculty Member") return;

    const courseItem = {
      code: catalogMatch?.code || rawCourse.code || "CS101",
      title: catalogMatch?.title || rawCourse.title || "Enrolled Course",
      credits: catalogMatch?.credits || rawCourse.credits || 4,
      description: catalogMatch?.description || rawCourse.description,
    };

    if (!facultyMap.has(facultyName)) {
      facultyMap.set(facultyName, {
        id: `fac-${facultyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        name: facultyName,
        title: instructorObj?.title || catalogMatch?.instructor.title || "Professor & Academic Mentor",
        avatar: instructorObj?.avatar || catalogMatch?.instructor.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        officeHours: catalogMatch?.scheduleTime ? `Mon/Wed ${catalogMatch.scheduleTime}` : "Mon, Wed & Fri 2:00 PM – 4:00 PM",
        email: `${facultyName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@msa.edu`,
        status: "Online",
        courses: [courseItem],
        isEnrolled: true,
      });
    } else {
      const existing = facultyMap.get(facultyName)!;
      if (!existing.courses.some((c) => c.code === courseItem.code)) {
        existing.courses.push(courseItem);
      }
    }
  });

  // 2. Also populate all other faculty from EXPANDED_COURSE_CATALOG so the directory is complete
  EXPANDED_COURSE_CATALOG.forEach((item) => {
    const facultyName = item.instructor.name;
    if (!facultyName || facultyName === "Faculty Assigned") return;

    const courseItem = {
      code: item.code,
      title: item.title,
      credits: item.credits,
      description: item.description,
    };

    if (!facultyMap.has(facultyName)) {
      facultyMap.set(facultyName, {
        id: `fac-${facultyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        name: facultyName,
        title: item.instructor.title,
        avatar: item.instructor.avatar,
        officeHours: `Tue/Thu ${item.scheduleTime}`,
        email: `${facultyName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@msa.edu`,
        status: Math.random() > 0.4 ? "Online" : "In Office Hours",
        courses: [courseItem],
        isEnrolled: false,
      });
    } else {
      const existing = facultyMap.get(facultyName)!;
      if (!existing.courses.some((c) => c.code === courseItem.code)) {
        existing.courses.push(courseItem);
      }
    }
  });

  // Sort enrolled faculty to the top, then alphabetically
  return Array.from(facultyMap.values()).sort((a, b) => {
    if (a.isEnrolled && !b.isEnrolled) return -1;
    if (!a.isEnrolled && b.isEnrolled) return 1;
    return a.name.localeCompare(b.name);
  });
}

const STORAGE_PREFIX = "msa_faculty_chat_v1_";

function getStorageKey(userIdentifier: string, facultyName: string): string {
  const safeUser = (userIdentifier || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const safeFac = (facultyName || "faculty").toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `${STORAGE_PREFIX}${safeUser}_${safeFac}`;
}

/**
 * Returns stored messages for a specific student-faculty pair.
 * Generates an initial welcome message if no thread exists.
 */
export function getThreadMessages(
  currentUser: User | null | undefined,
  faculty: FacultyContact
): ChatMessage[] {
  const userIdentifier = currentUser?.id || currentUser?.email || "guest";
  const key = getStorageKey(userIdentifier, faculty.name);

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load chat history:", e);
  }

  // Pre-seed an initial authentic welcome message from the teacher
  const primaryCourse = faculty.courses[0]?.title || "our course";
  const studentFirstName = currentUser?.name ? currentUser.name.split(" ")[0] : "Student";

  const initialWelcome: ChatMessage = {
    id: `msg-init-${Date.now()}`,
    sender: "faculty",
    senderName: faculty.name,
    text: `Hello ${studentFirstName}! I am ${faculty.name}. Welcome to the direct academic consultation channel for ${primaryCourse}. Feel free to ask any questions regarding lectures, upcoming assignments, or study materials. How can I assist you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    courseContext: faculty.courses[0]?.code,
    status: "read",
  };

  const initialList = [initialWelcome];
  try {
    localStorage.setItem(key, JSON.stringify(initialList));
  } catch (e) {}

  return initialList;
}

/**
 * Saves a new message to the student-faculty thread.
 */
export function saveThreadMessage(
  currentUser: User | null | undefined,
  facultyName: string,
  message: ChatMessage
): ChatMessage[] {
  const userIdentifier = currentUser?.id || currentUser?.email || "guest";
  const key = getStorageKey(userIdentifier, facultyName);

  let currentList: ChatMessage[] = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) currentList = JSON.parse(raw);
  } catch (e) {}

  const updated = [...currentList, message];
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save chat message:", e);
  }

  return updated;
}

/**
 * Clears the chat thread between user and faculty.
 */
export function clearThreadMessages(
  currentUser: User | null | undefined,
  facultyName: string
): void {
  const userIdentifier = currentUser?.id || currentUser?.email || "guest";
  const key = getStorageKey(userIdentifier, facultyName);
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}

/**
 * Generates an intelligent, context-aware teacher response.
 */
export function generateTeacherAutoResponse(
  faculty: FacultyContact,
  studentMessage: string,
  studentName?: string
): string {
  const msg = studentMessage.toLowerCase();
  const primaryCourse = faculty.courses[0];
  const cCode = primaryCourse?.code || "the course";
  const cTitle = primaryCourse?.title || "our curriculum";
  const studentFirst = studentName ? studentName.split(" ")[0] : "there";

  // Assignment / Homework / Deadline doubts
  if (msg.includes("assignment") || msg.includes("due") || msg.includes("deadline") || msg.includes("submission") || msg.includes("homework") || msg.includes("project")) {
    return `Hi ${studentFirst}, regarding ${cCode} assignments: All submissions are processed through the student portal. The current assignment is due this Friday at 11:59 PM. Please ensure your code passes all provided edge test cases and comments explain your time complexity before final submission.`;
  }

  // Office hours / Meeting queries
  if (msg.includes("office hour") || msg.includes("meet") || msg.includes("schedule") || msg.includes("appointment") || msg.includes("call") || msg.includes("time")) {
    return `Hello! My formal office hours are ${faculty.officeHours}. I am also available here on this direct messaging channel throughout the week. If you need a 1-on-1 code walkthrough, drop by during office hours or send your questions directly here!`;
  }

  // Notes / PDF / Study materials / Syllabus queries
  if (msg.includes("notes") || msg.includes("pdf") || msg.includes("syllabus") || msg.includes("material") || msg.includes("book") || msg.includes("reading") || msg.includes("slide")) {
    return `Great inquiry, ${studentFirst}. Complete vector PDF notes, lab manuals, and curated references for ${cTitle} are published directly under your Student Dashboard in the "Study Notes & PDFs" section. Make sure to download Module 1 & 2 formula summaries for quick revision.`;
  }

  // Exam / Test / Quiz queries
  if (msg.includes("exam") || msg.includes("test") || msg.includes("quiz") || msg.includes("midterm") || msg.includes("finals") || msg.includes("grade")) {
    return `For the upcoming assessment in ${cCode}: The questions will primarily evaluate conceptual depth, computational proofs, and practical problem solving. Review the problem sets from weeks 2 through 4, particularly edge case behavior. You will do great if you follow the lecture breakdowns!`;
  }

  // Doubt / Clarification / Help queries
  if (msg.includes("help") || msg.includes("doubt") || msg.includes("question") || msg.includes("understand") || msg.includes("confused") || msg.includes("explain")) {
    return `I'm happy to help break it down! Could you point to the specific theorem, algorithm step, or slide number you're working on? If it's code-related, feel free to paste the snippet or the error log right here.`;
  }

  // Gratitude / Thank you
  if (msg.includes("thank") || msg.includes("thanks") || msg.includes("appreciate")) {
    return `You're very welcome, ${studentFirst}! Consistent curiosity and asking questions is what makes a great scholar. Reach out anytime you hit an obstacle in ${cCode}.`;
  }

  // General academic response
  return `Thank you for reaching out, ${studentFirst}. I've noted your query regarding ${cTitle} (${cCode}). Let's work through this together—keep revising the daily lecture notes and don't hesitate to share code snippets or problem specifications whenever you need guidance!`;
}
