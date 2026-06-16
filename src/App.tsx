import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord, BehavioralIncidence, BehavioralReward } from './types';
import { initialStudents, initialAttendance, initialIncidences, initialRewards } from './data/mockData';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import AttendanceView from './components/AttendanceView';
import AcademiaView from './components/AcademiaView';
import DisciplineView from './components/DisciplineView';
import { GraduationCap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Business entities lists states
  const [studentsState, setStudentsState] = useState<Student[]>(initialStudents);
  const [attendanceState, setAttendanceState] = useState<AttendanceRecord[]>(initialAttendance);
  const [incidentsState, setIncidentsState] = useState<BehavioralIncidence[]>(initialIncidences);
  const [rewardsState, setRewardsState] = useState<BehavioralReward[]>(initialRewards);

  // Sync data from database backend on load
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('API server returned error status');
        const data = await res.json();
        setStudentsState(data.students);
        setAttendanceState(data.attendance);
        setIncidentsState(data.incidents);
        setRewardsState(data.rewards);
      } catch (err) {
        console.warn('Backend server not reachable, using offline mock data:', err);
      }
    }
    loadData();
  }, []);

  // Update student scores / assignment checkbox
  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudentsState(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    fetch(`/api/students/${updatedStudent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStudent),
    }).catch(err => console.error('Failed to sync student update to DB:', err));
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
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
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data && data.student) {
          setStudentsState(prev => prev.map(s => s.id === data.student.id ? data.student : s));
        }
      })
      .catch(err => {
        console.error('Failed to sync attendance update to DB:', err);
        // Fallback local calculation
        setStudentsState(prev => prev.map(s => {
          if (s.id === record.studentId) {
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
      });
  };

  const handleLogIncident = (inc: BehavioralIncidence) => {
    setIncidentsState(prev => [inc, ...prev]);

    fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inc),
    })
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data && data.student) {
          setStudentsState(prev => prev.map(s => s.id === data.student.id ? data.student : s));
        }
      })
      .catch(err => {
        console.error('Failed to sync incident to DB:', err);
        // Fallback local point deduction
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
      });
  };

  const handleLogReward = (rew: BehavioralReward) => {
    setRewardsState(prev => [rew, ...prev]);

    fetch('/api/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rew),
    })
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data && data.student) {
          setStudentsState(prev => prev.map(s => s.id === data.student.id ? data.student : s));
        }
      })
      .catch(err => {
        console.error('Failed to sync reward to DB:', err);
        // Fallback local points restoration
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
      });
  };

  // Helper count badges
  const atRiskStudentsCount = studentsState.filter(s => 
    s.status === 'Active' && 
    (s.attendanceRate < 0.82 || (s.quizScore !== null && s.quizScore < 70) || s.behaviorScore < 70)
  ).length;

  const activeViolationsCount = incidentsState.filter(i => i.status === 'Active').length;

  // Render correct nested operational panel
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            students={studentsState}
            attendance={attendanceState}
            incidents={incidentsState}
            onNavigate={(id) => setActiveTab(id)}
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
            onUpdateStudent={handleUpdateStudent}
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
            role="ADMIN" // System level admin
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      
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
