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
  cohort: string; // e.g., "Cohort 24"
  classroom: string; // e.g., "Sakura Glass"
  enrollmentDate: string;
  graduationTarget: string;
  status: 'Active' | 'Graduated' | 'Leave' | 'Dropped';
  behaviorScore: number; // 0 - 100
  attendanceRate: number; // e.g., 0.94 (94%)
  violationsCount: number;
  assignmentSubmitted: boolean;
  quizScore: number | null;
  examScore: number | null;
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  morning: 'Present' | 'Late' | 'Sick' | 'Permission' | 'Absent';
  classSession: 'Present' | 'Late' | 'Sick' | 'Permission' | 'Absent';
  eveningRollCall: 'Present' | 'Late' | 'Sick' | 'Permission' | 'Absent';
  notes?: string;
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
