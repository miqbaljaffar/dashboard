import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import {
  initialStudents,
  initialAttendance,
  initialIncidences,
  initialRewards,
} from '../src/data/mockData';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing existing database records...');
  // Delete in reverse order of dependencies
  await prisma.attendanceRecord.deleteMany();
  await prisma.behavioralIncidence.deleteMany();
  await prisma.behavioralReward.deleteMany();
  await prisma.student.deleteMany();

  console.log('Seeding students...');
  for (const student of initialStudents) {
    await prisma.student.create({
      data: {
        id: student.id,
        name: student.name,
        gender: student.gender,
        age: student.age,
        cohort: student.cohort,
        classroom: student.classroom,
        enrollmentDate: student.enrollmentDate,
        graduationTarget: student.graduationTarget,
        status: student.status,
        behaviorScore: student.behaviorScore,
        attendanceRate: student.attendanceRate,
        violationsCount: student.violationsCount,
      },
    });
  }

  console.log('Seeding attendance records...');
  for (const att of initialAttendance) {
    await prisma.attendanceRecord.create({
      data: {
        studentId: att.studentId,
        date: att.date,
        morning: att.morning,
        classSession: att.classSession,
        eveningRollCall: att.eveningRollCall,
        notes: att.notes || null,
      },
    });
  }

  console.log('Seeding behavioral incidences...');
  for (const inc of initialIncidences) {
    await prisma.behavioralIncidence.create({
      data: {
        id: inc.id,
        studentId: inc.studentId,
        studentName: inc.studentName,
        date: inc.date,
        category: inc.category,
        severity: inc.severity,
        pointsDeducted: inc.pointsDeducted,
        status: inc.status,
        actionTaken: inc.actionTaken,
      },
    });
  }

  console.log('Seeding behavioral rewards...');
  for (const rew of initialRewards) {
    await prisma.behavioralReward.create({
      data: {
        id: rew.id,
        studentId: rew.studentId,
        studentName: rew.studentName,
        date: rew.date,
        category: rew.category,
        pointsAdded: rew.pointsAdded,
        description: rew.description,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
