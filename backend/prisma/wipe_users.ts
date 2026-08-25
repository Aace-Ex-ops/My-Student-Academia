import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function wipeAllUsers() {
  console.log('Wiping all existing user accounts and enrollments from database...');
  try {
    const deletedWaitlists = await prisma.waitlist.deleteMany({});
    console.log(`Deleted ${deletedWaitlists.count} waitlist entries.`);

    const deletedEnrollments = await prisma.enrollment.deleteMany({});
    console.log(`Deleted ${deletedEnrollments.count} enrollments.`);

    // Nullify instructor references on course sections before deleting users
    await prisma.courseSection.updateMany({
      data: { instructorId: null },
    });

    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Deleted ${deletedUsers.count} user accounts.`);

    console.log('All user accounts completely wiped! Fresh database ready.');
  } catch (error) {
    console.error('Error wiping database users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

wipeAllUsers();
