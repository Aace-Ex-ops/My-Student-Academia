export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  onboardingCompleted?: boolean;
  role?: "STUDENT" | "INSTRUCTOR" | "ADMIN" | "student" | "faculty" | "admin";
  avatar?: string;
  avatarIcon?: string;
  avatarUrl?: string;
  googlePhotoUrl?: string;
  avatarBg?: string;
  university?: string;
  phone?: string;
  educationLevel?: string;
  major?: string;
  careerInterest?: string;
  gradYear?: string;
  plan?: "free" | "monthly" | "yearly";
  paymentStatus?: "PAID" | "FREE";
  studentId?: string;
  registeredCredits?: number;
  enrolledCourses?: string[];
  customOnboarding?: any;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  credits: number;
  instructor: string;
  schedule: string;
  enrolled: number;
  maxCapacity: number;
  image?: string;
  badge?: string;
  price?: string;
  isPaid?: boolean;
  description?: string;
  prerequisites?: string[];
  slots?: ScheduleSlot[];
}

export interface ScheduleSlot {
  id: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  startTime: string; // e.g. "10:00"
  endTime: string;   // e.g. "11:30"
  room?: string;
  type?: "Lecture" | "Lab" | "Tutorial";
}

export interface WaitlistEntry {
  courseId: string;
  userId: string;
  position: number;
  joinedAt: string;
  status: "waiting" | "promoted" | "cancelled";
}

export interface OnboardingData {
  name?: string;
  email?: string;
  username: string;
  avatar: string;
  avatarIcon: string;
  avatarUrl?: string;
  avatarBg: string;
  university: string;
  phone: string;
  educationLevel: string;
  major: string;
  careerInterest: string;
  gradYear: string;
  plan: "free" | "monthly" | "yearly";
  paymentStatus: "PAID" | "FREE";
}
