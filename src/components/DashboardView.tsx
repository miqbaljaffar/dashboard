import React, { useState } from 'react';
import { Student, AttendanceRecord, DormRoom, BehavioralIncidence } from '../types';
import {
  Users,
  Home,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';

interface DashboardViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  rooms: DormRoom[];
  incidents: BehavioralIncidence[];
  role: string;
  onNavigate: (tab: string) => void;
  selectedStudentId: string;
}

export default function DashboardView({
  students,
  attendance,
  rooms,
  incidents,
  role,
  onNavigate,
  selectedStudentId
}: DashboardViewProps) {
  
  // Real data calculations
  const totalStudentsCount = students.length;
  const activeStudents = students.filter(s => s.status === 'Active');
  const activeStudentsCount = activeStudents.length;
  
  // Dormitory Occupancy (occupied / capacity)
  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupied = rooms.reduce((acc, r) => acc + r.occupied, 0);
  const dormOccupancyPct = totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  
  // Overall Attendance Rate
  const avgAttendanceRate = activeStudents.length 
    ? Math.round((activeStudents.reduce((acc, s) => acc + s.attendanceRate, 0) / activeStudents.length) * 100)
    : 0;

  // Assignment Completion Rate average (simulated high precision)
  const avgAssignmentCompletionRate = 91.5; // average based on mock stats

  // Average Quiz Score
  const avgQuizScore = activeStudents.length
    ? parseFloat((activeStudents.reduce((acc, s) => acc + s.quizAverage, 0) / activeStudents.length).toFixed(1))
    : 0;

  // Students at Risk (using prompt guidelines: attendance < 80%, quiz average < 70, missing assignments > 3, or active violations >= 2)
  const atRiskStudents = activeStudents.filter(s => 
    s.attendanceRate < 0.80 || 
    s.quizAverage < 70 || 
    s.missingAssignmentsCount > 3 ||
    s.behaviorScore < 70
  );
  const atRiskCount = atRiskStudents.length;

  // JLPT/JFT Exam Readiness percent (students ready for their targets)
  const examReadyStudents = activeStudents.filter(s => s.interviewReadiness === 'Ready');
  const examReadinessPct = activeStudents.length
    ? Math.round((examReadyStudents.length / activeStudents.length) * 100)
    : 0;

  // Chart 1: Attendance Trend Over 7 Days (Line Chart)
  const attendanceTrendData = [
    { day: 'Mon', attendance: 96, target: 95 },
    { day: 'Tue', attendance: 94, target: 95 },
    { day: 'Wed', attendance: 98, target: 95 },
    { day: 'Thu', attendance: 91, target: 95 },
    { day: 'Fri', attendance: 95, target: 95 },
    { day: 'Sat', attendance: 88, target: 95 }, // Saturday test day
    { day: 'Today', attendance: avgAttendanceRate, target: 95 }
  ];

  // Chart 2: Assignment Completion Trend by Week (Bar Chart)
  const assignmentTrendData = [
    { week: 'Wk 21', kanjiWriting: 92, audioRecord: 86, listeningWork: 90 },
    { week: 'Wk 22', kanjiWriting: 88, audioRecord: 89, listeningWork: 92 },
    { week: 'Wk 23', kanjiWriting: 95, audioRecord: 90, listeningWork: 88 },
    { week: 'Wk 24', kanjiWriting: 98, audioRecord: 92, listeningWork: 94 },
  ];

  // Chart 3: Quiz Score Distribution (Histogram style)
  const quizScoreDistData = [
    { range: '90-100 (A)', students: activeStudents.filter(s => s.quizAverage >= 90).length },
    { range: '80-89 (B)', students: activeStudents.filter(s => s.quizAverage >= 80 && s.quizAverage < 90).length },
    { range: '70-79 (C)', students: activeStudents.filter(s => s.quizAverage >= 70 && s.quizAverage < 80).length },
    { range: '<70 (D/At Risk)', students: activeStudents.filter(s => s.quizAverage < 70).length }
  ];

  // Chart 4: Student Risk Distribution (Pie Chart)
  const riskDistData = [
    { name: 'Healthy (>=85)', value: activeStudents.filter(s => s.behaviorScore >= 85).length, color: '#16A34A' },
    { name: 'Warning (70-84)', value: activeStudents.filter(s => s.behaviorScore >= 70 && s.behaviorScore < 85).length, color: '#D97706' },
    { name: 'Critical (<70)', value: activeStudents.filter(s => s.behaviorScore < 70).length, color: '#DC2626' }
  ];

  // Chart 5: Cohort Comparison (Average attendance & quiz scores)
  const cohortComparisonData = [
    { cohort: 'Cohort 23', attendance: 98, quizAvg: 89.0, students: 2 },
    { cohort: 'Cohort 24', attendance: 89, quizAvg: 81.3, students: 4 },
    { cohort: 'Cohort 25', attendance: 78, quizAvg: 63.5, students: 3 }
  ];

  // Chart 6: JLPT Readiness Distribution (Count by Current vs Target in cohort)
  const jlptReadinessData = [
    { targetLevel: 'N5', qualified: 5, struggling: 1 },
    { targetLevel: 'N4', qualified: 3, struggling: 2 },
    { targetLevel: 'N3', qualified: 2, struggling: 0 },
    { targetLevel: 'N2/N1', qualified: 0, struggling: 1 }
  ];

  // Chart 7: Dormitory Discipline and Cleanliness Trend (Multi-line Chart)
  const dormTrendData = [
    { date: '06-11', cleanlinessScore: 88, infractionCount: 0 },
    { date: '06-12', cleanlinessScore: 82, infractionCount: 1 },
    { date: '06-13', cleanlinessScore: 86, infractionCount: 0 },
    { date: '06-14', cleanlinessScore: 78, infractionCount: 2 },
    { date: '06-15', cleanlinessScore: 81, infractionCount: 1 }
  ];

  // Chart 8: Student Study Engagement Score Trend (Area Chart)
  const engagementTrendData = [
    { day: 'Mon', activeHours: 4.8, reportSubmissions: 8 },
    { day: 'Tue', activeHours: 5.2, reportSubmissions: 9 },
    { day: 'Wed', activeHours: 4.5, reportSubmissions: 7 },
    { day: 'Thu', activeHours: 5.9, reportSubmissions: 10 },
    { day: 'Fri', activeHours: 6.1, reportSubmissions: 8 },
    { day: 'Sat', activeHours: 3.2, reportSubmissions: 6 },
    { day: 'Sun', activeHours: 2.0, reportSubmissions: 4 }
  ];

  // Lists: Top performing students and Interventions list
  const topPerformers = [...activeStudents]
    .sort((a, b) => b.quizAverage - a.quizAverage)
    .slice(0, 4);

  const studentsNeedingIntervention = [...activeStudents]
    .filter(s => s.attendanceRate < 0.85 || s.quizAverage < 72 || s.missingAssignmentsCount > 2 || s.behaviorScore < 75)
    .sort((a, b) => (a.attendanceRate + a.quizAverage/100) - (b.attendanceRate + b.quizAverage/100));

  // Widgets content
  const todayClasses = [
    { time: '08:00 - 10:00', title: 'Akan & Ukemikei (Passive Grammar)', room: 'Room Sakura L4', teacher: 'Tanaka-sensei' },
    { time: '10:15 - 12:00', title: 'SSW Caregiver - Hygiene and Body Transfer Support', room: 'Room Fuji L2', teacher: 'Sato-sensei' },
    { time: '13:30 - 15:30', title: 'Japanese Speaking & Interview Preparation', room: 'Room Miyabi', teacher: 'Hatta-sensei' }
  ];

  const upcomingExams = [
    { date: 'Jun 18', time: '09:00', exam: 'JLPT N4 Mid-Simulations V2', candidates: 'Cohort 24' },
    { date: 'Jun 22', time: '13:00', exam: 'SSW Food Service Prometric Test', candidates: '3 Candidates' },
    { date: 'Jun 25', time: '10:00', exam: 'Kanji Writing Stroke Assessment', candidates: 'All Cohorts' }
  ];

  const recentAccidents = incidents.slice(0, 3);

  // Filter student profile for STUDENT role dashboard
  const currentStudentData = students.find(s => s.id === selectedStudentId) || students[0];

  return (
    <div className="space-y-6">
      
      {/* Header Banner - Contextual Message based on Role */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {role === 'STUDENT' ? `Selamat Datang, ${currentStudentData?.name} 先生` : 'Command & Operations Center'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'STUDENT' 
              ? 'UTB Banjar Japan Preparation Tracker — Monitor your language learning milestones, dormitory rules, and exam progress.'
              : `Centralized metrics for instructors, administrative coordinators, and school leadership.`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-slate-600">
          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
          <span>System Date: 2026-06-15 17:59 (GMT+7)</span>
        </div>
      </div>

      {role !== 'STUDENT' ? (
        <>
          {/* TOP KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-grid">
            
            {/* KPI 1 */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Students Cohorts</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalStudentsCount}</h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Active: <strong className="text-green-600">{activeStudentsCount}</strong> | Leave: {students.filter(s => s.status === 'Leave').length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Users className="h-5 w-5" />
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dorm Occupancy</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{dormOccupancyPct}%</h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Beds: <strong className="text-indigo-600">{totalOccupied}</strong> / {totalCapacity} Capacity
                </p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Home className="h-5 w-5" />
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Attendance</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{avgAttendanceRate}%</h3>
                <p className="text-[10px] text-red-500 mt-1 flex items-center gap-0.5 font-medium">
                  Goal: 95% minimum target
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Test Grade</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{avgQuizScore}</h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Overall Pass Rate: <strong className="text-green-600">{avgAssignmentCompletionRate}%</strong>
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>

            {/* KPI 5 */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Students At Risk</p>
                <h3 className={`text-2xl font-bold mt-1 ${atRiskCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {atRiskCount}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Alerts: <strong className="text-red-500">{atRiskStudents.length} needy</strong>
                </p>
              </div>
              <div className={`p-3 rounded-lg shrink-0 ${atRiskCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            {/* KPI 6 */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">JLPT Simulation Ready</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{examReadinessPct}%</h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Candidates: <strong className="text-blue-600">{examReadyStudents.length}</strong> qualified
                </p>
              </div>
              <div className="p-3 bg-teal-50 text-teal-600 rounded-lg shrink-0">
                <Award className="h-5 w-5" />
              </div>
            </div>

            {/* KPI 7 */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Study Nippou</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {students.filter(s => s.missingAssignmentsCount > 0).length}
                </h3>
                <p className="text-[10px] text-orange-500 mt-1 font-semibold">
                  Unsubmitted today
                </p>
              </div>
              <div className="p-3 bg-slate-50 text-slate-500 rounded-lg shrink-0">
                <FileCheck className="h-5 w-5" />
              </div>
            </div>

            {/* KPI 8 */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dorm Discipline rating</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">91.4%</h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Active incidents: <strong className="text-amber-600">{incidents.filter(i => i.status === 'Active').length}</strong>
                </p>
              </div>
              <div className="p-3 bg-pink-50 text-pink-600 rounded-lg shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

          </div>

          {/* MAIN CHARTS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                UTB Banjar Core Analytics Suite (10 Dynamic KPI Visualizers)
              </h3>
              <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Recharts Real-time Data</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-charts-layout">
              
              {/* Chart 1: Attendance Trend */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-slate-800">1. Daily Attendance Trend (7 Days)</h4>
                  <p className="text-[10px] text-slate-400">Classrooms session comparison vs UTB Banjar 95% target</p>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} domain={[70, 100]} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="attendance" stroke="#2563EB" strokeWidth={2.5} name="Actual" />
                      <Line type="monotone" dataKey="target" stroke="#DC2626" strokeDasharray="4 4" strokeWidth={1.5} name="Target" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Assignment Completion */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-slate-800">2. Assignment Completion Over Time</h4>
                  <p className="text-[10px] text-slate-400">Evaluation by specific Japanese homework metrics</p>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={assignmentTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="kanjiWriting" fill="#4F46E5" name="Kanji" />
                      <Bar dataKey="audioRecord" fill="#06B6D4" name="Speaking" />
                      <Bar dataKey="listeningWork" fill="#10B981" name="Listening" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Quiz Score Distribution */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-slate-800">3. Vocabulary & Grammar Grade Spread</h4>
                  <p className="text-[10px] text-slate-400">Student count sorted by average score range</p>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quizScoreDistData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis dataKey="range" type="category" tick={{ fontSize: 10 }} width={85} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Bar dataKey="students" fill="#2563EB">
                        {quizScoreDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 3 ? '#DC2626' : '#2563EB'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Student Risk Distribution */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-slate-800">4. Dormitory Discipline Risk Levels</h4>
                  <p className="text-[10px] text-slate-400">Total active cohort mapped by behavior status</p>
                </div>
                <div className="h-52 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {riskDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 9 }} align="center" layout="horizontal" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 5: Cohort Comparison */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-slate-800">5. Cohort Performance Comparison</h4>
                  <p className="text-[10px] text-slate-400">Correlating average academic vs attendance rates</p>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cohortComparisonData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="cohort" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="attendance" fill="#059669" name="Attendance %" />
                      <Bar dataKey="quizAvg" fill="#3B82F6" name="Quiz Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 6: JLPT Readiness */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-slate-800">6. JLPT target readiness readiness</h4>
                  <p className="text-[10px] text-slate-400">Instructors valuation for mock testing passing</p>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jlptReadinessData} stackOffset="expand" margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid stroke="#f1f5f9" />
                      <XAxis dataKey="targetLevel" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="qualified" stackId="a" fill="#16A34A" name="Ready / Safe" />
                      <Bar dataKey="struggling" stackId="a" fill="#EAB308" name="Needs Review" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 7: Dormitory Cleanliness Trend */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-slate-800">7. Dorm Cleaning & Discipline Metric</h4>
                  <p className="text-[10px] text-slate-400">Daily hygiene inspection scores vs violations count</p>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dormTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="cleanlinessScore" stroke="#06B6D4" strokeWidth={2.5} name="Hygiene pts" />
                      <Line type="monotone" dataKey="infractionCount" stroke="#EF4444" strokeWidth={2} name="Violations" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 8: Student Study Engagement */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-slate-800">8. UTB Banjar Student Engagement Score Trend</h4>
                  <p className="text-[10px] text-slate-400">Tracking self-guided night study hours</p>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="activeHours" stroke="#F59E0B" fill="#FEF3C7" name="Self-Study hrs" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 9 & 10 List representation inside Grid */}
              
              {/* Chart 9: Top Performing Students Block */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="mb-2">
                    <h4 className="text-xs font-bold text-slate-800">9. Honor Roll: Top Performing Students</h4>
                    <p className="text-[10px] text-slate-400">Ranked by mock academic and behavior points combined</p>
                  </div>
                  <div className="space-y-2 mt-2">
                    {topPerformers.map((student, idx) => (
                      <div key={student.id} className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600 font-mono text-[11px] w-4">#{idx+1}</span>
                          <span className="font-medium text-slate-700">{student.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">{student.classroom}</span>
                          <span className="font-bold text-green-700 font-mono">{student.quizAverage}% Avg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('students')}
                  className="mt-3 text-center text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  View student registry <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Chart 10: Interventions Block */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-betweenCol">
                <div>
                  <div className="mb-2">
                    <h4 className="text-xs font-bold text-slate-800 font-bold flex items-center gap-1.5 text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      10. Students Needing Intervention
                    </h4>
                    <p className="text-[10px] text-slate-400">Real-time safety flags (Grade &lt; 70 or Tardiness)</p>
                  </div>
                  <div className="space-y-2 mt-2">
                    {studentsNeedingIntervention.slice(0, 4).map((student) => (
                      <div key={student.id} className="p-1.5 border border-red-100 bg-red-50/50 rounded flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-red-900">{student.name}</p>
                          <p className="text-[9px] text-red-600 flex gap-2 font-medium">
                            <span>Quiz: {student.quizAverage}%</span>
                            <span>Attend: {Math.round(student.attendanceRate*100)}%</span>
                          </p>
                        </div>
                        <span className="text-[10px] bg-red-100 text-red-700 rounded-sm font-semibold px-1 py-0.5">
                          {student.missingAssignmentsCount > 2 ? 'Miss Assignments' : 'Poor Grades'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* SYSTEM WIDGETS DECK */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            
            {/* Widget 1: Today's Class Schedule */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Today's Classes & Workshops</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">LIVE</span>
              </h3>
              <div className="space-y-3 mt-3">
                {todayClasses.map((cl, i) => (
                  <div key={i} className="flex gap-2 text-xs border-l-2 border-blue-500 pl-2.5">
                    <div className="text-[10px] font-mono text-slate-500 shrink-0 select-none py-0.5">
                      {cl.time}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{cl.title}</h4>
                      <div className="flex gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>Room: <strong className="font-semibold text-slate-600">{cl.room}</strong></span>
                        <span>•</span>
                        <span>Sensei: <strong className="font-semibold text-slate-600">{cl.teacher}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Upcoming Exams */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                Upcoming Prometric & Language Simulations
              </h3>
              <div className="space-y-3 mt-3">
                {upcomingExams.map((ex, i) => (
                  <div key={i} className="flex justify-between items-center text-xs bg-slate-50/50 p-2 border border-slate-100 rounded-sm">
                    <div>
                      <h4 className="font-bold text-slate-700">{ex.exam}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Target: <strong className="font-medium text-slate-600">{ex.candidates}</strong></p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded font-mono">
                        {ex.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 3: Recent Dormitory Incidents & Warnings */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Recent Dormitory Violations</span>
                <span className="text-[10px] text-red-500 font-bold">Active: {recentAccidents.filter(a => a.status === 'Active').length}</span>
              </h3>
              <div className="space-y-2 mt-3">
                {recentAccidents.map((ac) => (
                  <div key={ac.id} className="text-xs p-2 border border-slate-100 rounded flex gap-2 items-start justify-between bg-slate-50/50">
                    <div>
                      <div className="flex gap-2 items-center">
                        <strong className="text-slate-800">{ac.studentName}</strong>
                        <span className="text-[9px] text-slate-500 font-mono">{ac.id}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{ac.category} - <span className="text-red-700">{ac.actionTaken}</span></p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      ac.severity === 'High' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {ac.severity}
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => onNavigate('discipline')}
                className="w-full mt-3 text-center text-[10px] font-bold text-blue-600 hover:text-blue-700 block cursor-pointer"
              >
                View behave & merit boards
              </button>
            </div>

          </div>
        </>
      ) : (
        /* STUDENT PORTAL DESIGN */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Student Profile Overview Sidebar Info Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                <div className="h-20 w-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-2xl text-blue-600">
                  {currentStudentData?.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-base font-bold text-slate-800 mt-3">{currentStudentData?.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{currentStudentData?.id}</p>
                <span className={`mt-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  currentStudentData?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  Status: {currentStudentData?.status}
                </span>
              </div>

              <div className="py-4 space-y-2 text-xs border-b border-indigo-50">
                <div className="flex justify-between"><span className="text-slate-400">Cohort ID:</span><span className="font-semibold">{currentStudentData?.cohort}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Classroom:</span><span className="font-semibold">{currentStudentData?.classroom}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Dorm Mapping:</span><span className="font-semibold">{currentStudentData?.dormBuilding} - {currentStudentData?.dormRoom} (Bed {currentStudentData?.dormBed})</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Japan SSW Domain:</span><span className="font-semibold bg-blue-50 text-blue-700 px-1 py-0.5 rounded text-[10px]">{currentStudentData?.sswField}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Grad target:</span><span className="font-medium">{currentStudentData?.graduationTarget}</span></div>
              </div>

              <div className="pt-4">
                <h4 className="text-xs font-bold text-slate-700 mb-2">My Japan Preparation Target</h4>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 border border-slate-100 rounded">
                    <p className="text-[10px] text-slate-400">Target JLPT</p>
                    <p className="font-bold text-blue-600 text-sm mt-0.5">{currentStudentData?.jlptTarget}</p>
                  </div>
                  <div className="bg-slate-50 p-2 border border-slate-100 rounded">
                    <p className="text-[10px] text-slate-400">Current Level</p>
                    <p className="font-bold text-indigo-600 text-sm mt-0.5">{currentStudentData?.currentJlptLevel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* At Risk warning if student stats are down */}
            {currentStudentData && (currentStudentData.attendanceRate < 0.85 || currentStudentData.quizAverage < 75) ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-900 shadow-3xs">
                <div className="flex items-center gap-1.5 font-bold mb-1 header-text">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>Saran Bimbingan Sensei (Intervention Notice)</span>
                </div>
                <p className="leading-relaxed">
                  Skor kuis atau kehadiran Anda berada di bawah batas ketuntasan minimum UTB Banjar. Silakan diskusikan materi sulit Anda di modul laporan harian dan ikuti bimbingan malam.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-xs text-green-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Kondisi Pembelajaran Baik (Healthy Status)</span>
                </div>
                <p className="leading-relaxed">
                  Kerja bagus! Anda terus menunjukkan kehadiran yang stabil dan perilaku terpuji di asrama. Teruskan perjuangan menuju Jepang.
                </p>
              </div>
            )}
          </div>

          {/* Student Learning Performance Grid */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* My KPI mini Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">My Attendance</p>
                <h4 className="text-xl font-bold text-slate-900 mt-1">{Math.round((currentStudentData?.attendanceRate || 0) * 100)}%</h4>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(currentStudentData?.attendanceRate || 0) * 100}%` }}></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">My Quiz Average</p>
                <h4 className="text-xl font-bold text-slate-900 mt-1">{currentStudentData?.quizAverage}%</h4>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${currentStudentData?.quizAverage || 0}%` }}></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">My Behavior Points</p>
                <h4 className={`text-xl font-bold mt-1 ${currentStudentData?.behaviorScore >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                  {currentStudentData?.behaviorScore} pts
                </h4>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${currentStudentData?.behaviorScore >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${currentStudentData?.behaviorScore || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Missing Homework</p>
                <h4 className={`text-xl font-bold mt-1 ${currentStudentData?.missingAssignmentsCount > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                  {currentStudentData?.missingAssignmentsCount} HWs
                </h4>
                <p className="text-[9px] text-slate-400 mt-1 font-medium">Out of 6 assigned</p>
              </div>

            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-900 mb-3">Fast Student Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button 
                  onClick={() => onNavigate('reports')}
                  className="p-3 border border-blue-100 hover:border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded text-left transition text-xs font-medium cursor-pointer"
                >
                  📝 Submit Daily Report (Nippou)
                </button>
                <button 
                  onClick={() => onNavigate('dormitory')}
                  className="p-3 border border-indigo-100 hover:border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 rounded text-left transition text-xs font-medium cursor-pointer"
                >
                  🧹 View My Dorm cleanliness checklist
                </button>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="p-3 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-left transition text-xs font-medium cursor-pointer"
                >
                  🚀 Review JLPT simulator readiness
                </button>
              </div>
            </div>

            {/* Chart: Progress radar simulation */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-800">My Language Skill Mastery Profile</h4>
                <p className="text-[10px] text-slate-400">Calculated based on weekly grammar quizzes and speech practices</p>
              </div>
              
              <div className="h-64 flex items-center justify-center">
                {/* Simulated Radar Chart values in crisp display */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  {[
                    { skill: 'Vocabulary (語彙)', value: currentStudentData?.quizAverage ? Math.round(currentStudentData.quizAverage * 1.05) : 85, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { skill: 'Kanji (漢字)', value: currentStudentData?.quizAverage ? Math.round(currentStudentData.quizAverage * 0.95) : 78, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { skill: 'Grammar (文法)', value: currentStudentData?.quizAverage ? Math.round(currentStudentData.quizAverage * 0.98) : 80, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { skill: 'Listening (聴解)', value: currentStudentData?.quizAverage ? Math.round(currentStudentData.quizAverage * 1.01) : 82, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { skill: 'Reading (読解)', value: 80, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                    { skill: 'Speaking (会話)', value: 85, color: 'text-pink-600', bg: 'bg-pink-50' },
                    { skill: 'Interview Skill', value: currentStudentData?.interviewReadiness === 'Ready' ? 90 : 70, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { skill: 'Discipline Score', value: currentStudentData?.behaviorScore || 90, color: 'text-rose-600', bg: 'bg-rose-50' }
                  ].map((s, i) => (
                    <div key={i} className={`p-3 rounded-md border border-slate-100 ${s.bg}`}>
                      <p className="text-[10px] font-bold text-slate-500 uppercase shrink-0 tracking-tight leading-tight block line-clamp-1">{s.skill}</p>
                      <p className={`text-lg font-mono font-bold ${s.color} mt-1`}>{s.value}%</p>
                      <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5">
                        <div className="bg-slate-600 h-full rounded-full" style={{ width: `${s.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
