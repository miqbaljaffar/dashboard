import React, { useState } from 'react';
import { UserRole, Student, AttendanceRecord, QuizTest, Assignment, DailyReport, DormRoom, BehavioralIncidence, BehavioralReward } from './types';
import { initialStudents, initialAttendance, initialQuizzes, initialAssignments, initialDailyReports, initialDormRooms, initialIncidences, initialRewards } from './data/mockData';
import RoleSwitcher from './components/RoleSwitcher';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import StudentsView from './components/StudentsView';
import AttendanceView from './components/AttendanceView';
import AcademiaView from './components/AcademiaView';
import ReportsView from './components/ReportsView';
import DormitoryView from './components/DormitoryView';
import DisciplineView from './components/DisciplineView';
import BlueprintView from './components/BlueprintView';
import { GraduationCap } from 'lucide-react';

export default function App() {
  // Master Sandbox States (Default to Instructor/Admin)
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Impersonated student for Student view portal
  const [selectedStudentForStudentView, setSelectedStudentForStudentView] = useState<string>('UTB-2026-001');

  // Switch Active Tab when role shifts
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'STUDENT') {
      setActiveTab('dashboard');
    } else if (role === 'DORM_SUPERVISOR') {
      setActiveTab('dormitory');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Business entities lists states
  const [studentsState, setStudentsState] = useState<Student[]>(initialStudents);
  const [attendanceState, setAttendanceState] = useState<AttendanceRecord[]>(initialAttendance);
  const [quizzesState, setQuizzesState] = useState<QuizTest[]>(initialQuizzes);
  const [assignmentsState, setAssignmentsState] = useState<Assignment[]>(initialAssignments);
  const [reportsState, setReportsState] = useState<DailyReport[]>(initialDailyReports);
  const [roomsState, setRoomsState] = useState<DormRoom[]>(initialDormRooms);
  const [incidentsState, setIncidentsState] = useState<BehavioralIncidence[]>(initialIncidences);
  const [rewardsState, setRewardsState] = useState<BehavioralReward[]>(initialRewards);

  // Business handlers
  const handleAddStudent = (newStudent: Student) => {
    setStudentsState(prev => [...prev, newStudent]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudentsState(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    setAttendanceState(prev => {
      const idx = prev.findIndex(a => a.studentId === record.studentId && a.date === record.date);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [...prev, record];
    });

    // Dynamically adjust student attendance score in the registry
    setStudentsState(prev => prev.map(s => {
      if (s.id === record.studentId) {
        // Recount sessions
        const studentRecs = [...attendanceState, record].filter(a => a.studentId === s.id);
        let presentCount = 0;
        studentRecs.forEach(a => {
          if (a.morning === 'Present') presentCount++;
          if (a.classSession === 'Present') presentCount++;
        });
        const total = studentRecs.length * 2 || 1;
        const newRate = presentCount / total;
        return {
          ...s,
          attendanceRate: Number(newRate.toFixed(2))
        };
      }
      return s;
    }));
  };

  const handleAddQuiz = (q: QuizTest) => {
    setQuizzesState(prev => [...prev, q]);
  };

  const handleAddAssignment = (a: Assignment) => {
    setAssignmentsState(prev => [...prev, a]);
  };

  const handleSubmitReport = (rep: DailyReport) => {
    setReportsState(prev => [rep, ...prev]);
  };

  const handleReviewReport = (reportId: string, status: 'Approved' | 'Flagged', comment: string) => {
    setReportsState(prev => prev.map(r => r.id === reportId ? { ...r, status, teacherComment: comment } : r));

    // If flagged, decrease student behavior points slightly to demonstrate correlation
    const targetReport = reportsState.find(r => r.id === reportId);
    if (targetReport && status === 'Flagged') {
      setStudentsState(prev => prev.map(s => s.id === targetReport.studentId ? {
        ...s,
        behaviorScore: Math.max(0, s.behaviorScore - 5),
        violationsCount: s.violationsCount + 1
      } : s));
    }
  };

  const handleUpdateRoomCleanliness = (
    building: string,
    roomNumber: string,
    score: number,
    bedArr: 'Excellent' | 'Fair' | 'Disorderly',
    hygi: 'Excellent' | 'Good' | 'Needs Improvement',
    laund: 'Clean' | 'Piled Up'
  ) => {
    setRoomsState(prev => prev.map(r => r.building === building && r.roomNumber === roomNumber ? {
      ...r,
      cleanlinessScore: score,
      bedArrangement: bedArr,
      hygieneStatus: hygi,
      laundryStatus: laund
    } : r));
  };

  const handleLogIncident = (inc: BehavioralIncidence) => {
    setIncidentsState(prev => [inc, ...prev]);

    // Apply point deduction onto the student profile behavior Score instantly
    setStudentsState(prev => prev.map(s => {
      if (s.id === inc.studentId) {
        const nextScore = Math.max(0, s.behaviorScore - inc.pointsDeducted);
        return {
          ...s,
          behaviorScore: nextScore,
          violationsCount: s.violationsCount + 1
        };
      }
      return s;
    }));
  };

  const handleLogReward = (rew: BehavioralReward) => {
    setRewardsState(prev => [rew, ...prev]);

    // Apply restorative points onto the student behavior profile instantly
    setStudentsState(prev => prev.map(s => {
      if (s.id === rew.studentId) {
        const nextScore = Math.min(100, s.behaviorScore + rew.pointsAdded);
        return {
          ...s,
          behaviorScore: nextScore
        };
      }
      return s;
    }));
  };

  // Helper count badges
  const pendingReportsCount = reportsState.filter(r => r.status === 'Pending').length;
  
  const atRiskStudentsCount = studentsState.filter(s => 
    s.status === 'Active' && 
    (s.attendanceRate < 0.82 || s.quizAverage < 70 || s.missingAssignmentsCount > 2 || s.behaviorScore < 70)
  ).length;

  const activeViolationsCount = incidentsState.filter(i => i.status === 'Active').length;

  // Render correct nested operational sub-panel
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            students={studentsState}
            attendance={attendanceState}
            rooms={roomsState}
            incidents={incidentsState}
            role={currentRole}
            onNavigate={(id) => setActiveTab(id)}
            selectedStudentId={selectedStudentForStudentView}
          />
        );
      case 'students':
        return (
          <StudentsView
            students={studentsState}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            role={currentRole}
          />
        );
      case 'attendance':
        return (
          <AttendanceView
            students={studentsState}
            attendance={attendanceState}
            onUpdateAttendance={handleUpdateAttendance}
          />
        );
      case 'academia':
        return (
          <AcademiaView
            students={studentsState}
            quizzes={quizzesState}
            assignments={assignmentsState}
            onAddQuiz={handleAddQuiz}
            onAddAssignment={handleAddAssignment}
            role={currentRole}
          />
        );
      case 'reports':
        return (
          <ReportsView
            students={studentsState}
            reports={reportsState}
            onSubmitReport={handleSubmitReport}
            onReviewReport={handleReviewReport}
            role={currentRole}
            selectedStudentId={selectedStudentForStudentView}
          />
        );
      case 'dormitory':
        return (
          <DormitoryView
            students={studentsState}
            rooms={roomsState}
            onUpdateRoomCleanliness={handleUpdateRoomCleanliness}
            role={currentRole}
          />
        );
      case 'discipline':
        return (
          <DisciplineView
            students={studentsState}
            incidents={incidentsState}
            rewards={rewardsState}
            onLogIncident={handleLogIncident}
            onLogReward={handleLogReward}
            role={currentRole}
          />
        );
      case 'blueprint':
        return <BlueprintView />;
      default:
        return (
          <div className="p-8 text-center text-xs text-slate-400">
            Page layout currently loading under this role setup context.
          </div>
        );
    }
  };

  const currentActiveStudentObj = studentsState.find(s => s.id === selectedStudentForStudentView) || studentsState[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      
      {/* Top Professional Applet Header Hub */}
      <header className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none shrink-0 font-sans">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-slate-100 text-slate-800 rounded flex items-center justify-center font-bold shadow-none">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 uppercase">
              UTB Banjar Nihongo
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
              Japanese Trainee Academic & Dormitory Management System
            </p>
          </div>
        </div>

        {/* User Session Indicators & Global info metrics ticker */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 md:gap-5 text-[10.5px] text-slate-500 font-mono">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-md px-2.5 py-1 text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-700 font-semibold text-[10px]">
              Aktif: Sensei Pengajar (Admin/Guru)
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-500">
            <span>Server Sync Secure</span>
          </div>
          <span className="hidden lg:inline">•</span>
          <div className="flex items-center gap-2 text-slate-500">
            <span>Alerts: </span>
            <span className="bg-red-50 text-red-700 border border-red-100 font-semibold px-2 py-0.5 rounded text-[10px]">
              {atRiskStudentsCount} At-Risk
            </span>
          </div>
        </div>
      </header>

      {/* Access sandbox controller banner - Available to you as teacher/admin for full perspective switching testing */}
      <div className="px-6 pt-4 bg-slate-50">
        <div className="bg-slate-100 border border-slate-200/80 rounded-md p-2.5 text-[11px] text-slate-700 font-semibold flex items-center gap-1.5 mb-2 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
          <span>PERSPEKTIF UTB BANJAR: Anda masuk sebagai Pengajar (Full Access). Gunakan simulator peran di bawah ini jika ingin menguji visualisasi dari sisi akun lain (Siswa, Pengawas Asrama, dll):</span>
        </div>
        <RoleSwitcher
          currentRole={currentRole}
          onChangeRole={handleRoleChange}
          selectedStudentIdForStudentView={selectedStudentForStudentView}
          onChangeSelectedStudent={setSelectedStudentForStudentView}
          studentsList={studentsState.map(st => ({ id: st.id, name: st.name }))}
        />
      </div>

      {/* Main Structural Enterprise container */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentRole={currentRole}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            // Reset state or swap context
            setActiveTab(tab);
          }}
          pendingReportsCount={pendingReportsCount}
          atRiskStudentsCount={atRiskStudentsCount}
          totalViolationsCount={activeViolationsCount}
        />

        {/* CONTENT STAGE WORKSPACE */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
          {renderTabContent()}
        </main>

      </div>

    </div>
  );
}
