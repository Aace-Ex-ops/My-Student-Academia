import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Check,
  MapPin,
  Tag
} from "lucide-react";

interface CourseRegistrationModalProps {
  course: any;
  section: any;
  currentUser: any;
  onClose: () => void;
  onSuccess: (message: string, isWaitlisted: boolean) => void;
}

export function CourseRegistrationModal({
  course,
  section,
  currentUser,
  onClose,
  onSuccess,
}: CourseRegistrationModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSection, setSelectedSection] = useState<any>(section || (course?.sections && course?.sections[0]));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userEnrollments, setUserEnrollments] = useState<any[]>([]);

  // Fetch student's existing registered courses to detect timetable conflict
  useEffect(() => {
    if (currentUser?.id) {
      fetch(`/api/registration/student/${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.enrollments) {
            setUserEnrollments(data.enrollments);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [currentUser]);

  // Check if chosen section conflicts with student's current schedule
  const checkTimeConflict = (sec: any) => {
    if (!sec || !sec.slots || !userEnrollments.length) return null;

    for (const enrolled of userEnrollments) {
      const existingSec = enrolled.section;
      if (!existingSec || !existingSec.slots) continue;

      for (const targetSlot of sec.slots) {
        for (const existSlot of existingSec.slots) {
          if (targetSlot.day === existSlot.day) {
            // Check time overlap
            const toMins = (t: string) => {
              const [h, m] = t.split(":").map(Number);
              return h * 60 + m;
            };
            const s1 = toMins(targetSlot.startTime);
            const e1 = toMins(targetSlot.endTime);
            const s2 = toMins(existSlot.startTime);
            const e2 = toMins(existSlot.endTime);

            if (Math.max(s1, s2) < Math.min(e1, e2)) {
              return {
                conflictingCourse: existingSec.course?.code || "Enrolled Course",
                day: targetSlot.day,
                time: `${targetSlot.startTime}-${targetSlot.endTime}`,
              };
            }
          }
        }
      }
    }
    return null;
  };

  const currentConflict = checkTimeConflict(selectedSection);
  const enrolledCount = selectedSection?._count?.enrollments || 0;
  const waitlistCount = selectedSection?._count?.waitlists || 0;
  const isFull = enrolledCount >= (selectedSection?.maxCapacity || 50);

  const handleConfirmEnrollment = async () => {
    if (!currentUser) {
      setErrorMsg("Please login as a student to register.");
      return;
    }

    if (!selectedSection) {
      setErrorMsg("Please select a timetable section slot.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch("/api/registration/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          courseId: course?.id,
          sectionId: selectedSection.id,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error || "Registration failed.");
      } else {
        onSuccess(json.message, json.isWaitlisted || false);
        onClose();
      }
    } catch (err) {
      setErrorMsg("Connection error during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-2xl w-full bg-[#FFFFFF] border border-[#F5E7C6] rounded-3xl shadow-2xl overflow-hidden my-auto text-left"
      >
        {/* Header Cover Banner */}
        <div className="relative h-44 sm:h-52 w-full bg-[#222222]">
          <img
            src={
              course.image ||
              "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop"
            }
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#222222]/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Course Badges & Code */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#FF6D1F] text-[#FAF3E1] text-xs font-black px-3 py-1 rounded-xl shadow-md">
                  {course.code}
                </span>
                <span className="bg-[#FAF3E1]/90 backdrop-blur-md text-[#222222] text-xs font-extrabold px-3 py-1 rounded-xl border border-white/20">
                  {course.credits} Credits
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#FAF3E1]">
                {course.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Stepper Header Bar */}
        <div className="bg-[#FAF3E1] border-b border-[#F5E7C6] px-6 py-3 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step === 1 ? "bg-[#FF6D1F] text-[#FAF3E1]" : "bg-emerald-600 text-white"
              }`}
            >
              {step === 1 ? "1" : <Check className="w-3.5 h-3.5" />}
            </span>
            <span className={step === 1 ? "text-[#FF6D1F] font-extrabold" : "text-[#222222]/70"}>
              Course Overview
            </span>
          </div>

          <div className="w-8 h-0.5 bg-[#F5E7C6]" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step === 2 ? "bg-[#FF6D1F] text-[#FAF3E1]" : "bg-[#F5E7C6] text-[#222222]/50"
              }`}
            >
              2
            </span>
            <span className={step === 2 ? "text-[#FF6D1F] font-extrabold" : "text-[#222222]/70"}>
              Timetable Slot Picker
            </span>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: COURSE OVERVIEW & DETAILS */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            {/* Description */}
            <div>
              <h4 className="text-xs font-extrabold text-[#222222]/60 uppercase tracking-wider mb-1.5">
                About Course
              </h4>
              <p className="text-sm text-[#222222]/80 leading-relaxed font-medium">
                {course.description ||
                  "Master key theoretical concepts, hands-on lab projects, and problem-solving strategies under expert faculty guidance."}
              </p>
            </div>

            {/* Grid Stats: Instructor, Room, Prerequisites */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#FAF3E1]/70 border border-[#F5E7C6] space-y-1">
                <span className="text-[11px] font-bold text-[#FF6D1F] uppercase tracking-wider block">
                  Lead Instructor
                </span>
                <div className="text-xs font-extrabold text-[#222222] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF6D1F]" />
                  <span>{selectedSection?.instructor?.name || "Faculty Member"}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF3E1]/70 border border-[#F5E7C6] space-y-1">
                <span className="text-[11px] font-bold text-[#FF6D1F] uppercase tracking-wider block">
                  Campus Location
                </span>
                <div className="text-xs font-extrabold text-[#222222] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF6D1F]" />
                  <span>Room: {selectedSection?.room || "Main Academic Block"}</span>
                </div>
              </div>
            </div>

            {/* Prerequisites Banner */}
            {course.prerequisites && course.prerequisites.length > 0 ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-extrabold block">Prerequisite Requirement</span>
                  <span>
                    Must have completed:{" "}
                    <strong>
                      {course.prerequisites.map((p: any) => p.prereqCourse.code).join(", ")}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-bold">No Prerequisites Required • Open for Enrollment</span>
              </div>
            )}

            {/* Seat Capacity Gauge */}
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#F5E7C6] space-y-2">
              <div className="flex justify-between text-xs font-extrabold text-[#222222]">
                <span>Section Seat Capacity</span>
                <span className={isFull ? "text-rose-600" : "text-emerald-600"}>
                  {enrolledCount}/{selectedSection?.maxCapacity || 50} Enrolled{" "}
                  {isFull && `(Waitlist: #${waitlistCount + 1})`}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#FAF3E1] border border-[#F5E7C6] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFull ? "bg-rose-500" : "bg-[#FF6D1F]"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (enrolledCount / (selectedSection?.maxCapacity || 50)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Next Step Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3.5 rounded-2xl bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] font-black text-xs transition-all shadow-lg shadow-[#FF6D1F]/25 hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                <span>Select Timetable Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TIMETABLE SLOT PICKER & CONFLICT RESOLUTION */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div>
              <h4 className="text-xs font-extrabold text-[#222222]/60 uppercase tracking-wider mb-1">
                Choose Preferred Section Schedule
              </h4>
              <p className="text-xs text-[#222222]/70 font-medium">
                Select an available section slot for {course.code}. The system automatically validates schedule conflicts.
              </p>
            </div>

            {/* Section Options Selector */}
            <div className="space-y-3">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((sec: any) => {
                  const conflict = checkTimeConflict(sec);
                  const isSelected = selectedSection?.id === sec.id;
                  const secEnrolled = sec._count?.enrollments || 0;
                  const secFull = secEnrolled >= sec.maxCapacity;

                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSection(sec)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? "border-[#FF6D1F] bg-[#FAF3E1]/80 shadow-md"
                          : "border-[#F5E7C6] bg-[#FFFFFF] hover:border-[#FF6D1F]/50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-[#222222]">
                            Section {sec.sectionNumber}
                          </span>
                          <span className="text-[11px] font-bold text-[#FF6D1F] bg-[#FF6D1F]/15 px-2 py-0.5 rounded-md">
                            Room {sec.room}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-[#222222]/80 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#FF6D1F]" />
                          <span>
                            {sec.slots
                              ?.map(
                                (s: any) => `${s.day} ${s.startTime} - ${s.endTime}`
                              )
                              .join(", ")}
                          </span>
                        </div>
                      </div>

                      {/* Status / Conflict Badge */}
                      <div className="flex items-center gap-3">
                        {conflict ? (
                          <span className="text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Conflict: {conflict.conflictingCourse}</span>
                          </span>
                        ) : secFull ? (
                          <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl">
                            Waitlist Queue
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl">
                            Empty Slot Available
                          </span>
                        )}

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-[#FF6D1F] bg-[#FF6D1F] text-white"
                              : "border-[#222222]/30"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-2xl bg-[#FAF3E1] border border-[#F5E7C6] text-xs font-bold text-[#222222]/70 text-center">
                  Standard Schedule: Mon/Wed 10:00 - 11:30 AM (Room 302)
                </div>
              )}
            </div>

            {/* Time Conflict Alert Banner if selected section conflicts */}
            {currentConflict && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-900 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>
                  Schedule Conflict Detected! Overlaps with registered course{" "}
                  <strong>{currentConflict.conflictingCourse}</strong> on {currentConflict.day}{" "}
                  ({currentConflict.time}). Please select a non-overlapping slot.
                </span>
              </div>
            )}

            {/* Bottom Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-[#F5E7C6]">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-[#F5E7C6] bg-[#FFFFFF] hover:bg-[#FAF3E1] text-[#222222] font-bold text-xs transition-all"
              >
                ← Back to Details
              </button>

              <button
                onClick={handleConfirmEnrollment}
                disabled={loading || Boolean(currentConflict)}
                className={`px-7 py-3.5 rounded-2xl font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                  currentConflict
                    ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                    : isFull
                    ? "bg-[#222222] hover:bg-[#333333] text-[#FAF3E1]"
                    : "bg-[#FF6D1F] hover:bg-[#e65c10] text-[#FAF3E1] shadow-[#FF6D1F]/25 hover:scale-105"
                }`}
              >
                {loading ? (
                  "Processing Registration..."
                ) : isFull ? (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FF6D1F]" />
                    <span>Join Waitlist Queue 🎉</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FAF3E1]" />
                    <span>Confirm & Register Course 🎉</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
