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
    const incidents = await prisma.behavioralIncidence.findMany({ orderBy: { date: 'desc' } });
    const rewards = await prisma.behavioralReward.findMany({ orderBy: { date: 'desc' } });

    res.json({
      students,
      attendance,
      quizzes: [],      // Return empty arrays for backwards compatibility / smooth transitions
      assignments: [],
      dailyReports: [],
      dormRooms: [],
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

// Only listen when running locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server is running locally on http://localhost:${PORT}`);
  });
}

export default app;
