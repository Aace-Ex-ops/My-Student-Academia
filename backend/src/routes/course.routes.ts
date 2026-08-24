import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// High-speed In-Memory Cache with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Helper to get or set cache
function getCached(key: string) {
  const entry = memoryCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

// Invalidate cache on mutations
export function invalidateCourseCache() {
  memoryCache.clear();
}

// Get all courses with sections, schedule slots, prerequisites, and capacity
router.get('/', async (req: Request, res: Response) => {
  const { departmentId, search } = req.query;
  const cacheKey = `courses:${departmentId || 'ALL'}:${search || ''}`;

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

  const cachedData = getCached(cacheKey);
  if (cachedData) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cachedData);
  }

  try {
    const whereClause: any = {};
    if (departmentId && typeof departmentId === 'string' && departmentId !== 'ALL') {
      whereClause.departmentId = departmentId;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause.OR = [
        { code: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        department: true,
        prerequisites: {
          include: {
            prereqCourse: true
          }
        },
        sections: {
          include: {
            instructor: true,
            slots: true,
            term: true,
            _count: {
              select: {
                enrollments: { where: { status: 'ENROLLED' } },
                waitlists: true
              }
            }
          }
        }
      },
      orderBy: { code: 'asc' }
    });

    setCache(cacheKey, courses);
    res.setHeader('X-Cache', 'MISS');
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch course catalog' });
  }
});

// Get departments list
router.get('/departments', async (req: Request, res: Response) => {
  const cacheKey = 'departments:all';
  res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');

  const cachedData = getCached(cacheKey);
  if (cachedData) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cachedData);
  }

  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });

    setCache(cacheKey, departments);
    res.setHeader('X-Cache', 'MISS');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

export default router;
