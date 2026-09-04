const user = { id: "student-123", email: "test@example.com" };
const course = { id: "c1", code: "CS101", title: "Intro to CS" };

let localStorageData = {};
const ENROLLMENTS_KEY = "msa_user_enrollments_registry";

const mockLocalStorage = {
  getItem: (key) => localStorageData[key] || null,
  setItem: (key, value) => { localStorageData[key] = value; }
};

function getLocalEnrollments(userIdOrEmail) {
  if (!userIdOrEmail) return [];
  try {
    const raw = mockLocalStorage.getItem(ENROLLMENTS_KEY);
    if (!raw) return [];
    const registry = JSON.parse(raw);
    const userKey = userIdOrEmail.toLowerCase();
    return registry[userKey] || [];
  } catch (e) {
    return [];
  }
}

function saveLocalEnrollment(userIdOrEmail, course) {
  const userKey = userIdOrEmail.toLowerCase();
  const existing = getLocalEnrollments(userKey);

  const alreadyExists = existing.find(
    (e) =>
      e.section?.course?.code === course.code ||
      e.section?.course?.id === course.id ||
      e.section?.courseId === course.id
  );

  if (alreadyExists) return alreadyExists;

  const newEnrollment = {
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
    },
  };

  try {
    const raw = mockLocalStorage.getItem(ENROLLMENTS_KEY);
    const registry = raw ? JSON.parse(raw) : {};
    registry[userKey] = [...(registry[userKey] || []), newEnrollment];
    mockLocalStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(registry));
  } catch (e) {}

  return newEnrollment;
}

function getAllEnrolledCourseCodes(userIdOrEmail) {
  const enrollments = getLocalEnrollments(userIdOrEmail);
  const codes = new Set();
  enrollments.forEach((e) => {
    if (e.section?.course?.code) codes.add(e.section.course.code);
    if (e.section?.course?.id) codes.add(e.section.course.id);
    if (e.section?.courseId) codes.add(e.section.courseId);
  });
  return codes;
}

const userIdentifier = user.id || user.email;

// 1. User clicks Quick Register
saveLocalEnrollment(userIdentifier, course);
let codes1 = getAllEnrolledCourseCodes(userIdentifier);
console.log("After click:", Array.from(codes1));

// 2. User refreshes page
let codes2 = getAllEnrolledCourseCodes(userIdentifier);
console.log("On refresh:", Array.from(codes2));

console.log("Local Storage Data:", localStorageData);
