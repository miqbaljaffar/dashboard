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

// Behavior Score Recalculator Helper
async function recalculateStudentBehaviorScore(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return null;

  const incidents = await prisma.behavioralIncidence.findMany({ where: { studentId } });
  const rewards = await prisma.behavioralReward.findMany({ where: { studentId } });

  let score = 100;
  incidents.forEach(inc => {
    score -= inc.pointsDeducted;
  });
  rewards.forEach(rew => {
    score += rew.pointsAdded;
  });

  score = Math.max(0, Math.min(100, score));
  const violationsCount = incidents.length;

  return await prisma.student.update({
    where: { id: studentId },
    data: {
      behaviorScore: score,
      violationsCount
    }
  });
}

// Fetch all database records
app.get('/api/data', async (req, res) => {
  try {
    const students = await prisma.student.findMany({ orderBy: { id: 'asc' } });
    const attendance = await prisma.attendanceRecord.findMany();
    const incidents = await prisma.behavioralIncidence.findMany({ orderBy: { date: 'desc' } });
    const rewards = await prisma.behavioralReward.findMany({ orderBy: { date: 'desc' } });
    const assignments = await prisma.assignment.findMany({ include: { submissions: true } });
    const gradeColumns = await prisma.gradeColumn.findMany({ include: { scores: true } });

    res.json({
      students,
      attendance,
      assignments,
      quizzes: gradeColumns, // Return as quizzes for frontend compatibility
      incidents,
      rewards,
      dailyReports: [],      // Empty placeholders to avoid frontend crashes
      dormRooms: []
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch database data' });
  }
});

// Students API (Read/Update only, handled by seed/client updates)
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

app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.student.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
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

// Dynamic Assignments CRUD
app.post('/api/assignments', async (req, res) => {
  const { title, cohort, dueDate } = req.body;
  try {
    const assignment = await prisma.assignment.create({
      data: { title, cohort, dueDate },
    });
    
    // Auto-create submissions sheet for all active students in the cohort
    const cohortStudents = await prisma.student.findMany({
      where: { cohort, status: 'Active' },
    });
    
    if (cohortStudents.length > 0) {
      await prisma.assignmentSubmission.createMany({
        data: cohortStudents.map(st => ({
          assignmentId: assignment.id,
          studentId: st.id,
          submitted: false
        }))
      });
    }

    const created = await prisma.assignment.findUnique({
      where: { id: assignment.id },
      include: { submissions: true }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/assignments/:id', async (req, res) => {
  const { id } = req.params;
  const { title, dueDate } = req.body;
  try {
    const assignment = await prisma.assignment.update({
      where: { id },
      data: { title, dueDate },
      include: { submissions: true }
    });
    res.json(assignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/assignments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.assignment.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Assignment Submission Toggle
app.put('/api/submissions/:id', async (req, res) => {
  const { id } = req.params;
  const { submitted } = req.body;
  try {
    const submission = await prisma.assignmentSubmission.update({
      where: { id },
      data: { submitted }
    });
    res.json(submission);
  } catch (error) {
    console.error('Error toggling submission:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Dynamic Grade Columns CRUD (Quizzes & Exams)
app.post('/api/grades', async (req, res) => {
  const { title, type, cohort, date } = req.body;
  try {
    const gradeColumn = await prisma.gradeColumn.create({
      data: { title, type, cohort, date }
    });

    // Auto-create empty scores for all active students in the cohort
    const cohortStudents = await prisma.student.findMany({
      where: { cohort, status: 'Active' },
    });

    if (cohortStudents.length > 0) {
      await prisma.studentGrade.createMany({
        data: cohortStudents.map(st => ({
          gradeColumnId: gradeColumn.id,
          studentId: st.id,
          score: null
        }))
      });
    }

    const created = await prisma.gradeColumn.findUnique({
      where: { id: gradeColumn.id },
      include: { scores: true }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating grade column:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/grades/:id', async (req, res) => {
  const { id } = req.params;
  const { title, date } = req.body;
  try {
    const gradeColumn = await prisma.gradeColumn.update({
      where: { id },
      data: { title, date },
      include: { scores: true }
    });
    res.json(gradeColumn);
  } catch (error) {
    console.error('Error updating grade column:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/grades/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.gradeColumn.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting grade column:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update Student Score Inside Column
app.put('/api/student-grades/:id', async (req, res) => {
  const { id } = req.params;
  const { score } = req.body; // number or null
  try {
    const studentGrade = await prisma.studentGrade.update({
      where: { id },
      data: { score }
    });
    res.json(studentGrade);
  } catch (error) {
    console.error('Error updating student score:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Behavior Incidents CRUD with recalculation trigger
app.post('/api/incidents', async (req, res) => {
  const { id, studentId, studentName, date, category, severity, pointsDeducted, status, actionTaken } = req.body;
  try {
    const incident = await prisma.behavioralIncidence.create({
      data: { id, studentId, studentName, date, category, severity, pointsDeducted, status, actionTaken },
    });
    const updatedStudent = await recalculateStudentBehaviorScore(studentId);
    res.json({ incident, student: updatedStudent });
  } catch (error) {
    console.error('Error creating behavioral incident:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/incidents/:id', async (req, res) => {
  const { id } = req.params;
  const { date, category, severity, pointsDeducted, status, actionTaken } = req.body;
  try {
    const incident = await prisma.behavioralIncidence.update({
      where: { id },
      data: { date, category, severity, pointsDeducted, status, actionTaken },
    });
    const updatedStudent = await recalculateStudentBehaviorScore(incident.studentId);
    res.json({ incident, student: updatedStudent });
  } catch (error) {
    console.error('Error updating behavioral incident:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/incidents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const incident = await prisma.behavioralIncidence.findUnique({ where: { id } });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    
    await prisma.behavioralIncidence.delete({ where: { id } });
    const updatedStudent = await recalculateStudentBehaviorScore(incident.studentId);
    res.json({ success: true, student: updatedStudent });
  } catch (error) {
    console.error('Error deleting behavioral incident:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Behavior Rewards CRUD with recalculation trigger
app.post('/api/rewards', async (req, res) => {
  const { id, studentId, studentName, date, category, pointsAdded, description } = req.body;
  try {
    const reward = await prisma.behavioralReward.create({
      data: { id, studentId, studentName, date, category, pointsAdded, description },
    });
    const updatedStudent = await recalculateStudentBehaviorScore(studentId);
    res.json({ reward, student: updatedStudent });
  } catch (error) {
    console.error('Error creating behavioral reward:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/rewards/:id', async (req, res) => {
  const { id } = req.params;
  const { date, category, pointsAdded, description } = req.body;
  try {
    const reward = await prisma.behavioralReward.update({
      where: { id },
      data: { date, category, pointsAdded, description },
    });
    const updatedStudent = await recalculateStudentBehaviorScore(reward.studentId);
    res.json({ reward, student: updatedStudent });
  } catch (error) {
    console.error('Error updating behavioral reward:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/rewards/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const reward = await prisma.behavioralReward.findUnique({ where: { id } });
    if (!reward) return res.status(404).json({ error: 'Reward not found' });

    await prisma.behavioralReward.delete({ where: { id } });
    const updatedStudent = await recalculateStudentBehaviorScore(reward.studentId);
    res.json({ success: true, student: updatedStudent });
  } catch (error) {
    console.error('Error deleting behavioral reward:', error);
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
