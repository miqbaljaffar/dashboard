/**
 * Academic Management System
 * Type Definitions
 */

export type UserRole = 'ADMIN' | 'MANAGEMENT' | 'TEACHER' | 'DORM_SUPERVISOR' | 'STUDENT';

export interface Student {
  id: string; // e.g., "UTB-2026-001"
  name: string;
  gender: 'Male' | 'Female';
  age: number;
  cohort: string;
  classroom: string;
  enrollmentDate: string;
  graduationTarget: string;
  status: 'Active' | 'Graduated' | 'Leave' | 'Dropped';
  behaviorScore: number; // 0 - 100
  attendanceRate: number; // e.g., 0.94 (94%)
  violationsCount: number;
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  morning: 'Present' | 'Late' | 'Sick' | 'Permission' | 'Absent';
  classSession: 'Present' | 'Late' | 'Sick' | 'Permission' | 'Absent';
  eveningRollCall: 'Present' | 'Late' | 'Sick' | 'Permission' | 'Absent';
  notes?: string;
}

export interface Assignment {
  id: string;
  title: string;
  cohort: string;
  dueDate: string;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submitted: boolean;
}

export interface GradeColumn {
  id: string;
  title: string;
  type: 'Kuis' | 'Ulangan';
  cohort: string;
  date: string;
  scores?: StudentGrade[];
}

export interface StudentGrade {
  id: string;
  gradeColumnId: string;
  studentId: string;
  score: number | null;
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
