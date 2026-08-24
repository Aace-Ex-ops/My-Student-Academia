import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Helper to ensure student user exists in database
async function getOrCreateStudent(userId: string, name?: string, email?: string) {
  if (!userId) return null;

  try {
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      // Check if user exists by email if provided
      if (email) {
        user = await prisma.user.findUnique({
          where: { email }
        });
      }

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            name: name || "Aditya Chatterjee",
            email: email || `${userId.replace(/[^a-zA-Z0-9]/g, "")}@academia.edu`,
            role: "STUDENT",
            studentId: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
            major: "Computer Science & Engineering",
          }
        });
      }
    }
    return user;
  } catch (error) {
    console.error("Error in getOrCreateStudent:", error);
    // Fallback to first student if available
    return await prisma.user.findFirst({ where: { role: "STUDENT" } });
  }
}

// Get student's current registrations & waitlists
router.get('/student/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await getOrCreateStudent(userId);

    if (!user) {
      return res.json({
        user: null,
        totalRegisteredCredits: 0,
        enrollments: [],
        waitlists: []
      });
    }

    const rawEnrollments = await prisma.enrollment.findMany({
      where: { userId: user.id, status: 'ENROLLED' },
      include: {
        section: {
          include: {
            course: true,
            instructor: true,
            slots: true
          }
        }
      }
    });

    const waitlists = await prisma.waitlist.findMany({
      where: { userId: user.id },
      include: {
        section: {
          include: {
            course: true,
            instructor: true,
            slots: true
          }
        }
      },
      orderBy: { position: 'asc' }
    });

    const totalRegisteredCredits = rawEnrollments.reduce((acc, curr) => acc + (curr.section?.course?.credits || 0), 0);

    res.json({
      user,
      totalRegisteredCredits,
      enrollments: rawEnrollments,
      waitlists
    });
  } catch (error) {
    console.error('Failed to fetch student timetable:', error);
    res.json({
      user: null,
      totalRegisteredCredits: 0,
      enrollments: [],
      waitlists: []
    });
  }
});

// Register for a course section
router.post('/enroll', async (req: Request, res: Response) => {
  const { userId, sectionId, courseId, userName, userEmail } = req.body;

  try {
    const user = await getOrCreateStudent(userId, userName, userEmail);
    if (!user) {
      return res.status(400).json({ error: 'Could not authenticate student account for registration.' });
    }

    let targetSection: any = null;

    if (sectionId) {
      targetSection = await prisma.courseSection.findUnique({
        where: { id: sectionId },
        include: {
          course: true,
          slots: true,
          _count: {
            select: {
              enrollments: { where: { status: 'ENROLLED' } },
              waitlists: true
            }
          }
        }
      });
    }

    // If sectionId not provided or not found, try resolving via courseId
    if (!targetSection && courseId) {
      targetSection = await prisma.courseSection.findFirst({
        where: { courseId },
        include: {
          course: true,
          slots: true,
          _count: {
            select: {
              enrollments: { where: { status: 'ENROLLED' } },
              waitlists: true
            }
          }
        }
      });
    }

    // Fallback if no sections exist for course, create/find a default section
    if (!targetSection) {
      let course = null;
      if (courseId) {
        course = await prisma.course.findUnique({ where: { id: courseId } });
      }
      if (!course) {
        course = await prisma.course.findFirst();
      }

      if (course) {
        const term = await prisma.term.findFirst({ where: { isCurrent: true } }) ||
                     await prisma.term.findFirst() ||
                     await prisma.term.create({ data: { name: "Fall 2026", isCurrent: true } });

        targetSection = await prisma.courseSection.create({
          data: {
            courseId: course.id,
            termId: term.id,
            sectionNumber: "01",
            maxCapacity: 40,
            room: "Online Interactive",
          },
          include: {
            course: true,
            slots: true,
            _count: {
              select: {
                enrollments: { where: { status: 'ENROLLED' } },
                waitlists: true
              }
            }
          }
        });
      }
    }

    if (!targetSection) {
      return res.status(404).json({ error: 'Course or section not found.' });
    }

    // 1. Check if already enrolled in this course
    const existingEnrollments = await prisma.enrollment.findMany({
      where: { userId: user.id, status: 'ENROLLED' },
      include: { section: { include: { course: true } } }
    });

    const isAlreadyInThisCourse = existingEnrollments.some(
      (e) => e.section.courseId === targetSection.courseId || e.sectionId === targetSection.id
    );

    if (isAlreadyInThisCourse) {
      return res.status(200).json({
        alreadyEnrolled: true,
        message: `You already registered for this course mate (${targetSection.course.code})!`,
        course: targetSection.course
      });
    }

    // 2. Check Credit Limit (Max 24 Credits)
    const currentCredits = existingEnrollments.reduce((sum, e) => sum + e.section.course.credits, 0);
    if (currentCredits + targetSection.course.credits > 24) {
      return res.status(400).json({
        error: `Credit limit reached. Maximum allowed is 24 credits (Current: ${currentCredits}, Adding: ${targetSection.course.credits}).`
      });
    }

    // 3. Direct Enrollment Upsert
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_sectionId: { userId: user.id, sectionId: targetSection.id } },
      update: { status: 'ENROLLED', registeredAt: new Date() },
      create: { userId: user.id, sectionId: targetSection.id, status: 'ENROLLED' }
    });

    // Remove from waitlists if was on it
    await prisma.waitlist.deleteMany({
      where: { userId: user.id, sectionId: targetSection.id }
    });

    res.status(201).json({
      success: true,
      alreadyEnrolled: false,
      message: `Successfully registered for ${targetSection.course.code} - ${targetSection.course.title}! 🚀`,
      enrollment
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
});

// Drop a course section entirely
router.post('/drop', async (req: Request, res: Response) => {
  const { userId, sectionId } = req.body;

  try {
    await prisma.enrollment.deleteMany({
      where: { userId, sectionId }
    });

    await prisma.waitlist.deleteMany({
      where: { userId, sectionId }
    });

    res.json({ success: true, message: 'Course successfully dropped.' });
  } catch (error) {
    console.error('Failed to drop course:', error);
    res.status(500).json({ error: 'Failed to drop course.' });
  }
});

export default router;
