import React from 'react';
import { Student, AttendanceRecord, GradeColumn } from '../types';
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
  Pie,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/40 p-2.5 rounded-lg shadow-xl text-white text-[10px]">
        <p className="font-bold mb-1 text-slate-350">{label}</p>
        {payload.map((pld: any) => (
          <div key={pld.name || pld.dataKey} className="flex items-center gap-2 mt-0.5">
            <span 
              className="h-1.5 w-1.5 rounded-full" 
              style={{ backgroundColor: pld.color || pld.fill }}
            ></span>
            <span className="text-slate-300">
              {pld.name || pld.dataKey}: <strong className="text-white">{pld.value}</strong>
              {(pld.name?.includes('Kehadiran') || pld.name?.includes('Pagi') || pld.name?.includes('Sesi Kelas') || pld.name?.includes('Presensi')) ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface DashboardViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  grades: GradeColumn[];
  selectedStudentId: string;
  onSelectedStudentChange: (id: string) => void;
  onNavigate: (tab: string) => void;
  onPrintClick?: () => void;
}

export default function DashboardView({
  students,
  attendance,
  grades,
  selectedStudentId,
  onSelectedStudentChange,
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

  // For each student, find their average exam score across all exam columns
  const studentExamAverages = activeStudents.map(student => {
    let sum = 0;
    let count = 0;
    examColumns.forEach(g => {
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

  // Chart 3: Exam Score Distribution (Histogram style)
  const examScoreDistData = [
    { range: '90-100 (A)', students: studentExamAverages.filter(avg => avg !== null && avg >= 90).length },
    { range: '80-89 (B)', students: studentExamAverages.filter(avg => avg !== null && avg >= 80 && avg < 90).length },
    { range: '70-79 (C)', students: studentExamAverages.filter(avg => avg !== null && avg >= 70 && avg < 80).length },
    { range: '<70 (D/At Risk)', students: studentExamAverages.filter(avg => avg !== null && avg < 70).length },
    { range: 'Belum Ujian', students: studentExamAverages.filter(avg => avg === null).length }
  ];

  // Lists: Top performing students by quiz average
  const topQuizPerformers = activeStudents
    .map((student, idx) => {
      const avg = studentQuizAverages[idx];
      return { student, avg };
    })
    .filter(item => item.avg !== null)
    .sort((a, b) => (b.avg || 0) - (a.avg || 0))
    .slice(0, 3)
    .map(item => ({
      ...item.student,
      quizScore: Math.round(item.avg || 0)
    }));

  // Lists: Top performing students by exam average
  const topExamPerformers = activeStudents
    .map((student, idx) => {
      const avg = studentExamAverages[idx];
      return { student, avg };
    })
    .filter(item => item.avg !== null)
    .sort((a, b) => (b.avg || 0) - (a.avg || 0))
    .slice(0, 3)
    .map(item => ({
      ...item.student,
      examScore: Math.round(item.avg || 0)
    }));

  // Individual Student Focus Calculations
  const isIndividualFocus = selectedStudentId !== 'all';
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Student specific average quiz
  const studentIndex = activeStudents.findIndex(s => s.id === selectedStudentId);
  const studentQuizAvg = studentIndex !== -1 ? studentQuizAverages[studentIndex] : null;
  const displayQuizAvg = studentQuizAvg !== null ? parseFloat(studentQuizAvg.toFixed(1)) : 0;

  // Student specific exam average
  let studentExamSum = 0;
  let studentExamCount = 0;
  examColumns.forEach(g => {
    const scoreObj = g.scores?.find(s => s.studentId === selectedStudentId);
    if (scoreObj && scoreObj.score !== null) {
      studentExamSum += scoreObj.score;
      studentExamCount++;
    }
  });
  const studentExamAvg = studentExamCount > 0 ? parseFloat((studentExamSum / studentExamCount).toFixed(1)) : 0;

  // Student individual attendance trend data (last 7 days)
  const getIndividualAttendanceTrend = () => {
    if (!selectedStudentId) return [];
    const records = attendance
      .filter(r => r.studentId === selectedStudentId)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    const statusToVal = (status: string) => {
      if (status === 'Present') return 100;
      if (status === 'Late') return 50;
      return 0; // Sick or Absent
    };

    return records.map(r => {
      let dayLabel = r.date;
      try {
        const parts = r.date.split('-');
        if (parts.length === 3) {
          const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          if (!isNaN(dateObj.getTime())) {
            dayLabel = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
          }
        }
      } catch (e) {}

      return {
        day: dayLabel,
        'Presensi Pagi': statusToVal(r.morning),
        'Sesi Kelas': statusToVal(r.classSession)
      };
    });
  };
  const individualAttendanceData = getIndividualAttendanceTrend();

  // Student individual grades compared to class averages (helper)
  const getIndividualGradesCompare = (columnsList: typeof grades) => {
    return columnsList.map(g => {
      const match = g.scores?.find(s => s.studentId === selectedStudentId);
      const studentScore = match ? match.score : null;

      // Class average
      let sum = 0;
      let count = 0;
      g.scores?.forEach(s => {
        if (s.score !== null) {
          sum += s.score;
          count++;
        }
      });
      const classAvg = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;

      return {
        materi: g.title.length > 12 ? g.title.slice(0, 10) + '...' : g.title,
        'Nilai Siswa': studentScore !== null ? studentScore : 0,
        'Rata-Rata Kelas': classAvg
      };
    });
  };
  const individualQuizCompareData = getIndividualGradesCompare(quizColumns);
  const individualExamCompareData = getIndividualGradesCompare(examColumns);

  // Student individual grades history for widget
  const studentGradesList = grades.map(g => {
    const scoreObj = g.scores?.find(s => s.studentId === selectedStudentId);
    const score = scoreObj ? scoreObj.score : null;
    return {
      id: g.id,
      title: g.title,
      type: g.type,
      date: g.date,
      score: score
    };
  });

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
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Fokus Analisis:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => onSelectedStudentChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs focus:outline-hidden focus:border-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="all">📊 Seluruh Kelas (Kolektif)</option>
              <optgroup label="Daftar Siswa Aktif">
                {activeStudents.map(s => (
                  <option key={s.id} value={s.id}>👤 {s.name} ({s.id})</option>
                ))}
              </optgroup>
            </select>
          </div>
          <button
            onClick={onPrintClick}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded-lg shadow-sm transition duration-200 cursor-pointer no-print"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak Report
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-grid">
        
        {/* KPI 1: Students / Individual Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isIndividualFocus ? 'Status Trainee' : 'Total Siswa'}
            </p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {isIndividualFocus ? (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                  selectedStudent?.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {selectedStudent?.status === 'Active' ? 'Aktif' : 'Cuti'}
                </span>
              ) : (
                `${totalStudentsCount} Orang`
              )}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1.5">
              {isIndividualFocus ? (
                <span>ID: <strong className="font-mono">{selectedStudent?.id}</strong></span>
              ) : (
                <span>Aktif: <strong className="text-green-600">{activeStudentsCount}</strong> | Cuti: {students.filter(s => s.status === 'Leave').length}</span>
              )}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2: Attendance / Individual Attendance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isIndividualFocus ? 'Presensi Trainee' : 'Rata Kehadiran'}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {isIndividualFocus ? `${Math.round((selectedStudent?.attendanceRate || 0) * 100)}%` : `${avgAttendanceRate}%`}
            </h3>
            <p className="text-[10px] mt-1">
              {isIndividualFocus ? (
                Math.round((selectedStudent?.attendanceRate || 0) * 100) >= 95 ? (
                  <span className="text-green-600 font-bold">Memenuhi Target {"(≥95%)"}</span>
                ) : (
                  <span className="text-red-500 font-bold">Di Bawah Target {"(<95%)"}</span>
                )
              ) : (
                <span className="text-red-500 font-medium">Target minimum: 95%</span>
              )}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3: Quiz Score Average / Individual Average */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isIndividualFocus ? 'Rerata Kuis Trainee' : 'Rata Nilai Kuis'}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {isIndividualFocus ? (displayQuizAvg || '-') : (avgQuizScore || '-')}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">
              {isIndividualFocus ? (
                <span>Rata Ujian: <strong className="text-violet-600">{studentExamAvg || '-'}</strong></span>
              ) : (
                <span>Rata Ulangan: <strong className="text-indigo-600">{avgExamScore || '-'}</strong></span>
              )}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 4: Students At Risk / Individual Graduation Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isIndividualFocus ? 'Ketuntasan KKM' : 'Siswa At-Risk'}
            </p>
            <h3 className="text-xl font-extrabold mt-1">
              {isIndividualFocus ? (
                studentQuizAvg === null ? (
                  <span className="text-slate-400">Belum Dinilai</span>
                ) : studentQuizAvg >= 75 ? (
                  <span className="text-green-600">LULUS</span>
                ) : (
                  <span className="text-red-600">REMEDIAL</span>
                )
              ) : (
                <span className={atRiskCount > 0 ? 'text-red-600' : 'text-green-600'}>
                  {atRiskCount}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1.5">
              {isIndividualFocus ? (
                <span>Batas KKM Kelulusan: <strong className="font-mono text-slate-700">75</strong></span>
              ) : (
                <span>Membutuhkan bimbingan khusus</span>
              )}
            </p>
          </div>
          <div className={`p-3 rounded-lg shrink-0 ${
            isIndividualFocus 
              ? (studentQuizAvg !== null && studentQuizAvg < 75 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600')
              : (atRiskCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400')
          }`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* CHARTS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            {isIndividualFocus ? `Analisis Personal: ${selectedStudent?.name}` : 'Analisis Utama UTB Banjar'}
          </h3>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">Recharts Real-time Data</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-layout">
          {/* Chart 1: Attendance Trend (Collective) / Presensi Detail (Individual) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800">
                {isIndividualFocus ? '1. Log Presensi Trainee (7 Catatan)' : '1. Tren Kehadiran Harian (7 Hari)'}
              </h4>
              <p className="text-[10px] text-slate-400">
                {isIndividualFocus ? 'Status kehadiran pagi vs kelas (100%=Hadir, 50%=Telat, 0%=Absen/Sakit)' : 'Rata-rata presensi harian kelas dibanding target 95%'}
              </p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                {isIndividualFocus ? (
                  <BarChart data={individualAttendanceData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="pagiColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.85}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.55}/>
                      </linearGradient>
                      <linearGradient id="siangColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.85}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.55}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                    <Bar dataKey="Presensi Pagi" fill="url(#pagiColor)" name="Sesi Pagi" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Sesi Kelas" fill="url(#siangColor)" name="Sesi Kelas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <ComposedChart data={attendanceTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="attendanceColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[70, 100]} stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                    <Area type="monotone" dataKey="attendance" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#attendanceColor)" name="Kehadiran" />
                    <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="6 6" strokeWidth={2} name="Target" dot={false} activeDot={false} />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Quiz Score Distribution (Collective) / Perbandingan Nilai Kuis (Individual) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800">
                {isIndividualFocus ? '2. Nilai Kuis Trainee vs Rata Kelas' : '2. Distribusi Nilai Kuis Siswa'}
              </h4>
              <p className="text-[10px] text-slate-400">
                {isIndividualFocus ? 'Komparasi nilai kuis per materi terhadap rerata kelas' : 'Jumlah siswa aktif berdasarkan rentang nilai kuis'}
              </p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                {isIndividualFocus ? (
                  <ComposedChart data={individualQuizCompareData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="siswaColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                    <XAxis dataKey="materi" tick={{ fontSize: 8, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                    <Bar dataKey="Nilai Siswa" fill="url(#siswaColor)" name="Nilai Trainee" radius={[4, 4, 0, 0]} barSize={18} />
                    <Line type="monotone" dataKey="Rata-Rata Kelas" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" name="Rerata Kelas" dot={{ r: 2.5, stroke: '#94A3B8', strokeWidth: 1, fill: '#fff' }} />
                  </ComposedChart>
                ) : (
                  <BarChart data={quizScoreDistData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="emeraldBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.9}/>
                      </linearGradient>
                      <linearGradient id="blueBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0.9}/>
                      </linearGradient>
                      <linearGradient id="amberBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#D97706" stopOpacity={0.9}/>
                      </linearGradient>
                      <linearGradient id="roseBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#DC2626" stopOpacity={0.9}/>
                      </linearGradient>
                      <linearGradient id="slateBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#475569" stopOpacity={0.9}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis dataKey="range" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={85} stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="students" name="Jumlah Siswa" radius={[0, 4, 4, 0]}>
                      {quizScoreDistData.map((entry, index) => {
                        const colors = ['url(#emeraldBar)', 'url(#blueBar)', 'url(#amberBar)', 'url(#roseBar)', 'url(#slateBar)'];
                        return <Cell key={`cell-${index}`} fill={colors[index] || 'url(#blueBar)'} />;
                      })}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Exam Score Distribution (Collective) / Perbandingan Nilai Ulangan (Individual) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800">
                {isIndividualFocus ? '3. Nilai Ulangan Trainee vs Rata Kelas' : '3. Distribusi Nilai Ulangan Siswa'}
              </h4>
              <p className="text-[10px] text-slate-400">
                {isIndividualFocus ? 'Komparasi nilai ulangan per materi terhadap rerata kelas' : 'Jumlah siswa aktif berdasarkan rentang nilai ulangan'}
              </p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                {isIndividualFocus ? (
                  <ComposedChart data={individualExamCompareData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="siswaExamColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                    <XAxis dataKey="materi" tick={{ fontSize: 8, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                    <Bar dataKey="Nilai Siswa" fill="url(#siswaExamColor)" name="Nilai Trainee" radius={[4, 4, 0, 0]} barSize={18} />
                    <Line type="monotone" dataKey="Rata-Rata Kelas" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" name="Rerata Kelas" dot={{ r: 2.5, stroke: '#94A3B8', strokeWidth: 1, fill: '#fff' }} />
                  </ComposedChart>
                ) : (
                  <BarChart data={examScoreDistData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="emeraldBarExam" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.9}/>
                      </linearGradient>
                      <linearGradient id="blueBarExam" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0.9}/>
                      </linearGradient>
                      <linearGradient id="amberBarExam" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#D97706" stopOpacity={0.9}/>
                      </linearGradient>
                      <linearGradient id="roseBarExam" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#DC2626" stopOpacity={0.9}/>
                      </linearGradient>
                      <linearGradient id="slateBarExam" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#475569" stopOpacity={0.9}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis dataKey="range" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={85} stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="students" name="Jumlah Siswa" radius={[0, 4, 4, 0]}>
                      {examScoreDistData.map((entry, index) => {
                        const colors = ['url(#emeraldBarExam)', 'url(#blueBarExam)', 'url(#amberBarExam)', 'url(#roseBarExam)', 'url(#slateBarExam)'];
                        return <Cell key={`cell-${index}`} fill={colors[index] || 'url(#blueBarExam)'} />;
                      })}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SYSTEM WIDGETS DECK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {isIndividualFocus ? (
          /* INDIVIDUAL FOCUS WIDGETS */
          <>
            {/* Widget 1: Profile & Risk Analysis */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-800">4. Analisis Kelayakan & Profil Trainee</h4>
                  <p className="text-[10px] text-slate-400">Pendeteksi otomatis status at-risk dan kelayakan kelulusan siswa</p>
                </div>
                
                <div className="space-y-3.5 mt-4">
                  {/* Student profile metadata */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs">{selectedStudent?.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {selectedStudent?.id} | Fuji Elite Class</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      selectedStudent?.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {selectedStudent?.status === 'Active' ? 'Aktif' : 'Cuti'}
                    </span>
                  </div>

                  {/* Warning and alert block */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Catatan Performa Kritis</span>
                    {selectedStudent?.attendanceRate && selectedStudent.attendanceRate < 0.82 ? (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-lg flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">⚠️ Kehadiran di Bawah Batas Kelulusan</p>
                          <p className="text-[10px] text-rose-600 mt-0.5">Tingkat presensi {Math.round(selectedStudent.attendanceRate * 100)}% berada di bawah target aman 82%.</p>
                        </div>
                      </div>
                    ) : null}

                    {studentQuizAvg !== null && studentQuizAvg < 75 ? (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-lg flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">⚠️ Rata-Rata Kuis di Bawah KKM</p>
                          <p className="text-[10px] text-rose-600 mt-0.5">Rata kuis {displayQuizAvg} di bawah batas ketuntasan minimal (75).</p>
                        </div>
                      </div>
                    ) : null}

                    {(!selectedStudent?.attendanceRate || selectedStudent.attendanceRate >= 0.82) &&
                     (studentQuizAvg === null || studentQuizAvg >= 75) ? (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold">✅ Trainee Kondisi Prima</p>
                          <p className="text-[10px] text-emerald-600 mt-0.5">Seluruh kehadiran dan nilai KKM memenuhi standar kelulusan.</p>
                        </div>
                      </div>
                     ) : null}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('students')}
                className="mt-4 text-center text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                Buka Profil & Edit Biodata Siswa <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Widget 2: Student Score History */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-800">5. Riwayat Nilai Trainee</h4>
                  <p className="text-[10px] text-slate-400">Daftar nilai kuis dan ulangan yang diperoleh trainee</p>
                </div>
                
                <div className="space-y-2 mt-4 max-h-[190px] overflow-y-auto custom-scrollbar">
                  {studentGradesList.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-xs font-bold">Belum ada kolom nilai 📊</p>
                      <p className="text-[10px] mt-0.5">Tidak ada data kuis atau ulangan yang tercatat di kelas ini.</p>
                    </div>
                  ) : (
                    studentGradesList.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                        <div className="min-w-0">
                          <span className={`text-[8px] font-bold px-1 rounded-xs mr-1.5 ${
                            item.type === 'Kuis' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-violet-50 text-violet-700 border border-violet-100'
                          }`}>
                            {item.type}
                          </span>
                          <span className="font-semibold text-slate-700 truncate">{item.title}</span>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{item.date}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          item.score !== null
                            ? item.score >= 75
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {item.score !== null ? `${item.score}/100` : '-'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => onNavigate('academia')}
                className="w-full mt-4 text-center text-[10px] font-bold text-blue-600 hover:text-blue-700 block cursor-pointer"
              >
                Input / Ubah Nilai Akademik
              </button>
            </div>
          </>
        ) : (
          /* COLLECTIVE CLASS FOCUS WIDGETS */
          <>
            {/* Widget 1: Leaderboards Block */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-800">4. Honor Roll: Leaderboard Kelas</h4>
                  <p className="text-[10px] text-slate-400">Daftar siswa dengan pencapaian nilai tertinggi kuis & ulangan</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {/* Leaderboard Kuis */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider block w-max mb-1">
                      🏆 Leaderboard Kuis
                    </span>
                    <div className="space-y-1.5">
                      {topQuizPerformers.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic py-4 text-center">Belum ada nilai kuis.</p>
                      ) : (
                        topQuizPerformers.map((student, idx) => (
                          <div key={student.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100/60 rounded-lg text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-amber-600 font-mono text-[10px] w-3 shrink-0">#{idx+1}</span>
                              <span className="font-semibold text-slate-700 truncate">{student.name}</span>
                            </div>
                            <span className="font-bold text-amber-700 font-mono text-[10px] shrink-0">{student.quizScore} Pts</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Leaderboard Ulangan */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100 uppercase tracking-wider block w-max mb-1">
                      🏆 Leaderboard Ulangan
                    </span>
                    <div className="space-y-1.5">
                      {topExamPerformers.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic py-4 text-center">Belum ada nilai ulangan.</p>
                      ) : (
                        topExamPerformers.map((student, idx) => (
                          <div key={student.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100/60 rounded-lg text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-violet-600 font-mono text-[10px] w-3 shrink-0">#{idx+1}</span>
                              <span className="font-semibold text-slate-700 truncate">{student.name}</span>
                            </div>
                            <span className="font-bold text-violet-700 font-mono text-[10px] shrink-0">{student.examScore} Pts</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('academia')}
                className="mt-4 text-center text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                Buka Lembar Nilai Akademik <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Widget 2: Academic Insights Block */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-800">5. Evaluasi Nilai Akademik Kelas</h4>
                  <p className="text-[10px] text-slate-400">Ringkasan perbandingan rata-rata tipe nilai kelas</p>
                </div>
                
                <div className="space-y-4 mt-6">
                  {/* Formative vs Sumative breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Rata-Rata Kuis (Formatif)</span>
                      <span className="text-2xl font-black text-amber-700 font-mono mt-2 block">{avgQuizScore || '-'}</span>
                      <p className="text-[9px] text-slate-400 mt-2">Berdasarkan {quizColumns.length} kuis aktif</p>
                    </div>
                    <div className="bg-violet-50/30 border border-violet-100 p-4 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Rata-Rata Ujian (Sumatif)</span>
                      <span className="text-2xl font-black text-violet-700 font-mono mt-2 block">{avgExamScore || '-'}</span>
                      <p className="text-[9px] text-slate-400 mt-2">Berdasarkan {examColumns.length} ujian aktif</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-500 leading-normal">
                    💡 <strong>Tips Sensei:</strong> Nilai kuis menggambarkan pemahaman berkala (formatif), sementara nilai ujian mengukur hasil akhir topik (sumatif). KKM kelulusan adalah <strong>75</strong>.
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
          </>
        )}

      </div>
    </div>
  );
}
