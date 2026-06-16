import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Fetch all database records
app.get('/api/data', async (req, res) => {
  try {
    const students = await prisma.student.findMany({ orderBy: { id: 'asc' } });
    const attendance = await prisma.attendanceRecord.findMany();
    const quizzes = await prisma.quizTest.findMany({ orderBy: { date: 'desc' } });
    const assignments = await prisma.assignment.findMany({ orderBy: { deadline: 'desc' } });
    const dailyReports = await prisma.dailyReport.findMany({ orderBy: { date: 'desc' } });
    const dormRooms = await prisma.dormRoom.findMany({ orderBy: { roomNumber: 'asc' } });
    const incidents = await prisma.behavioralIncidence.findMany({ orderBy: { date: 'desc' } });
    const rewards = await prisma.behavioralReward.findMany({ orderBy: { date: 'desc' } });

    res.json({
      students,
      attendance,
      quizzes,
      assignments,
      dailyReports,
      dormRooms,
      incidents,
      rewards,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch database data' });
  }
});

// Students API
app.post('/api/students', async (req, res) => {
  try {
    const student = await prisma.student.create({
      data: req.body,
    });
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.update({
      where: { id },
      data: req.body,
    });
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Attendance API
app.post('/api/attendance', async (req, res) => {
  const { studentId, date, morning, classSession, eveningRollCall, notes } = req.body;
  try {
    const record = await prisma.attendanceRecord.upsert({
      where: { studentId_date: { studentId, date } },
      update: { morning, classSession, eveningRollCall, notes },
      create: { studentId, date, morning, classSession, eveningRollCall, notes },
    });

    // Recalculate attendance rate for the student
    const allRecords = await prisma.attendanceRecord.findMany({
      where: { studentId },
    });
    let presentCount = 0;
    allRecords.forEach(r => {
      if (r.morning === 'Present') presentCount++;
      if (r.classSession === 'Present') presentCount++;
    });
    const total = allRecords.length * 2 || 1;
    const attendanceRate = Number((presentCount / total).toFixed(2));

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { attendanceRate },
    });

    res.json({ record, student: updatedStudent });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Quizzes API
app.post('/api/quizzes', async (req, res) => {
  try {
    const quiz = await prisma.quizTest.create({
      data: {
        id: req.body.id,
        title: req.body.title,
        type: req.body.type,
        date: req.body.date,
        cohort: req.body.cohort,
        averageScore: req.body.averageScore,
        highestScore: req.body.highestScore,
        lowestScore: req.body.lowestScore,
        passRate: req.body.passRate,
        questionAnalysis: req.body.questionAnalysis,
        weakTopics: req.body.weakTopics,
        strongTopics: req.body.strongTopics,
      },
    });
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Assignments API
app.post('/api/assignments', async (req, res) => {
  try {
    const assignment = await prisma.assignment.create({
      data: req.body,
    });
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Daily Reports API
app.post('/api/reports', async (req, res) => {
  try {
    const report = await prisma.dailyReport.create({
      data: req.body,
    });
    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating daily report:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/reports/:id/review', async (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;
  try {
    const report = await prisma.dailyReport.update({
      where: { id },
      data: { status, teacherComment: comment },
    });

    let updatedStudent = null;
    if (status === 'Flagged') {
      const student = await prisma.student.findUnique({ where: { id: report.studentId } });
      if (student) {
        updatedStudent = await prisma.student.update({
          where: { id: report.studentId },
          data: {
            behaviorScore: Math.max(0, student.behaviorScore - 5),
            violationsCount: student.violationsCount + 1,
          },
        });
      }
    }

    res.json({ report, student: updatedStudent });
  } catch (error) {
    console.error('Error reviewing daily report:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Dormitory API
app.put('/api/rooms', async (req, res) => {
  const { building, roomNumber, score, bedArrangement, hygieneStatus, laundryStatus } = req.body;
  try {
    const room = await prisma.dormRoom.update({
      where: { building_roomNumber: { building, roomNumber } },
      data: {
        cleanlinessScore: score,
        bedArrangement,
        hygieneStatus,
        laundryStatus,
      },
    });
    res.json(room);
  } catch (error) {
    console.error('Error updating room cleanliness:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Discipline (Incidents / Rewards) API
app.post('/api/incidents', async (req, res) => {
  const { id, studentId, studentName, date, category, severity, pointsDeducted, status, actionTaken } = req.body;
  try {
    const incident = await prisma.behavioralIncidence.create({
      data: { id, studentId, studentName, date, category, severity, pointsDeducted, status, actionTaken },
    });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    let updatedStudent = null;
    if (student) {
      updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: {
          behaviorScore: Math.max(0, student.behaviorScore - pointsDeducted),
          violationsCount: student.violationsCount + 1,
        },
      });
    }

    res.json({ incident, student: updatedStudent });
  } catch (error) {
    console.error('Error creating behavioral incident:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/rewards', async (req, res) => {
  const { id, studentId, studentName, date, category, pointsAdded, description } = req.body;
  try {
    const reward = await prisma.behavioralReward.create({
      data: { id, studentId, studentName, date, category, pointsAdded, description },
    });

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    let updatedStudent = null;
    if (student) {
      updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: {
          behaviorScore: Math.min(100, student.behaviorScore + pointsAdded),
        },
      });
    }

    res.json({ reward, student: updatedStudent });
  } catch (error) {
    console.error('Error creating behavioral reward:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
