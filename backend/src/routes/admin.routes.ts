import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get system stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalInstructors = await prisma.user.count({ where: { role: 'INSTRUCTOR' } });
    const totalCourses = await prisma.course.count();
    const totalEnrollments = await prisma.enrollment.count({ where: { status: 'ENROLLED' } });
    const totalWaitlisted = await prisma.waitlist.count();

    res.json({
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      totalWaitlisted
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Create new course
router.post('/course', async (req: Request, res: Response) => {
  const { code, title, description, credits, departmentId } = req.body;
  try {
    const course = await prisma.course.create({
      data: {
        code,
        title,
        description,
        credits: parseInt(credits, 10),
        departmentId
      }
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create course. Code might already exist.' });
  }
});

// Instructor assigned sections
router.get('/instructor/:userId/sections', async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const sections = await prisma.courseSection.findMany({
      where: { instructorId: userId },
      include: {
        course: true,
        slots: true,
        enrollments: {
          where: { status: 'ENROLLED' },
          include: { user: true }
        },
        waitlists: {
          include: { user: true },
          orderBy: { position: 'asc' }
        }
      }
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instructor sections' });
  }
});

export default router;
