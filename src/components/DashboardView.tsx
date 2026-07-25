import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord, GradeColumn } from '../types';
import {
  Users,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Printer,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  FileSpreadsheet,
  Award,
  BookMarked
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
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';

const CustomTooltip = ({ active, payload, label, unit = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/60 p-3 rounded-lg shadow-xl text-white text-xs z-50">
        <p className="font-bold mb-1.5 text-slate-300 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((pld: any, idx: number) => {
          const isPercentage = pld.name?.includes('Kehadiran') || 
                               pld.name?.includes('Pagi') || 
                               pld.name?.includes('Sesi Kelas') || 
                               pld.name?.includes('Presensi') ||
                               unit === '%';
          return (
            <div key={pld.name || pld.dataKey || idx} className="flex items-center gap-2 mt-1">
              <span 
                className="h-2 w-2 rounded-full shrink-0" 
                style={{ backgroundColor: pld.color || pld.fill }}
              ></span>
              <span className="text-slate-300">
                {pld.name || pld.dataKey}: <strong className="text-white font-mono">{pld.value}{isPercentage ? '%' : ''}</strong>
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

type DateRangeOption = '7d' | '30d' | 'month' | 'all';

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

  // State for Date Range Filter
  const [dateRange, setDateRange] = useState<DateRangeOption>('7d');

  // Filter attendance data by dateRange
  const filteredAttendance = useMemo(() => {
    if (!attendance || attendance.length === 0) return [];
    if (dateRange === 'all') return attendance;

    const sortedDates = Array.from(new Set(attendance.map(a => a.date))).sort();
    if (dateRange === '7d') {
      const targetDates = new Set(sortedDates.slice(-7));
      return attendance.filter(a => targetDates.has(a.date));
    }
    if (dateRange === '30d') {
      const targetDates = new Set(sortedDates.slice(-30));
      return attendance.filter(a => targetDates.has(a.date));
    }
    if (dateRange === 'month') {
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return attendance.filter(a => a.date.startsWith(currentYearMonth));
    }
    return attendance;
  }, [attendance, dateRange]);

  // Filter grades data by dateRange
  const filteredGrades = useMemo(() => {
    if (!grades || grades.length === 0) return [];
    if (dateRange === 'all') return grades;

    const now = new Date();
    if (dateRange === 'month') {
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return grades.filter(g => g.date.startsWith(currentYearMonth));
    }
    if (dateRange === '7d' || dateRange === '30d') {
      const limitDays = dateRange === '7d' ? 7 : 30;
      const dates = Array.from(new Set(grades.map(g => g.date))).sort();
      const targetDates = new Set(dates.slice(-limitDays));
      return grades.filter(g => targetDates.has(g.date));
    }
    return grades;
  }, [grades, dateRange]);

  // Memoized Base Calculations
  const {
    totalStudentsCount,
    activeStudents,
    activeStudentsCount,
    avgAttendanceRate,
    avgQuizScore,
    avgExamScore,
    studentQuizAverages,
    studentExamAverages,
    atRiskStudents,
    atRiskCount,
    atRiskPercentage,
    quizColumns,
    examColumns
  } = useMemo(() => {
    const totalCount = students.length;
    const active = students.filter(s => s.status === 'Active');
    const activeCount = active.length;

    // Attendance Rate
    const avgAttendance = active.length 
      ? Math.round((active.reduce((acc, s) => acc + s.attendanceRate, 0) / active.length) * 100)
      : 0;

    // Quiz Columns & Average
    const quizCols = filteredGrades.filter(g => g.type === 'Kuis');
    let totalQuizScore = 0;
    let totalQuizCount = 0;
    quizCols.forEach(g => {
      g.scores?.forEach(s => {
        if (s.score !== null && s.score !== undefined) {
          totalQuizScore += s.score;
          totalQuizCount++;
        }
      });
    });
    const avgQuiz = totalQuizCount ? parseFloat((totalQuizScore / totalQuizCount).toFixed(1)) : 0;

    // Exam Columns & Average
    const examCols = filteredGrades.filter(g => g.type === 'Ulangan');
    let totalExamScore = 0;
    let totalExamCount = 0;
    examCols.forEach(g => {
      g.scores?.forEach(s => {
        if (s.score !== null && s.score !== undefined) {
          totalExamScore += s.score;
          totalExamCount++;
        }
      });
    });
    const avgExam = totalExamCount ? parseFloat((totalExamScore / totalExamCount).toFixed(1)) : 0;

    // Individual Student Quiz Averages
    const quizAvgs = active.map(student => {
      let sum = 0;
      let count = 0;
      quizCols.forEach(g => {
        const match = g.scores?.find(s => s.studentId === student.id);
        if (match && match.score !== null && match.score !== undefined) {
          sum += match.score;
          count++;
        }
      });
      return count ? sum / count : null;
    });

    // Individual Student Exam Averages
    const examAvgs = active.map(student => {
      let sum = 0;
      let count = 0;
      examCols.forEach(g => {
        const match = g.scores?.find(s => s.studentId === student.id);
        if (match && match.score !== null && match.score !== undefined) {
          sum += match.score;
          count++;
        }
      });
      return count ? sum / count : null;
    });

    // At Risk Students (<82% attendance or quiz avg < 75)
    const atRisk = active.filter((s, idx) => {
      const avgQ = quizAvgs[idx];
      return s.attendanceRate < 0.82 || (avgQ !== null && avgQ < 75);
    });

    const atRiskPct = activeCount > 0 ? Math.round((atRisk.length / activeCount) * 100) : 0;

    return {
      totalStudentsCount: totalCount,
      activeStudents: active,
      activeStudentsCount: activeCount,
      avgAttendanceRate: avgAttendance,
      avgQuizScore: avgQuiz,
      avgExamScore: avgExam,
      studentQuizAverages: quizAvgs,
      studentExamAverages: examAvgs,
      atRiskStudents: atRisk,
      atRiskCount: atRisk.length,
      atRiskPercentage: atRiskPct,
      quizColumns: quizCols,
      examColumns: examCols
    };
  }, [students, filteredAttendance, filteredGrades]);

  // Memoized Chart 1 Data: Attendance Trend Over Days
  const attendanceTrendData = useMemo(() => {
    if (!filteredAttendance || filteredAttendance.length === 0) {
      return [
        { day: 'Mon', attendance: 0, target: 95 },
        { day: 'Tue', attendance: 0, target: 95 },
        { day: 'Wed', attendance: 0, target: 95 },
        { day: 'Thu', attendance: 0, target: 95 },
        { day: 'Fri', attendance: 0, target: 95 }
      ];
    }

    const attendanceByDate: { [date: string]: { present: number; total: number } } = {};
    filteredAttendance.forEach(record => {
      const dateStr = record.date;
      if (!attendanceByDate[dateStr]) {
        attendanceByDate[dateStr] = { present: 0, total: 0 };
      }
      
      let presentWeight = 0;
      if (record.morning === 'Present') presentWeight += 1.0;
      else if (record.morning === 'Late') presentWeight += 0.5;

      if (record.classSession === 'Present') presentWeight += 1.0;
      else if (record.classSession === 'Late') presentWeight += 0.5;
      
      attendanceByDate[dateStr].present += presentWeight;
      attendanceByDate[dateStr].total += 2;
    });

    const sortedDates = Object.keys(attendanceByDate).sort();
    const targetLimit = dateRange === '7d' ? 7 : dateRange === '30d' ? 14 : 10;
    const lastDates = sortedDates.slice(-targetLimit);

    return lastDates.map(date => {
      const data = attendanceByDate[date];
      const rate = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
      
      let dayLabel = date;
      try {
        const parts = date.split('-');
        if (parts.length === 3) {
          const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          if (!isNaN(dateObj.getTime())) {
            dayLabel = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'numeric' });
          }
        }
      } catch (e) {}

      return {
        day: dayLabel,
        attendance: rate,
        target: 95
      };
    });
  }, [filteredAttendance, dateRange]);

  // Memoized Chart 2 & 3 Score Distribution
  const { quizScoreDistData, examScoreDistData } = useMemo(() => {
    const qDist = [
      { range: '90-100 (A)', students: studentQuizAverages.filter(avg => avg !== null && avg >= 90).length },
      { range: '80-89 (B)', students: studentQuizAverages.filter(avg => avg !== null && avg >= 80 && avg < 90).length },
      { range: '70-79 (C)', students: studentQuizAverages.filter(avg => avg !== null && avg >= 70 && avg < 80).length },
      { range: '<70 (D/Risk)', students: studentQuizAverages.filter(avg => avg !== null && avg < 70).length },
      { range: 'Belum Dinilai', students: studentQuizAverages.filter(avg => avg === null).length }
    ];

    const eDist = [
      { range: '90-100 (A)', students: studentExamAverages.filter(avg => avg !== null && avg >= 90).length },
      { range: '80-89 (B)', students: studentExamAverages.filter(avg => avg !== null && avg >= 80 && avg < 90).length },
      { range: '70-79 (C)', students: studentExamAverages.filter(avg => avg !== null && avg >= 70 && avg < 80).length },
      { range: '<70 (D/Risk)', students: studentExamAverages.filter(avg => avg !== null && avg < 70).length },
      { range: 'Belum Ujian', students: studentExamAverages.filter(avg => avg === null).length }
    ];

    return { quizScoreDistData: qDist, examScoreDistData: eDist };
  }, [studentQuizAverages, studentExamAverages]);

  // Memoized Top & Bottom Performers
  const {
    topQuizPerformers,
    bottomQuizPerformers,
    topExamPerformers,
    bottomExamPerformers
  } = useMemo(() => {
    const tQuiz = activeStudents
      .map((student, idx) => ({ student, avg: studentQuizAverages[idx] }))
      .filter(item => item.avg !== null)
      .sort((a, b) => (b.avg || 0) - (a.avg || 0))
      .slice(0, 5)
      .map(item => ({ ...item.student, quizScore: Math.round(item.avg || 0) }));

    const bQuiz = activeStudents
      .map((student, idx) => ({ student, avg: studentQuizAverages[idx] }))
      .filter(item => item.avg !== null && item.avg < 75)
      .sort((a, b) => (a.avg || 0) - (b.avg || 0))
      .slice(0, 5)
      .map(item => ({ ...item.student, quizScore: Math.round(item.avg || 0) }));

    const tExam = activeStudents
      .map((student, idx) => ({ student, avg: studentExamAverages[idx] }))
      .filter(item => item.avg !== null)
      .sort((a, b) => (b.avg || 0) - (a.avg || 0))
      .slice(0, 5)
      .map(item => ({ ...item.student, examScore: Math.round(item.avg || 0) }));

    const bExam = activeStudents
      .map((student, idx) => ({ student, avg: studentExamAverages[idx] }))
      .filter(item => item.avg !== null && item.avg < 75)
      .sort((a, b) => (a.avg || 0) - (b.avg || 0))
      .slice(0, 5)
      .map(item => ({ ...item.student, examScore: Math.round(item.avg || 0) }));

    return {
      topQuizPerformers: tQuiz,
      bottomQuizPerformers: bQuiz,
      topExamPerformers: tExam,
      bottomExamPerformers: bExam
    };
  }, [activeStudents, studentQuizAverages, studentExamAverages]);

  // Individual Focus Calculations
  const isIndividualFocus = selectedStudentId !== 'all';
  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  const studentIndex = useMemo(() => {
    return activeStudents.findIndex(s => s.id === selectedStudentId);
  }, [activeStudents, selectedStudentId]);

  const studentQuizAvg = studentIndex !== -1 ? studentQuizAverages[studentIndex] : null;
  const displayQuizAvg = studentQuizAvg !== null ? parseFloat(studentQuizAvg.toFixed(1)) : 0;

  const studentExamAvg = useMemo(() => {
    let sum = 0;
    let count = 0;
    examColumns.forEach(g => {
      const scoreObj = g.scores?.find(s => s.studentId === selectedStudentId);
      if (scoreObj && scoreObj.score !== null) {
        sum += scoreObj.score;
        count++;
      }
    });
    return count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
  }, [examColumns, selectedStudentId]);

  // Individual Attendance Trend Data
  const individualAttendanceData = useMemo(() => {
    if (!selectedStudentId || selectedStudentId === 'all') return [];
    const records = filteredAttendance
      .filter(r => r.studentId === selectedStudentId)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    const statusToVal = (status: string) => {
      if (status === 'Present') return 100;
      if (status === 'Late') return 50;
      return 0;
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
  }, [filteredAttendance, selectedStudentId]);

  // Individual Grades Compare Data
  const individualQuizCompareData = useMemo(() => {
    return quizColumns.map(g => {
      const match = g.scores?.find(s => s.studentId === selectedStudentId);
      const studentScore = match ? match.score : null;

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
  }, [quizColumns, selectedStudentId]);

  const individualExamCompareData = useMemo(() => {
    return examColumns.map(g => {
      const match = g.scores?.find(s => s.studentId === selectedStudentId);
      const studentScore = match ? match.score : null;

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
  }, [examColumns, selectedStudentId]);

  // Student Individual Grade History
  const studentGradesList = useMemo(() => {
    return filteredGrades.map(g => {
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
  }, [filteredGrades, selectedStudentId]);

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['ID Siswa', 'Nama Siswa', 'Status', 'Tingkat Presensi (%)', 'Rata-Rata Kuis', 'Rata-Rata Ulangan', 'Status KKM'];
    const rows = activeStudents.map((s, idx) => {
      const quizAvg = studentQuizAverages[idx];
      const examAvg = studentExamAverages[idx];
      const statusKkm = quizAvg === null ? 'Belum Ada Nilai' : quizAvg >= 75 ? 'LULUS' : 'REMEDIAL';
      return [
        s.id,
        `"${s.name.replace(/"/g, '""')}"`,
        s.status,
        Math.round(s.attendanceRate * 100),
        quizAvg !== null ? quizAvg.toFixed(1) : '-',
        examAvg !== null ? examAvg.toFixed(1) : '-',
        statusKkm
      ].join(',');
    });

    const csvString = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Dashboard_Report_UTB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Global Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Command & Operations Center</h2>
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
              <Sparkles className="h-3 w-3 text-blue-600" />
              Live Dashboard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dasbor ringkasan pusat untuk memantau presensi, perilaku, dan pencapaian akademik siswa UTB Banjar.
          </p>
        </div>

        {/* Global Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end shrink-0 select-none">
          
          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              aria-label="Pilih Rentang Waktu Data"
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="7d">📅 7 Hari Terakhir</option>
              <option value="30d">🗓️ 30 Hari Terakhir</option>
              <option value="month">📊 Bulan Ini</option>
              <option value="all">📁 Semua Data</option>
            </select>
          </div>

          {/* Student Focus Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedStudentId}
              onChange={(e) => onSelectedStudentChange(e.target.value)}
              aria-label="Pilih Fokus Analisis Siswa"
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer max-w-[190px] truncate"
            >
              <option value="all">📊 Seluruh Kelas (Kolektif)</option>
              <optgroup label="Daftar Siswa Aktif">
                {activeStudents.map(s => (
                  <option key={s.id} value={s.id}>👤 {s.name} ({s.id})</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick Action Buttons */}
          <button
            onClick={handleExportCSV}
            title="Unduh Laporan Format CSV/Excel"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-lg transition duration-200 cursor-pointer shadow-2xs no-print"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={onPrintClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition duration-200 cursor-pointer no-print"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak Report
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS WITH TREND/DELTA INDICATORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-grid">
        
        {/* KPI 1: Total Students / Student Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isIndividualFocus ? 'Status Trainee' : 'Total Siswa'}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {isIndividualFocus ? (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                    selectedStudent?.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {selectedStudent?.status === 'Active' ? '🟢 Aktif' : '🟡 Cuti'}
                  </span>
                ) : (
                  `${totalStudentsCount} Siswa`
                )}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {isIndividualFocus ? (
              <span className="text-slate-500">ID: <strong className="font-mono text-slate-700">{selectedStudent?.id}</strong></span>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <span>Aktif: <strong className="text-emerald-600">{activeStudentsCount}</strong></span>
                <span>•</span>
                <span>Cuti: <strong className="text-amber-600">{students.filter(s => s.status === 'Leave').length}</strong></span>
              </div>
            )}
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded">UTB Banjar</span>
          </div>
        </div>

        {/* KPI 2: Attendance Rate & Delta */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isIndividualFocus ? 'Presensi Trainee' : 'Rata Kehadiran'}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
                  {isIndividualFocus ? `${Math.round((selectedStudent?.attendanceRate || 0) * 100)}%` : `${avgAttendanceRate}%`}
                </h3>
              </div>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {isIndividualFocus ? (
              Math.round((selectedStudent?.attendanceRate || 0) * 100) >= 95 ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" /> Target Memenuhi (≥95%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                  <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" /> Di Bawah Target (&lt;95%)
                </span>
              )
            ) : (
              <div className="flex items-center gap-1.5">
                {avgAttendanceRate >= 95 ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> +{(avgAttendanceRate - 95).toFixed(0)}% vs Target (95%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    <TrendingDown className="h-3.5 w-3.5 text-rose-600" /> -{(95 - avgAttendanceRate).toFixed(0)}% dari Target (95%)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* KPI 3: Quiz Score Average & Delta */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isIndividualFocus ? 'Rerata Kuis Trainee' : 'Rata Nilai Kuis'}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                {isIndividualFocus ? (displayQuizAvg || '-') : (avgQuizScore || '-')}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {isIndividualFocus ? (
              <span className="text-slate-600">Rata Ulangan: <strong className="text-violet-700 font-mono font-bold">{studentExamAvg || '-'}</strong></span>
            ) : (
              <div className="flex items-center gap-1">
                {avgQuizScore >= 75 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" /> +{(avgQuizScore - 75).toFixed(1)} pts vs KKM (75)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" /> -{(75 - avgQuizScore).toFixed(1)} pts dari KKM
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* KPI 4: Students At Risk / Graduation Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isIndividualFocus ? 'Ketuntasan KKM' : 'Siswa At-Risk'}
              </p>
              <h3 className="text-2xl font-extrabold mt-1">
                {isIndividualFocus ? (
                  studentQuizAvg === null ? (
                    <span className="text-slate-400">Belum Dinilai</span>
                  ) : studentQuizAvg >= 75 ? (
                    <span className="text-emerald-600 font-bold">LULUS</span>
                  ) : (
                    <span className="text-rose-600 font-bold">REMEDIAL</span>
                  )
                ) : (
                  <span className={atRiskCount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                    {atRiskCount} Siswa
                  </span>
                )}
              </h3>
            </div>
            <div className={`p-2.5 rounded-lg shrink-0 ${
              isIndividualFocus 
                ? (studentQuizAvg !== null && studentQuizAvg < 75 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600')
                : (atRiskCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400')
            }`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {isIndividualFocus ? (
              <span className="text-slate-500">Batas KKM: <strong className="font-mono text-slate-700">75 Pts</strong></span>
            ) : (
              <span className={`font-bold px-2 py-0.5 rounded ${atRiskCount > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {atRiskCount > 0 ? `${atRiskPercentage}% dari total kelas` : '100% Kondisi Prima'}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* CHARTS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
          <h3 className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center gap-2 uppercase">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            {isIndividualFocus ? `Analisis Personal: ${selectedStudent?.name}` : 'Analisis Utama Performance Class'}
          </h3>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-semibold border border-slate-200">
            Recharts Filtered: {dateRange.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-layout">
          
          {/* Chart 1: Attendance Trend */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800">
                {isIndividualFocus ? '1. Log Presensi Trainee (Filter Rentang)' : '1. Tren Kehadiran Harian'}
              </h4>
              <p className="text-xs text-slate-400">
                {isIndividualFocus ? 'Status presensi pagi vs kelas (100%=Hadir, 50%=Telat, 0%=Absen)' : 'Rata-rata presensi harian kelas dibanding target 95%'}
              </p>
            </div>
            <div className="h-56">
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
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
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
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                    <Area type="monotone" dataKey="attendance" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#attendanceColor)" name="Kehadiran" />
                    <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="6 6" strokeWidth={2} name="Target (95%)" dot={false} activeDot={false} />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Quiz Score Distribution */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800">
                {isIndividualFocus ? '2. Nilai Kuis Trainee vs Rata Kelas' : '2. Distribusi Nilai Kuis Siswa'}
              </h4>
              <p className="text-xs text-slate-400">
                {isIndividualFocus ? 'Komparasi nilai kuis per materi terhadap rerata kelas' : 'Jumlah siswa aktif berdasarkan rentang nilai kuis'}
              </p>
            </div>
            <div className="h-56">
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
                    <XAxis dataKey="materi" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                    <Bar dataKey="Nilai Siswa" fill="url(#siswaColor)" name="Nilai Trainee" radius={[4, 4, 0, 0]} barSize={18} />
                    <Line type="monotone" dataKey="Rata-Rata Kelas" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" name="Rerata Kelas" dot={{ r: 3, stroke: '#94A3B8', strokeWidth: 1.5, fill: '#fff' }} />
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
                    <YAxis dataKey="range" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={90} stroke="#cbd5e1" />
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

          {/* Chart 3: Exam Score Distribution */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="mb-3">
              <h4 className="text-xs font-bold text-slate-800">
                {isIndividualFocus ? '3. Nilai Ulangan Trainee vs Rata Kelas' : '3. Distribusi Nilai Ulangan Siswa'}
              </h4>
              <p className="text-xs text-slate-400">
                {isIndividualFocus ? 'Komparasi nilai ulangan per materi terhadap rerata kelas' : 'Jumlah siswa aktif berdasarkan rentang nilai ulangan'}
              </p>
            </div>
            <div className="h-56">
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
                    <XAxis dataKey="materi" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                    <Bar dataKey="Nilai Siswa" fill="url(#siswaExamColor)" name="Nilai Trainee" radius={[4, 4, 0, 0]} barSize={18} />
                    <Line type="monotone" dataKey="Rata-Rata Kelas" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" name="Rerata Kelas" dot={{ r: 3, stroke: '#94A3B8', strokeWidth: 1.5, fill: '#fff' }} />
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
                    <YAxis dataKey="range" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={90} stroke="#cbd5e1" />
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
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-800">4. Analisis Kelayakan & Profil Trainee</h4>
                  <p className="text-xs text-slate-400">Pendeteksi otomatis status at-risk dan kelayakan kelulusan siswa</p>
                </div>
                
                <div className="space-y-3.5 mt-4">
                  {/* Student profile metadata */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs">{selectedStudent?.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedStudent?.id}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                      selectedStudent?.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {selectedStudent?.status === 'Active' ? 'Aktif' : 'Cuti'}
                    </span>
                  </div>

                  {/* Warning and alert block */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Catatan Performa Kritis</span>
                    {selectedStudent?.attendanceRate && selectedStudent.attendanceRate < 0.82 ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">⚠️ Kehadiran di Bawah Batas Kelulusan</p>
                          <p className="text-xs text-rose-600 mt-0.5">Tingkat presensi {Math.round(selectedStudent.attendanceRate * 100)}% berada di bawah target aman 82%.</p>
                        </div>
                      </div>
                    ) : null}

                    {studentQuizAvg !== null && studentQuizAvg < 75 ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">⚠️ Rata-Rata Kuis di Bawah KKM</p>
                          <p className="text-xs text-rose-600 mt-0.5">Rata kuis {displayQuizAvg} di bawah batas ketuntasan minimal (75).</p>
                        </div>
                      </div>
                    ) : null}

                    {(!selectedStudent?.attendanceRate || selectedStudent.attendanceRate >= 0.82) &&
                     (studentQuizAvg === null || studentQuizAvg >= 75) ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold">✅ Trainee Kondisi Prima</p>
                          <p className="text-xs text-emerald-600 mt-0.5">Seluruh presensi dan nilai KKM memenuhi standar kelulusan.</p>
                        </div>
                      </div>
                     ) : null}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => onNavigate('attendance')}
                  className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="h-3.5 w-3.5 text-blue-500" /> Presensi Detail
                </button>
                <button 
                  onClick={() => onNavigate('students')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  Profil & Edit Biodata <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Widget 2: Student Score History */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-800">5. Riwayat Nilai Trainee</h4>
                  <p className="text-xs text-slate-400">Daftar nilai kuis dan ulangan yang diperoleh trainee</p>
                </div>
                
                <div className="space-y-2 mt-4 max-h-[190px] overflow-y-auto custom-scrollbar">
                  {studentGradesList.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-xs font-bold">Belum ada kolom nilai 📊</p>
                      <p className="text-xs mt-0.5">Tidak ada data kuis atau ulangan yang tercatat.</p>
                    </div>
                  ) : (
                    studentGradesList.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg text-xs">
                        <div className="min-w-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs mr-1.5 ${
                            item.type === 'Kuis' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-violet-50 text-violet-700 border border-violet-200'
                          }`}>
                            {item.type}
                          </span>
                          <span className="font-semibold text-slate-700 truncate">{item.title}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{item.date}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                          item.score !== null
                            ? item.score >= 75
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
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
                className="w-full mt-4 text-center text-xs font-bold text-blue-600 hover:text-blue-700 block cursor-pointer border-t border-slate-100 pt-3"
              >
                Input / Ubah Nilai Akademik →
              </button>
            </div>
          </>
        ) : (
          /* COLLECTIVE CLASS FOCUS WIDGETS */
          <>
            {/* Widget 1: Leaderboards Block */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-800">4. Honor Roll: Leaderboard Kelas</h4>
                  <p className="text-xs text-slate-400">Daftar siswa pencapaian 5 teratas dan 5 terbawah kuis & ulangan</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3">
                  {/* Leaderboard Kuis */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider block w-max">
                      📝 Kategori Kuis
                    </span>
                    
                    {/* Top 5 Quiz */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        🏆 5 Teratas
                      </span>
                      {topQuizPerformers.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2 text-center">Belum ada nilai kuis.</p>
                      ) : (
                        topQuizPerformers.map((student, idx) => (
                          <div key={student.id} className="flex items-center justify-between p-1.5 bg-emerald-50/40 border border-emerald-100 rounded-lg text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-emerald-700 font-mono text-xs w-4 shrink-0">#{idx+1}</span>
                              <span className="font-semibold text-slate-700 truncate">{student.name}</span>
                            </div>
                            <span className="font-bold text-emerald-700 font-mono text-xs shrink-0">{student.quizScore} Pts</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bottom 5 Quiz */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        ⚠️ 5 Terbawah / Remedial
                      </span>
                      {bottomQuizPerformers.length === 0 ? (
                        <p className="text-xs text-emerald-700 bg-emerald-50/40 border border-emerald-100 p-2 rounded-lg text-center font-medium italic">
                          Luar biasa! Tidak ada siswa di bawah KKM.
                        </p>
                      ) : (
                        bottomQuizPerformers.map((student, idx) => (
                          <div key={student.id} className="flex items-center justify-between p-1.5 bg-rose-50/40 border border-rose-100 rounded-lg text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-rose-700 font-mono text-xs w-4 shrink-0">#{idx+1}</span>
                              <span className="font-semibold text-slate-700 truncate">{student.name}</span>
                            </div>
                            <span className="font-bold text-rose-700 font-mono text-xs shrink-0">{student.quizScore} Pts</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Leaderboard Ulangan */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200 uppercase tracking-wider block w-max">
                      🎓 Kategori Ulangan
                    </span>
                    
                    {/* Top 5 Exam */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        🏆 5 Teratas
                      </span>
                      {topExamPerformers.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2 text-center">Belum ada nilai ulangan.</p>
                      ) : (
                        topExamPerformers.map((student, idx) => (
                          <div key={student.id} className="flex items-center justify-between p-1.5 bg-emerald-50/40 border border-emerald-100 rounded-lg text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-emerald-700 font-mono text-xs w-4 shrink-0">#{idx+1}</span>
                              <span className="font-semibold text-slate-700 truncate">{student.name}</span>
                            </div>
                            <span className="font-bold text-emerald-700 font-mono text-xs shrink-0">{student.examScore} Pts</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bottom 5 Exam */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        ⚠️ 5 Terbawah / Remedial
                      </span>
                      {bottomExamPerformers.length === 0 ? (
                        <p className="text-xs text-emerald-700 bg-emerald-50/40 border border-emerald-100 p-2 rounded-lg text-center font-medium italic">
                          Luar biasa! Tidak ada siswa di bawah KKM.
                        </p>
                      ) : (
                        bottomExamPerformers.map((student, idx) => (
                          <div key={student.id} className="flex items-center justify-between p-1.5 bg-rose-50/40 border border-rose-100 rounded-lg text-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-rose-700 font-mono text-xs w-4 shrink-0">#{idx+1}</span>
                              <span className="font-semibold text-slate-700 truncate">{student.name}</span>
                            </div>
                            <span className="font-bold text-rose-700 font-mono text-xs shrink-0">{student.examScore} Pts</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onNavigate('academia')}
                className="mt-4 text-center text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 cursor-pointer border-t border-slate-100 pt-3"
              >
                Buka Lembar Nilai Akademik <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Widget 2: Academic Insights Block */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-800">5. Evaluasi Nilai Akademik Kelas</h4>
                  <p className="text-xs text-slate-400">Ringkasan perbandingan rata-rata tipe nilai kelas</p>
                </div>
                
                <div className="space-y-4 mt-5">
                  {/* Formative vs Sumative breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50/40 border border-amber-200 p-4 rounded-xl text-center">
                      <span className="text-xs text-slate-500 font-bold uppercase block">Rata Kuis (Formatif)</span>
                      <span className="text-2xl font-extrabold text-amber-700 font-mono mt-2 block">{avgQuizScore || '-'}</span>
                      <p className="text-xs text-slate-400 mt-1">Dari {quizColumns.length} kuis aktif</p>
                    </div>
                    <div className="bg-violet-50/40 border border-violet-200 p-4 rounded-xl text-center">
                      <span className="text-xs text-slate-500 font-bold uppercase block">Rata Ujian (Sumatif)</span>
                      <span className="text-2xl font-extrabold text-violet-700 font-mono mt-2 block">{avgExamScore || '-'}</span>
                      <p className="text-xs text-slate-400 mt-1">Dari {examColumns.length} ujian aktif</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg text-xs text-slate-600 leading-relaxed">
                    💡 <strong>Tips Sensei:</strong> Nilai kuis menggambarkan pemahaman berkala (formatif), sementara nilai ujian mengukur hasil akhir topik (sumatif). KKM kelulusan adalah <strong>75 Pts</strong>.
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => onNavigate('attendance')}
                  className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="h-3.5 w-3.5 text-emerald-500" /> Presensi Kelas
                </button>
                <button 
                  onClick={() => onNavigate('academia')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  Buka Analisis & Nilai Lengkap <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
