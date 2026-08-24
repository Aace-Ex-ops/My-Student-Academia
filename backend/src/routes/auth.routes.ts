import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get demo users list
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Quick switch / login demo user
router.post('/login', async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { email }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      message: 'Login successful',
      user,
      token: `jwt-token-${user.id}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth Login & Auto-Sync
router.post('/google', async (req: Request, res: Response) => {
  const { name, email, avatarUrl, googleId } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required for Google login' });
  }

  const userName = name || 'Aditya Chatterjee';

  try {
    // 1. Find or create user
    let user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userName,
          email,
          role: 'STUDENT',
        }
      });
    }

    // 2. Ensure corresponding Student record exists
    let student = await prisma.student.findUnique({
      where: { userId: user.id }
    });

    if (!student) {
      // Find default or CS department
      const dept = await prisma.department.findFirst();
      student = await prisma.student.create({
        data: {
          userId: user.id,
          matricNo: `MSA-${Date.now().toString().slice(-6)}`,
          maxCredits: 18,
          currentTerm: 'Fall 2026',
          departmentId: dept ? dept.id : '1eff8088-0bc9-4644-8501-1af1f248a9e2'
        }
      });
    }

    res.json({
      message: 'Google Sign-In successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        studentId: student.id,
      },
      token: `google-jwt-${user.id}-${Date.now()}`
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

export default router;
