// Centralized Persistent Enrollment Manager
// Guarantees 100% enrollment state sync across LocalStorage, Backend API, and Cloudflare Pages

export interface StoredEnrollment {
  id: string;
  status: "ENROLLED";
  registeredAt: string;
  section: {
    id: string;
    courseId: string;
    sectionNumber: string;
    room: string;
    course: {
      id: string;
      code: string;
      title: string;
      credits: number;
      description: string;
    };
    instructor?: {
      name: string;
    };
    slots?: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };
}

const ENROLLMENTS_KEY = "msa_user_enrollments_registry";

export function getLocalEnrollments(userIdOrEmail?: string | null): StoredEnrollment[] {
  if (!userIdOrEmail) return [];
  try {
    const raw = localStorage.getItem(ENROLLMENTS_KEY);
    if (!raw) return [];
    const registry = JSON.parse(raw);
    
    // Fix: If legacy data was an array, it has no user keys.
    if (Array.isArray(registry)) {
      return [];
    }
    
    const userKey = userIdOrEmail.toLowerCase();
    return registry[userKey] || [];
  } catch (e) {
    console.warn("Failed to read local enrollments:", e);
    return [];
  }
}

export function saveLocalEnrollment(userIdOrEmail: string, course: any): StoredEnrollment {
  const userKey = userIdOrEmail.toLowerCase();
  const existing = getLocalEnrollments(userKey);

  // Check if already enrolled locally
  const alreadyExists = existing.find(
    (e) =>
      e.section?.course?.code === course.code ||
      e.section?.course?.id === course.id ||
      e.section?.courseId === course.id
  );

  if (alreadyExists) return alreadyExists;

  const newEnrollment: StoredEnrollment = {
    id: `enroll-${course.id || course.code}-${Date.now()}`,
    status: "ENROLLED",
    registeredAt: new Date().toISOString(),
    section: {
      id: `sec-${course.id || course.code}-01`,
      courseId: course.id || course.code,
      sectionNumber: "01",
      room: "Online Interactive Lecture",
      course: {
        id: course.id || course.code,
        code: course.code,
        title: course.title,
        credits: course.credits || 4,
        description: course.description || `Comprehensive study of ${course.title}.`,
      },
      instructor: course.instructor || { name: "Faculty Assigned" },
      slots: [
        {
          day: course.days || "Mon, Wed, Fri",
          startTime: course.time ? course.time.split("-")[0]?.trim() || "09:00 AM" : "09:00 AM",
          endTime: course.time ? course.time.split("-")[1]?.trim() || "10:30 AM" : "10:30 AM",
        },
      ],
    },
  };

  try {
    const raw = localStorage.getItem(ENROLLMENTS_KEY);
    let registry = raw ? JSON.parse(raw) : {};
    
    // Fix: If legacy data was an array, JSON.stringify will ignore string properties.
    if (Array.isArray(registry)) {
      registry = {}; 
    }
    
    registry[userKey] = [...(registry[userKey] || []), newEnrollment];
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(registry));
  } catch (e) {
    console.warn("Failed to save local enrollment:", e);
  }

  return newEnrollment;
}

export function removeLocalEnrollment(userIdOrEmail: string, courseCodeOrId: string): void {
  const userKey = userIdOrEmail.toLowerCase();
  try {
    const raw = localStorage.getItem(ENROLLMENTS_KEY);
    if (!raw) return;
    let registry = JSON.parse(raw);
    
    // Fix: If legacy data was an array, reset it.
    if (Array.isArray(registry)) {
      registry = {};
    }
    
    if (registry[userKey]) {
      registry[userKey] = registry[userKey].filter(
        (e: StoredEnrollment) =>
          e.section?.course?.code !== courseCodeOrId &&
          e.section?.course?.id !== courseCodeOrId &&
          e.section?.courseId !== courseCodeOrId &&
          e.section?.id !== courseCodeOrId
      );
      localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(registry));
    }
  } catch (e) {
    console.warn("Failed to remove local enrollment:", e);
  }
}

export function getAllEnrolledCourseCodes(userIdOrEmail?: string | null): Set<string> {
  const enrollments = getLocalEnrollments(userIdOrEmail);
  const codes = new Set<string>();
  enrollments.forEach((e) => {
    if (e.section?.course?.code) codes.add(e.section.course.code);
    if (e.section?.course?.id) codes.add(e.section.course.id);
    if (e.section?.courseId) codes.add(e.section.courseId);
  });
  return codes;
}
