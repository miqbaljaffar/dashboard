/**
 * Academic & Dormitory Management System
 * Type Definitions
 */

export type UserRole = 'ADMIN' | 'MANAGEMENT' | 'TEACHER' | 'DORM_SUPERVISOR' | 'STUDENT';

export interface Student {
  id: string; // e.g., "LPK-2026-042"
  name: string;
  gender: 'Male' | 'Female';
  age: number;
  cohort: string; // e.g., "Cohort 24"
  classroom: string; // e.g., "Sakura Glass"
  enrollmentDate: string;
  graduationTarget: string;
  
  // Japan Prep
  jlptTarget: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  currentJlptLevel: 'None' | 'N5' | 'N4' | 'N3' | 'N2';
  jftTarget: 'JFT-Basic' | 'None';
  sswField: 'Caregiver' | 'Food Service' | 'Agriculture' | 'Construction' | 'Manufacture' | 'None';
  interviewReadiness: 'Ready' | 'In Progress' | 'Not Ready';
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  relationship: string;

  // Dormitory Assignment
  dormBuilding: string; // e.g., "Fuji Hall"
  dormRoom: string; // e.g., "Room 302"
  dormBed: number;

  status: 'Active' | 'Graduated' | 'Leave' | 'Dropped';
  behaviorScore: number; // 0 - 100
  attendanceRate: number; // e.g., 0.94 (94%)
  quizAverage: number; // e.g., 82.5
  missingAssignmentsCount: number;
  violationsCount: number;
  progressTrend: 'Improving' | 'Stable' | 'Declining';
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  morning: 'Present' | 'Late' | 'Sick' | 'Permission' | 'Absent';
  classSession: 'Present' | 'Late' | 'Sick' | 'Permission' | 'Absent';
  eveningRollCall: 'Present' | 'Late' | 'Sick' | 'Permission' | 'Absent';
  notes?: string;
}

export interface QuizTest {
  id: string;
  title: string;
  type: 'Vocabulary' | 'Kanji' | 'Grammar' | 'Listening' | 'Reading' | 'Speaking' | 'JLPT Simulation' | 'JFT Simulation';
  date: string;
  cohort: string;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number; // e.g. 78.5 (78.5%)
  questionAnalysis: {
    question: string;
    correctPct: number;
    topic: string;
  }[];
  weakTopics: string[];
  strongTopics: string[];
}

export interface StudentQuizScore {
  quizId: string;
  studentId: string;
  score: number;
  passed: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  type: 'Homework' | 'Kanji Writing' | 'Vocabulary Memorization' | 'Conversation Recording' | 'Listening Exercise' | 'JLPT Practice';
  deadline: string;
  cohort: string;
  totalStudents: number;
  submittedCount: number;
  lateCount: number;
}

export interface StudentAssignment {
  assignmentId: string;
  studentId: string;
  submissionDate?: string;
  status: 'Submitted' | 'Late' | 'Missing' | 'Pending';
  grade?: string;
  recordingUrl?: string; // for speaking files
}

export interface DailyReport {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  learnedToday: string;
  difficultMaterial: string;
  studyDurationHours: number;
  selfEvaluation: number; // 1 to 5
  mood: 'Excellent' | 'Good' | 'Neutral' | 'Tired' | 'Struggling';
  tomorrowTarget: string;
  status: 'Pending' | 'Approved' | 'Flagged';
  teacherComment?: string;
  flaggedReason?: string;
}

export interface DormRoom {
  building: string;
  roomNumber: string;
  capacity: number;
  occupied: number;
  cleanlinessScore: number; // 0-100
  bedArrangement: 'Excellent' | 'Fair' | 'Disorderly';
  hygieneStatus: 'Excellent' | 'Good' | 'Needs Improvement';
  laundryStatus: 'Clean' | 'Piled Up';
}

export interface DormChecklist {
  id: string;
  date: string;
  shift: 'Morning' | 'Evening';
  inspector: string;
  roomCleanlinessScores: { [room: string]: number }; // room: score
  notes: string;
}

export interface BehavioralIncidence {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  category: 'Late Wake Up' | 'Late Attendance' | 'Missing Prayer' | 'Room Not Clean' | 'Curfew Violation' | 'Missing Assignment' | 'Improper Conduct';
  severity: 'Low' | 'Medium' | 'High';
  pointsDeducted: number;
  status: 'Active' | 'Resolved' | 'Escalated';
  actionTaken: string;
}

export interface BehavioralReward {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  category: 'Perfect Attendance' | 'Excellent Academic Performance' | 'Leadership' | 'Cleanliness';
  pointsAdded: number;
  description: string;
}
