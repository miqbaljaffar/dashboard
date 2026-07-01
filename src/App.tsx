import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord, Assignment, GradeColumn } from './types';
import { initialStudents, initialAttendance } from './data/mockData';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import AttendanceView from './components/AttendanceView';
import AcademiaView from './components/AcademiaView';
import StudentsView from './components/StudentsView';
import { GraduationCap, Printer, LogOut } from 'lucide-react';
import PrintReportModal from './components/PrintReportModal';
import Login from './components/Login';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTabOverride, setPrintTabOverride] = useState<string | undefined>(undefined);

  const handleOpenPrint = (tab?: string) => {
    setPrintTabOverride(tab);
    setIsPrintModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };
  
  // Business entities lists states
  const [studentsState, setStudentsState] = useState<Student[]>(initialStudents);
  const [attendanceState, setAttendanceState] = useState<AttendanceRecord[]>(initialAttendance);
  
  // Sort alphabetically by name
  const sortedStudents = [...studentsState].sort((a, b) => a.name.localeCompare(b.name));
  
  // Dynamic Academic States
  const [assignmentsState, setAssignmentsState] = useState<Assignment[]>([]);
  const [gradesState, setGradesState] = useState<GradeColumn[]>([]);

  // Focus Analysis State (Collective vs Individual)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');

  // Sync data from database backend on load
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('API server returned error status');
        const data = await res.json();
        setStudentsState(data.students);
        setAttendanceState(data.attendance);
        setAssignmentsState(data.assignments || []);
        setGradesState(data.quizzes || []); // backend maps grades to quizzes key
      } catch (err) {
        console.warn('Backend server not reachable, using offline mock data:', err);
      }
    }
    loadData();
  }, []);

  const handleAddStudent = (newStudent: Student) => {
    setStudentsState(prev => [...prev, newStudent]);
    fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    }).catch(err => console.error('Failed to sync student create to DB:', err));
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudentsState(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    fetch(`/api/students/${updatedStudent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStudent),
    }).catch(err => console.error('Failed to sync student update to DB:', err));
  };

  const handleDeleteStudent = (id: string) => {
    fetch(`/api/students/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setStudentsState(prev => prev.filter(s => s.id !== id));
        setAttendanceState(prev => prev.filter(a => a.studentId !== id));
      })
      .catch(err => console.error('Failed to sync student delete to DB:', err));
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    // Backup states for rollback
    const previousAttendance = [...attendanceState];
    const previousStudents = [...studentsState];

    // Optimistic update of attendance record
    setAttendanceState(prev => {
      const idx = prev.findIndex(a => a.studentId === record.studentId && a.date === record.date);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [...prev, record];
    });

    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    })
      .then(res => {
        if (!res.ok) throw new Error('API server returned error status');
        return res.json();
      })
      .then(data => {
        if (data && data.student) {
          setStudentsState(prev => prev.map(s => s.id === data.student.id ? data.student : s));
        }
      })
      .catch(err => {
        console.error('Failed to sync attendance update to DB, rolling back:', err);
        // Rollback states to previous to prevent out-of-sync UI
        setAttendanceState(previousAttendance);
        setStudentsState(previousStudents);
        alert('Gagal menyinkronkan data presensi ke server. Perubahan dibatalkan.');
      });
  };

  // Dynamic Assignments CRUD handlers
  const handleCreateAssignment = (title: string, dueDate: string) => {
    fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, dueDate })
    })
      .then(res => res.json())
      .then(newAss => {
        setAssignmentsState(prev => [...prev, newAss]);
      })
      .catch(err => console.error('Failed to create assignment:', err));
  };

  const handleUpdateAssignment = (id: string, title: string, dueDate: string) => {
    fetch(`/api/assignments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, dueDate })
    })
      .then(res => res.json())
      .then(updated => {
        setAssignmentsState(prev => prev.map(a => a.id === id ? updated : a));
      })
      .catch(err => console.error('Failed to update assignment:', err));
  };

  const handleDeleteAssignment = (id: string) => {
    fetch(`/api/assignments/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setAssignmentsState(prev => prev.filter(a => a.id !== id));
      })
      .catch(err => console.error('Failed to delete assignment:', err));
  };

  const handleToggleSubmission = (submissionId: string, assignmentId: string, submitted: boolean) => {
    // Optimistic UI toggle
    setAssignmentsState(prev => prev.map(a => {
      if (a.id === assignmentId && a.submissions) {
        return {
          ...a,
          submissions: a.submissions.map(sub => sub.id === submissionId ? { ...sub, submitted } : sub)
        };
      }
      return a;
    }));

    fetch(`/api/submissions/${submissionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submitted })
    }).catch(err => console.error('Failed to toggle submission:', err));
  };

  // Dynamic Grade Columns CRUD handlers
  const handleCreateGradeColumn = (title: string, type: 'Kuis' | 'Ulangan', date: string) => {
    fetch('/api/grades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, date })
    })
      .then(res => res.json())
      .then(newCol => {
        setGradesState(prev => [...prev, newCol]);
      })
      .catch(err => console.error('Failed to create grade column:', err));
  };

  const handleUpdateGradeColumn = (id: string, title: string, date: string) => {
    fetch(`/api/grades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date })
    })
      .then(res => res.json())
      .then(updated => {
        setGradesState(prev => prev.map(g => g.id === id ? updated : g));
      })
      .catch(err => console.error('Failed to update grade column:', err));
  };

  const handleDeleteGradeColumn = (id: string) => {
    fetch(`/api/grades/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setGradesState(prev => prev.filter(g => g.id !== id));
      })
      .catch(err => console.error('Failed to delete grade column:', err));
  };

  const handleUpdateStudentGrade = (gradeId: string, columnId: string, score: number | null) => {
    // Optimistic UI score update
    setGradesState(prev => prev.map(g => {
      if (g.id === columnId && g.scores) {
        return {
          ...g,
          scores: g.scores.map(s => s.id === gradeId ? { ...s, score } : s)
        };
      }
      return g;
    }));

    fetch(`/api/student-grades/${gradeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score })
    }).catch(err => console.error('Failed to update score:', err));
  };

  // Helper count badges
  const atRiskStudentsCount = studentsState.filter(s => 
    s.status === 'Active' && 
    s.attendanceRate < 0.82
  ).length;

  // Render correct nested operational panel
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            students={sortedStudents}
            attendance={attendanceState}
            assignments={assignmentsState}
            grades={gradesState}
            selectedStudentId={selectedStudentId}
            onSelectedStudentChange={setSelectedStudentId}
            onNavigate={(id) => setActiveTab(id)}
            onPrintClick={() => handleOpenPrint('dashboard')}
          />
        );
      case 'students':
        return (
          <StudentsView
            students={sortedStudents}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onPrintClick={() => handleOpenPrint('students')}
          />
        );
      case 'attendance':
        return (
          <AttendanceView
            students={sortedStudents}
            attendance={attendanceState}
            onUpdateAttendance={handleUpdateAttendance}
            onPrintClick={() => handleOpenPrint('attendance')}
          />
        );
      case 'academia':
        return (
          <AcademiaView
            students={sortedStudents}
            assignments={assignmentsState}
            grades={gradesState}
            onCreateAssignment={handleCreateAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onToggleSubmission={handleToggleSubmission}
            onCreateGradeColumn={handleCreateGradeColumn}
            onUpdateGradeColumn={handleUpdateGradeColumn}
            onDeleteGradeColumn={handleDeleteGradeColumn}
            onUpdateStudentGrade={handleUpdateStudentGrade}
            onPrintClick={() => handleOpenPrint('academia')}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-xs text-slate-400">
            Halaman sedang dimuat.
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => {
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
    }} />;
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased print:hidden">
        
        {/* Top Header */}
        <header className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-slate-100 text-slate-800 rounded flex items-center justify-center font-bold">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-slate-900 uppercase">
                UTB Banjar Nihongo
              </h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                Japanese Trainee Academic & Performance Management System
              </p>
            </div>
          </div>

          {/* Global info metrics ticker */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 md:gap-5 text-[10.5px] text-slate-500 font-mono">
            <button
              onClick={() => handleOpenPrint()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10.5px] rounded-lg shadow-xs transition duration-200 cursor-pointer no-print"
            >
              <Printer className="h-3.5 w-3.5" />
              Cetak Laporan
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold text-[10.5px] rounded-lg shadow-xs transition duration-200 cursor-pointer no-print"
            >
              <LogOut className="h-3.5 w-3.5 text-red-500" />
              Logout
            </button>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-md px-2.5 py-1 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-700 font-semibold">
                Sensei Pengajar (Admin/Guru)
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-slate-500">
              <span>Server Sync Secure</span>
            </div>
            <span className="hidden lg:inline">•</span>
            <div className="flex items-center gap-2 text-slate-500">
              <span>Status Kelas: </span>
              <span className="bg-red-50 text-red-700 border border-red-100 font-semibold px-2 py-0.5 rounded text-[10px]">
                {atRiskStudentsCount} At-Risk
              </span>
            </div>
          </div>
        </header>

        {/* Main Structural container */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          
          {/* Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />

          {/* CONTENT STAGE WORKSPACE */}
          <main className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
            {renderTabContent()}
          </main>

        </div>

      </div>

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        students={sortedStudents}
        attendance={attendanceState}
        assignments={assignmentsState}
        grades={gradesState}
        initialTab={printTabOverride || activeTab}
        selectedStudentId={selectedStudentId}
      />
    </>
  );
}
