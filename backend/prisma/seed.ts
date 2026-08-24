import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding My Student Academia database...');

  // Clean existing data
  await prisma.waitlist.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.scheduleSlot.deleteMany();
  await prisma.courseSection.deleteMany();
  await prisma.prerequisite.deleteMany();
  await prisma.course.deleteMany();
  await prisma.department.deleteMany();
  await prisma.term.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const studentAlex = await prisma.user.create({
    data: {
      email: 'alex.chen@student.academia.edu',
      name: 'Alex Chen',
      role: 'STUDENT',
      studentId: 'STU-2026-001',
      major: 'Computer Science'
    }
  });

  const studentSophia = await prisma.user.create({
    data: {
      email: 'sophia.patel@student.academia.edu',
      name: 'Sophia Patel',
      role: 'STUDENT',
      studentId: 'STU-2026-002',
      major: 'Data Science'
    }
  });

  const instructorDrReed = await prisma.user.create({
    data: {
      email: 'emily.reed@faculty.academia.edu',
      name: 'Dr. Emily Reed',
      role: 'INSTRUCTOR'
    }
  });

  const instructorDrSchmidt = await prisma.user.create({
    data: {
      email: 'karl.schmidt@faculty.academia.edu',
      name: 'Dr. Karl Schmidt',
      role: 'INSTRUCTOR'
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@academia.edu',
      name: 'Dean Arthur Vance',
      role: 'ADMIN'
    }
  });

  // Term
  const fallTerm = await prisma.term.create({
    data: {
      name: 'Fall 2026',
      isCurrent: true,
      registrationOpen: true
    }
  });

  // Departments
  const deptCS = await prisma.department.create({
    data: { code: 'CS', name: 'Computer Science & AI' }
  });
  const deptMath = await prisma.department.create({
    data: { code: 'MATH', name: 'Mathematics & Statistics' }
  });
  const deptPhys = await prisma.department.create({
    data: { code: 'PHYS', name: 'Physics & Astronomy' }
  });

  // Courses
  const cs101 = await prisma.course.create({
    data: {
      code: 'CS101',
      title: 'Intro to Computer Science',
      description: 'Foundations of programming, algorithms, data structures, and computational thinking in Python.',
      credits: 4,
      departmentId: deptCS.id
    }
  });

  const cs201 = await prisma.course.create({
    data: {
      code: 'CS201',
      title: 'Data Structures & Algorithms',
      description: 'Abstract data types, trees, graphs, sorting, searching, and algorithmic complexity.',
      credits: 4,
      departmentId: deptCS.id
    }
  });

  const cs310 = await prisma.course.create({
    data: {
      code: 'CS310',
      title: 'Artificial Intelligence & Neural Nets',
      description: 'Search algorithms, machine learning models, neural networks, and deep learning architectures.',
      credits: 4,
      departmentId: deptCS.id
    }
  });

  const math101 = await prisma.course.create({
    data: {
      code: 'MATH101',
      title: 'Calculus I: Differential Calculus',
      description: 'Limits, derivatives, differentiation rules, and optimization applications.',
      credits: 4,
      departmentId: deptMath.id
    }
  });

  const math210 = await prisma.course.create({
    data: {
      code: 'MATH210',
      title: 'Linear Algebra for Engineers',
      description: 'Vector spaces, matrices, linear transformations, eigenvalues, and eigenvectors.',
      credits: 4,
      departmentId: deptMath.id
    }
  });

  const phys301 = await prisma.course.create({
    data: {
      code: 'PHYS301',
      title: 'Quantum Physics & Mechanics',
      description: 'Wave functions, Schrödinger equation, quantum states, and particle physics fundamentals.',
      credits: 4,
      departmentId: deptPhys.id
    }
  });

  // Prerequisites: CS201 requires CS101. CS310 requires CS201.
  await prisma.prerequisite.create({
    data: { courseId: cs201.id, prereqCourseId: cs101.id }
  });

  await prisma.prerequisite.create({
    data: { courseId: cs310.id, prereqCourseId: cs201.id }
  });

  // Mark CS101 as completed for Alex Chen so he can register for CS201
  const secCS101_past = await prisma.courseSection.create({
    data: {
      courseId: cs101.id,
      sectionNumber: '00',
      termId: fallTerm.id,
      instructorId: instructorDrReed.id,
      maxCapacity: 30,
      room: 'Online'
    }
  });

  await prisma.enrollment.create({
    data: {
      userId: studentAlex.id,
      sectionId: secCS101_past.id,
      status: 'COMPLETED',
      grade: 'A'
    }
  });

  // Create active course sections & schedule slots
  // Section 1: CS201 (MW 09:00 - 10:30 AM)
  const secCS201 = await prisma.courseSection.create({
    data: {
      courseId: cs201.id,
      sectionNumber: '01',
      termId: fallTerm.id,
      instructorId: instructorDrReed.id,
      maxCapacity: 30,
      room: 'Turing Hall 101',
      slots: {
        create: [
          { day: 'MON', startTime: '09:00', endTime: '10:30' },
          { day: 'WED', startTime: '09:00', endTime: '10:30' }
        ]
      }
    }
  });

  // Section 2: MATH210 (TTh 10:00 - 11:30 AM)
  const secMATH210 = await prisma.courseSection.create({
    data: {
      courseId: math210.id,
      sectionNumber: '01',
      termId: fallTerm.id,
      instructorId: instructorDrReed.id,
      maxCapacity: 25,
      room: 'Euler Lab 204',
      slots: {
        create: [
          { day: 'TUE', startTime: '10:00', endTime: '11:30' },
          { day: 'THU', startTime: '10:00', endTime: '11:30' }
        ]
      }
    }
  });

  // Section 3: PHYS301 (MW 13:00 - 14:30 PM)
  const secPHYS301 = await prisma.courseSection.create({
    data: {
      courseId: phys301.id,
      sectionNumber: '01',
      termId: fallTerm.id,
      instructorId: instructorDrSchmidt.id,
      maxCapacity: 20,
      room: 'Feynman Center 302',
      slots: {
        create: [
          { day: 'MON', startTime: '13:00', endTime: '14:30' },
          { day: 'WED', startTime: '13:00', endTime: '14:30' }
        ]
      }
    }
  });

  // Section 4: CS310 (TTh 13:00 - 14:30 PM) - Small capacity (2 seats max) to test waitlist!
  const secCS310 = await prisma.courseSection.create({
    data: {
      courseId: cs310.id,
      sectionNumber: '01',
      termId: fallTerm.id,
      instructorId: instructorDrReed.id,
      maxCapacity: 2,
      room: 'AI Auditorium',
      slots: {
        create: [
          { day: 'TUE', startTime: '13:00', endTime: '14:30' },
          { day: 'THU', startTime: '13:00', endTime: '14:30' }
        ]
      }
    }
  });

  // Section 5: MATH101 (Fri 09:00 - 12:00 PM)
  const secMATH101 = await prisma.courseSection.create({
    data: {
      courseId: math101.id,
      sectionNumber: '01',
      termId: fallTerm.id,
      instructorId: instructorDrSchmidt.id,
      maxCapacity: 35,
      room: 'Newton Hall 105',
      slots: {
        create: [
          { day: 'FRI', startTime: '09:00', endTime: '12:00' }
        ]
      }
    }
  });

  // Seed Alex's current active registrations
  await prisma.enrollment.create({
    data: {
      userId: studentAlex.id,
      sectionId: secCS201.id,
      status: 'ENROLLED'
    }
  });

  await prisma.enrollment.create({
    data: {
      userId: studentAlex.id,
      sectionId: secMATH210.id,
      status: 'ENROLLED'
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
