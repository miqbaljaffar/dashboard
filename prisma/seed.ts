import { PrismaClient } from '@prisma/client';
import {
  initialStudents,
  initialAttendance,
  initialQuizzes,
  initialAssignments,
  initialDailyReports,
  initialDormRooms,
  initialIncidences,
  initialRewards,
} from '../src/data/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database records...');
  // Delete in reverse order of dependencies
  await prisma.attendanceRecord.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.behavioralIncidence.deleteMany();
  await prisma.behavioralReward.deleteMany();
  await prisma.student.deleteMany();
  await prisma.quizTest.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.dormRoom.deleteMany();

  console.log('Seeding dorm rooms...');
  for (const room of initialDormRooms) {
    await prisma.dormRoom.create({
      data: room,
    });
  }

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
        jlptTarget: student.jlptTarget,
        currentJlptLevel: student.currentJlptLevel,
        jftTarget: student.jftTarget,
        sswField: student.sswField,
        interviewReadiness: student.interviewReadiness,
        emergencyContactName: student.emergencyContactName,
        emergencyContactPhone: student.emergencyContactPhone,
        relationship: student.relationship,
        dormBuilding: student.dormBuilding,
        dormRoom: student.dormRoom,
        dormBed: student.dormBed,
        status: student.status,
        behaviorScore: student.behaviorScore,
        attendanceRate: student.attendanceRate,
        quizAverage: student.quizAverage,
        missingAssignmentsCount: student.missingAssignmentsCount,
        violationsCount: student.violationsCount,
        progressTrend: student.progressTrend,
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

  console.log('Seeding quizzes...');
  for (const quiz of initialQuizzes) {
    await prisma.quizTest.create({
      data: {
        id: quiz.id,
        title: quiz.title,
        type: quiz.type,
        date: quiz.date,
        cohort: quiz.cohort,
        averageScore: quiz.averageScore,
        highestScore: quiz.highestScore,
        lowestScore: quiz.lowestScore,
        passRate: quiz.passRate,
        questionAnalysis: quiz.questionAnalysis as any,
        weakTopics: quiz.weakTopics,
        strongTopics: quiz.strongTopics,
      },
    });
  }

  console.log('Seeding assignments...');
  for (const assign of initialAssignments) {
    await prisma.assignment.create({
      data: assign,
    });
  }

  console.log('Seeding daily reports...');
  for (const report of initialDailyReports) {
    await prisma.dailyReport.create({
      data: {
        id: report.id,
        studentId: report.studentId,
        studentName: report.studentName,
        date: report.date,
        learnedToday: report.learnedToday,
        difficultMaterial: report.difficultMaterial,
        studyDurationHours: report.studyDurationHours,
        selfEvaluation: report.selfEvaluation,
        mood: report.mood,
        tomorrowTarget: report.tomorrowTarget,
        status: report.status,
        teacherComment: report.teacherComment || null,
        flaggedReason: report.flaggedReason || null,
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
