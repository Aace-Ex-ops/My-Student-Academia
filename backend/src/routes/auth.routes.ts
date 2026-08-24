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
      token: `demo-jwt-token-${user.id}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
