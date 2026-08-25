import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateCertifiedEmail } from '../utils/emailValidator';

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

// ✦ REGISTER NEW STUDENT (CERTIFIED & VALID EMAILS ONLY) ✦
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required for registration.' });
  }

  // 1. Strict Certified Email Validation
  const validation = validateCertifiedEmail(email);
  if (!validation.isValid || !validation.isCertified) {
    return res.status(400).json({
      error: validation.error || 'Only valid and certified institutional/student email addresses can create an account.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userName = name.trim();

  try {
    // 2. Check if account already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email already exists. Please sign in instead.'
      });
    }

    // 3. Create User in Database
    const user = await prisma.user.create({
      data: {
        name: userName,
        email: normalizedEmail,
        role: 'STUDENT',
      }
    });

    // 4. Create Student record
    const dept = await prisma.department.findFirst();
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        matricNo: `MSA-${Date.now().toString().slice(-6)}`,
        maxCredits: 18,
        currentTerm: 'Fall 2026',
        departmentId: dept ? dept.id : '1eff8088-0bc9-4644-8501-1af1f248a9e2'
      }
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: student.id,
        avatar: 'scholar',
        avatarIcon: '👨‍🎓',
        avatarBg: 'from-amber-500 to-orange-600',
      },
      token: `jwt-token-${user.id}-${Date.now()}`
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Failed to create student account' });
  }
});

// ✦ LOGIN (REGISTERED USERS ONLY) ✦
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Student email is required to sign in.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // 1. Strict Existence Check: ONLY registered emails can log in
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Access Denied: No account found with this email. Only registered students can log in. Please create an account first.'
      });
    }

    // 2. Fetch or create student record for complete session
    let student = await prisma.student.findUnique({
      where: { userId: user.id }
    });

    if (!student) {
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
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: student.id,
        avatar: 'scholar',
        avatarIcon: '👨‍🎓',
        avatarBg: 'from-amber-500 to-orange-600',
      },
      token: `jwt-token-${user.id}-${Date.now()}`
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ✦ GOOGLE OAUTH LOGIN & AUTO-SYNC ✦
router.post('/google', async (req: Request, res: Response) => {
  const { name, email, avatarUrl, googleId } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required for Google login' });
  }

  // Certified check
  const validation = validateCertifiedEmail(email);
  if (!validation.isValid || !validation.isCertified) {
    return res.status(400).json({
      error: 'Google account email domain is not certified for university enrollment.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userName = name ? name.trim() : 'Student';

  try {
    // 1. Find or create user
    let user = await prisma.user.findFirst({
      where: { email: normalizedEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userName,
          email: normalizedEmail,
          role: 'STUDENT',
        }
      });
    }

    // 2. Ensure corresponding Student record exists
    let student = await prisma.student.findUnique({
      where: { userId: user.id }
    });

    if (!student) {
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
