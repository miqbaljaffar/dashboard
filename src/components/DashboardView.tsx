import React from 'react';
import { Student, AttendanceRecord, Assignment, GradeColumn } from '../types';
import {
  Users,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Printer
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
  Pie
} from 'recharts';

interface DashboardViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  grades: GradeColumn[];
  onNavigate: (tab: string) => void;
  onPrintClick?: () => void;
}

export default function DashboardView({
  students,
  attendance,
  assignments,
  grades,
  onNavigate,
  onPrintClick
}: DashboardViewProps) {
  
  // Real data calculations
  const totalStudentsCount = students.length;
  const activeStudents = students.filter(s => s.status === 'Active');
  const activeStudentsCount = activeStudents.length;
  
  // Overall Attendance Rate
  const avgAttendanceRate = activeStudents.length 
    ? Math.round((activeStudents.reduce((acc, s) => acc + s.attendanceRate, 0) / activeStudents.length) * 100)
    : 0;

  // Average Quiz Score across all grade columns of type 'Kuis'
  const quizColumns = grades.filter(g => g.type === 'Kuis');
  let totalQuizScore = 0;
  let totalQuizCount = 0;
  quizColumns.forEach(g => {
    g.scores?.forEach(s => {
      if (s.score !== null && s.score !== undefined) {
        totalQuizScore += s.score;
        totalQuizCount++;
      }
    });
  });
  const avgQuizScore = totalQuizCount ? parseFloat((totalQuizScore / totalQuizCount).toFixed(1)) : 0;

  // Average Exam Score across all grade columns of type 'Ulangan'
  const examColumns = grades.filter(g => g.type === 'Ulangan');
  let totalExamScore = 0;
  let totalExamCount = 0;
  examColumns.forEach(g => {
    g.scores?.forEach(s => {
      if (s.score !== null && s.score !== undefined) {
        totalExamScore += s.score;
        totalExamCount++;
      }
    });
  });
  const avgExamScore = totalExamCount ? parseFloat((totalExamScore / totalExamCount).toFixed(1)) : 0;

  // For each student, find their average quiz score across all quiz columns
  const studentQuizAverages = activeStudents.map(student => {
    let sum = 0;
    let count = 0;
    quizColumns.forEach(g => {
      const match = g.scores?.find(s => s.studentId === student.id);
      if (match && match.score !== null && match.score !== undefined) {
        sum += match.score;
        count++;
      }
    });
    return count ? sum / count : null;
  });

  // Students at Risk (attendance < 82% or quiz score average < 75)
  const atRiskStudents = activeStudents.filter((s, idx) => {
    const avgQuiz = studentQuizAverages[idx];
    return s.attendanceRate < 0.82 || 
           (avgQuiz !== null && avgQuiz < 75);
  });
  const atRiskCount = atRiskStudents.length;

  // Chart 1: Attendance Trend Over Days (Line Chart calculated dynamically)
  const getAttendanceTrendData = () => {
    if (!attendance || attendance.length === 0) {
      return [
        { day: 'Mon', attendance: 0, target: 95 },
        { day: 'Tue', attendance: 0, target: 95 },
        { day: 'Wed', attendance: 0, target: 95 },
        { day: 'Thu', attendance: 0, target: 95 },
        { day: 'Fri', attendance: 0, target: 95 },
        { day: 'Sat', attendance: 0, target: 95 },
        { day: 'Sun', attendance: 0, target: 95 }
      ];
    }

    // Group attendance records by date
    const attendanceByDate: { [date: string]: { present: number; total: number } } = {};
    attendance.forEach(record => {
      const dateStr = record.date;
      if (!attendanceByDate[dateStr]) {
        attendanceByDate[dateStr] = { present: 0, total: 0 };
      }
      
      let presentCount = 0;
      if (record.morning === 'Present') presentCount++;
      if (record.classSession === 'Present') presentCount++;
      
      attendanceByDate[dateStr].present += presentCount;
      attendanceByDate[dateStr].total += 2;
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(attendanceByDate).sort();
    
    // Take the last 7 dates for the trend
    const lastDates = sortedDates.slice(-7);

    return lastDates.map(date => {
      const data = attendanceByDate[date];
      const rate = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
      
      // Try to parse day name or date format
      let dayLabel = date;
      try {
        const parts = date.split('-');
        if (parts.length === 3) {
          const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          if (!isNaN(dateObj.getTime())) {
            dayLabel = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'numeric' });
          }
        }
      } catch (e) {
        // Fallback to raw date string
      }

      return {
        day: dayLabel,
        attendance: rate,
        target: 95
      };
    });
  };

  const attendanceTrendData = getAttendanceTrendData();

  // Chart 2: Quiz Score Distribution (Histogram style)
  const quizScoreDistData = [
    { range: '90-100 (A)', students: studentQuizAverages.filter(avg => avg !== null && avg >= 90).length },
    { range: '80-89 (B)', students: studentQuizAverages.filter(avg => avg !== null && avg >= 80 && avg < 90).length },
    { range: '70-79 (C)', students: studentQuizAverages.filter(avg => avg !== null && avg >= 70 && avg < 80).length },
    { range: '<70 (D/At Risk)', students: studentQuizAverages.filter(avg => avg !== null && avg < 70).length },
    { range: 'Belum Dinilai', students: studentQuizAverages.filter(avg => avg === null).length }
  ];

  // riskDistData removed because behavior score chart is removed

  // Assignment submissions calculations
  let totalExpectedSubmissions = 0;
  let totalSubmittedCount = 0;
  assignments.forEach(a => {
    a.submissions?.forEach(sub => {
      if (activeStudents.some(s => s.id === sub.studentId)) {
        totalExpectedSubmissions++;
        if (sub.submitted) {
          totalSubmittedCount++;
        }
      }
    });
  });

  const taskSubmissionData = [
    { name: 'Terkumpul', value: totalSubmittedCount, color: '#10B981' },
    { name: 'Belum Kumpul', value: Math.max(0, totalExpectedSubmissions - totalSubmittedCount), color: '#F43F5E' }
  ];

  // Latest 3 assignments completion rate stats
  const assignmentStats = assignments.slice(-3).map(a => {
    const total = a.submissions?.filter(sub => activeStudents.some(s => s.id === sub.studentId)).length || 0;
    const submitted = a.submissions?.filter(sub => sub.submitted && activeStudents.some(s => s.id === sub.studentId)).length || 0;
    const percent = total > 0 ? Math.round((submitted / total) * 100) : 0;
    return { title: a.title, percent };
  });

  // Lists: Top performing students by quiz average
  const topPerformers = activeStudents
    .map((student, idx) => {
      const avg = studentQuizAverages[idx];
      return { student, avg };
    })
    .filter(item => item.avg !== null)
    .sort((a, b) => (b.avg || 0) - (a.avg || 0))
    .slice(0, 4)
    .map(item => ({
      ...item.student,
      quizScore: Math.round(item.avg || 0)
    }));

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Command & Operations Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dasbor ringkasan pusat untuk memantau presensi, perilaku, dan nilai akademik siswa UTB Banjar.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0 select-none">
          <button
            onClick={onPrintClick}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded-lg shadow-sm transition duration-200 cursor-pointer no-print"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak Report
          </button>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600">
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Sistem Aktif: Sensei Pengajar</span>
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-grid">
        
        {/* KPI 1: Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Siswa</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalStudentsCount}</h3>
            <p className="text-[10px] text-slate-500 mt-1">
              Aktif: <strong className="text-green-600">{activeStudentsCount}</strong> | Cuti: {students.filter(s => s.status === 'Leave').length}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2: Attendance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rata Kehadiran</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{avgAttendanceRate}%</h3>
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-0.5 font-medium">
              Target minimum: 95%
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3: Quiz Score Average */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rata Nilai Kuis</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{avgQuizScore || '-'}</h3>
            <p className="text-[10px] text-slate-500 mt-1">
              Rata Ulangan: <strong className="text-indigo-600">{avgExamScore || '-'}</strong>
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 4: Students At Risk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Siswa At-Risk</p>
            <h3 className={`text-2xl font-bold mt-1 ${atRiskCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {atRiskCount}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">
              Membutuhkan bimbingan khusus
            </p>
          </div>
          <div className={`p-3 rounded-lg shrink-0 ${atRiskCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* CHARTS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Analisis Utama UTB Banjar
          </h3>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">Recharts Real-time Data</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-charts-layout">
          
          {/* Chart 1: Attendance Trend */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800">1. Tren Kehadiran Harian (7 Hari)</h4>
              <p className="text-[10px] text-slate-400">Rata-rata presensi harian kelas dibanding target 95%</p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} domain={[70, 100]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="attendance" stroke="#2563EB" strokeWidth={2.5} name="Kehadiran" />
                  <Line type="monotone" dataKey="target" stroke="#DC2626" strokeDasharray="4 4" strokeWidth={1.5} name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Quiz Score Distribution */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800">2. Distribusi Nilai Kuis Siswa</h4>
              <p className="text-[10px] text-slate-400">Jumlah siswa aktif berdasarkan rentang nilai kuis</p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizScoreDistData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis dataKey="range" type="category" tick={{ fontSize: 10 }} width={85} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="students" fill="#2563EB" name="Siswa">
                    {quizScoreDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#DC2626' : index === 4 ? '#94a3b8' : '#2563EB'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Assignment Submission Rate */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800">3. Tingkat Penyerahan Tugas</h4>
              <p className="text-[10px] text-slate-400">Status pengumpulan tugas oleh seluruh siswa aktif</p>
            </div>
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskSubmissionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskSubmissionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} align="center" layout="horizontal" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* SYSTEM WIDGETS DECK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Widget 1: Top Performing Students Block */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800">4. Honor Roll: Siswa Berprestasi Terbaik</h4>
              <p className="text-[10px] text-slate-400">Diurutkan berdasarkan nilai kuis rata-rata</p>
            </div>
            <div className="space-y-2.5 mt-2">
              {topPerformers.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Belum ada siswa dengan nilai kuis aktif.</p>
              ) : (
                topPerformers.map((student, idx) => (
                  <div key={student.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600 font-mono text-[11px] w-4">#{idx+1}</span>
                      <span className="font-semibold text-slate-700">{student.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                        Presensi: {Math.round(student.attendanceRate * 100)}%
                      </span>
                      <span className="font-bold text-green-700 font-mono">Kuis Avg: {student.quizScore}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <button 
            onClick={() => onNavigate('academia')}
            className="mt-4 text-center text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 cursor-pointer"
          >
            Buka Lembar Tugas & Nilai <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Widget 2: Academic & Assignment Insights Block */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800">5. Analisis Tugas & Evaluasi Kelas</h4>
              <p className="text-[10px] text-slate-400">Ringkasan pengumpulan tugas terbaru dan perbandingan tipe nilai</p>
            </div>
            
            <div className="space-y-3.5 mt-3">
              {/* Assignment Stats list */}
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Penyelesaian Tugas Terbaru</span>
                {assignmentStats.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic py-2">Belum ada tugas aktif untuk dianalisis.</p>
                ) : (
                  <div className="space-y-2">
                    {assignmentStats.map(stat => (
                      <div key={stat.title} className="text-xs">
                        <div className="flex justify-between items-center mb-1 text-slate-700">
                          <span className="font-medium truncate max-w-xs">{stat.title}</span>
                          <span className="font-bold font-mono">{stat.percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              stat.percent >= 90 ? 'bg-emerald-500' : stat.percent >= 75 ? 'bg-blue-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${stat.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formative vs Sumative breakdown */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Rata-Rata Kuis (Formatur)</span>
                  <span className="text-lg font-black text-slate-800 font-mono mt-1 block">{avgQuizScore || '-'}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Rata-Rata Ujian (Sumatif)</span>
                  <span className="text-lg font-black text-slate-800 font-mono mt-1 block">{avgExamScore || '-'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate('academia')}
            className="w-full mt-4 text-center text-[10px] font-bold text-blue-600 hover:text-blue-700 block cursor-pointer"
          >
            Buka Analisis & Nilai Lengkap
          </button>
        </div>

      </div>

    </div>
  );
}
