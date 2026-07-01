import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord, Assignment, GradeColumn } from '../types';
import {
  X,
  Printer,
  FileText,
  Check,
  Calendar,
  Users,
  Award,
  LayoutDashboard
} from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  grades: GradeColumn[];
  initialTab?: string;
}

export default function PrintReportModal({
  isOpen,
  onClose,
  students,
  attendance,
  assignments,
  grades,
  initialTab = 'dashboard'
}: PrintReportModalProps) {
  const [reportType, setReportType] = useState<string>(initialTab);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubtitle, setCustomSubtitle] = useState<string>('');
  const [includeSignature, setIncludeSignature] = useState<boolean>(true);
  const [colorTheme, setColorTheme] = useState<'slate' | 'blue' | 'green' | 'bw'>('blue');
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-16');

  // Sync default titles when report type changes
  useEffect(() => {
    switch (reportType) {
      case 'dashboard':
        setCustomTitle('Laporan Ringkasan Kinerja & Akademik');
        setCustomSubtitle('Ikhtisar Eksekutif Pusat Pelatihan UTB Banjar');
        break;
      case 'students':
        setCustomTitle('Laporan Direktori Data Siswa');
        setCustomSubtitle('Daftar Lengkap Profil dan Metrik Trainee Jepang');
        break;
      case 'attendance':
        setCustomTitle('Laporan Rekap Presensi & Kehadiran');
        setCustomSubtitle(`Laporan Kehadiran Kelas Harian - Tanggal ${selectedDate}`);
        break;
      case 'academia':
        setCustomTitle('Laporan Capaian Akademik & Tugas');
        setCustomSubtitle('Rekapitulasi Pengumpulan Tugas dan Nilai Kuis/Ulangan');
        break;
      default:
        setCustomTitle('Laporan Akademik');
        setCustomSubtitle('UTB Banjar Nihongo');
    }
  }, [reportType, selectedDate]);

  if (!isOpen) return null;

  // All students (single class - no cohort filter)
  const filteredStudents = students;
  const studentIds = filteredStudents.map(s => s.id);

  // Theme helper classes
  const getThemeColor = () => {
    switch (colorTheme) {
      case 'blue': return { text: 'text-blue-600', bg: 'bg-blue-600', border: 'border-blue-600', accent: 'bg-blue-50 text-blue-700 border-blue-100', textLight: 'text-blue-500' };
      case 'green': return { text: 'text-emerald-600', bg: 'bg-emerald-600', border: 'border-emerald-600', accent: 'bg-emerald-50 text-emerald-700 border-emerald-100', textLight: 'text-emerald-500' };
      case 'bw': return { text: 'text-slate-900', bg: 'bg-slate-900', border: 'border-slate-900', accent: 'bg-slate-100 text-slate-900 border-slate-300', textLight: 'text-slate-600' };
      default: return { text: 'text-slate-700', bg: 'bg-slate-700', border: 'border-slate-700', accent: 'bg-slate-50 text-slate-700 border-slate-200', textLight: 'text-slate-500' };
    }
  };

  const theme = getThemeColor();

  // Handle printing
  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Calculations for dashboard report
  const activeStudents = filteredStudents.filter(s => s.status === 'Active');
  const avgAttendance = activeStudents.length
    ? Math.round((activeStudents.reduce((acc, s) => acc + s.attendanceRate, 0) / activeStudents.length) * 100)
    : 0;

  const quizColumns = grades.filter(g => g.type === 'Kuis');
  let totalQuizScore = 0;
  let totalQuizCount = 0;
  quizColumns.forEach(g => {
    g.scores?.forEach(s => {
      if (studentIds.includes(s.studentId) && s.score !== null) {
        totalQuizScore += s.score;
        totalQuizCount++;
      }
    });
  });
  const avgQuiz = totalQuizCount ? Math.round(totalQuizScore / totalQuizCount) : 0;

  const examColumns = grades.filter(g => g.type === 'Ulangan');
  let totalExamScore = 0;
  let totalExamCount = 0;
  examColumns.forEach(g => {
    g.scores?.forEach(s => {
      if (studentIds.includes(s.studentId) && s.score !== null) {
        totalExamScore += s.score;
        totalExamCount++;
      }
    });
  });
  const avgExam = totalExamCount ? Math.round(totalExamScore / totalExamCount) : 0;

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

  const atRiskCount = activeStudents.filter((s, idx) => {
    const avgQuiz = studentQuizAverages[idx];
    return s.attendanceRate < 0.82 || (avgQuiz !== null && avgQuiz < 75);
  }).length;

  // Assignment submissions calculations
  let totalExpectedSubmissions = 0;
  let totalSubmittedCount = 0;
  assignments.forEach(a => {
    a.submissions?.forEach(sub => {
      if (studentIds.includes(sub.studentId)) {
        totalExpectedSubmissions++;
        if (sub.submitted) {
          totalSubmittedCount++;
        }
      }
    });
  });
  const submissionRate = totalExpectedSubmissions > 0
    ? Math.round((totalSubmittedCount / totalExpectedSubmissions) * 100)
    : 0;

  const topPerformers = activeStudents
    .map((student, idx) => {
      const avg = studentQuizAverages[idx];
      return { student, avg };
    })
    .filter(item => item.avg !== null)
    .sort((a, b) => (b.avg || 0) - (a.avg || 0))
    .slice(0, 5)
    .map(item => ({
      ...item.student,
      quizScore: Math.round(item.avg || 0)
    }));

  // Render components inside the Preview and Print View
  const renderDashboardReport = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Siswa</span>
          <strong className="text-lg text-slate-900 block mt-1">{filteredStudents.length} Orang</strong>
          <span className="text-[9px] text-slate-500">Aktif: {activeStudents.length} | Cuti: {filteredStudents.filter(s => s.status === 'Leave').length}</span>
        </div>
        <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Kehadiran Kelas</span>
          <strong className="text-lg text-slate-900 block mt-1">{avgAttendance}%</strong>
          <span className="text-[9px] text-red-500 font-semibold">Min Target: 95%</span>
        </div>
        <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Rata Nilai Kuis</span>
          <strong className="text-lg text-slate-900 block mt-1">{avgQuiz} Poin</strong>
          <span className="text-[9px] text-slate-500">Dari {quizColumns.length} kuis aktif</span>
        </div>
        <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Siswa At-Risk</span>
          <strong className={`text-lg block mt-1 ${atRiskCount > 0 ? 'text-red-600 font-bold' : 'text-slate-900'}`}>{atRiskCount} Siswa</strong>
          <span className="text-[9px] text-slate-500">Butuh Bimbingan</span>
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1 uppercase">Top Performing Trainees</h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold bg-slate-50">
              <th className="py-2 px-3">Nama Siswa</th>
              <th className="py-2 px-3">Nomor ID</th>
              <th className="py-2 px-3 text-center">Rata Nilai Kuis</th>
              <th className="py-2 px-3 text-center">Rata Presensi</th>
            </tr>
          </thead>
          <tbody>
            {topPerformers.map(st => (
              <tr key={st.id} className="border-b border-slate-100">
                <td className="py-2 px-3 font-semibold text-slate-800">{st.name}</td>
                <td className="py-2 px-3 font-mono">{st.id}</td>
                <td className="py-2 px-3 text-center font-bold text-green-700">{st.quizScore} Pts</td>
                <td className="py-2 px-3 text-center font-mono font-semibold">{Math.round(st.attendanceRate * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Academic & Assignment Summary */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
        <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
          <h4 className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">Rangkuman Kinerja Tugas</h4>
          <p className="text-slate-700">Tingkat Penyerahan Tugas: <strong className="text-emerald-700">{submissionRate}%</strong></p>
          <p className="text-[10px] text-slate-500 mt-1">Terisi {totalSubmittedCount} dari {totalExpectedSubmissions} total pengiriman berkas.</p>
        </div>
        <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
          <h4 className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">Evaluasi Rata-Rata Nilai</h4>
          <p className="text-slate-700">Rata-Rata Kuis (Formatif): <strong className="text-slate-800 font-mono font-bold">{avgQuiz} Pts</strong></p>
          <p className="text-slate-700 mt-0.5">Rata-Rata Ujian (Sumatif): <strong className="text-slate-800 font-mono font-bold">{avgExam} Pts</strong></p>
        </div>
      </div>
    </div>
  );

  const renderStudentsReport = () => (
    <div className="space-y-3">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold bg-slate-50">
            <th className="py-2 px-2 w-8 text-center">No</th>
            <th className="py-2 px-3">ID Siswa</th>
            <th className="py-2 px-3">Nama Lengkap</th>
            <th className="py-2 px-3 w-16 text-center">Gender</th>
            <th className="py-2 px-3 w-12 text-center">Umur</th>
            <th className="py-2 px-3 text-center">Presensi</th>
            <th className="py-2 px-3 text-center w-20">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((st, i) => (
            <tr key={st.id} className="border-b border-slate-100">
              <td className="py-2 px-2 text-center font-mono text-slate-400">{i + 1}</td>
              <td className="py-2 px-3 font-mono font-semibold">{st.id}</td>
              <td className="py-2 px-3 font-bold text-slate-850">{st.name}</td>
              <td className="py-2 px-3 text-center">{st.gender === 'Male' ? 'L' : 'P'}</td>
              <td className="py-2 px-3 text-center font-mono">{st.age} th</td>
              <td className="py-2 px-3 text-center font-mono font-semibold">{Math.round(st.attendanceRate * 100)}%</td>
              <td className="py-2 px-3 text-center">
                <span className={`text-[9px] font-bold px-1 py-0.5 rounded border uppercase ${
                  st.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                  st.status === 'Graduated' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  st.status === 'Leave' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {st.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAttendanceReport = () => {
    // Filter active students
    const activeCohortStudents = students.filter(s => s.status === 'Active');
    
    // Find attendance records for selected date
    const getStatus = (studentId: string, session: 'morning' | 'classSession') => {
      const rec = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
      return rec ? rec[session] : 'Present';
    };

    return (
      <div className="space-y-4">
        {/* Date Stamp */}
        <div className="bg-slate-50 p-3 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
          <div>
            <span>Tanggal Cetak Laporan Kehadiran: <strong>{selectedDate}</strong></span>
          </div>
        </div>

        {/* Attendance Table */}
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold bg-slate-50">
              <th className="py-2.5 px-2 w-8 text-center">No</th>
              <th className="py-2.5 px-3">Nama Siswa</th>
              <th className="py-2.5 px-3">ID Siswa</th>
              <th className="py-2.5 px-3 text-center">Sesi Pagi (08:30)</th>
              <th className="py-2.5 px-3 text-center">Sesi Siang (13:00)</th>
            </tr>
          </thead>
          <tbody>
            {activeCohortStudents.map((st, i) => {
              const morn = getStatus(st.id, 'morning');
              const clss = getStatus(st.id, 'classSession');

              const getStatusBadge = (status: string) => {
                switch (status) {
                  case 'Present': return 'text-green-700 bg-green-50 border-green-150';
                  case 'Late': return 'text-amber-700 bg-amber-50 border-amber-150';
                  case 'Sick': return 'text-blue-700 bg-blue-50 border-blue-150';
                  case 'Permission': return 'text-slate-700 bg-slate-100 border-slate-200';
                  case 'Absent': return 'text-red-700 bg-red-50 border-red-150';
                  default: return '';
                }
              };

              return (
                <tr key={st.id} className="border-b border-slate-100">
                  <td className="py-2.5 px-2 text-center font-mono text-slate-400">{i + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{st.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{st.id}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(morn)}`}>
                      {morn}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(clss)}`}>
                      {clss}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAcademiaReport = () => {
    const activeCohortStudents = students.filter(s => s.status === 'Active');
    const activeCohortAssignments = assignments;
    const activeCohortGrades = grades;

    return (
      <div className="space-y-6">
        {/* Assignments Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1 uppercase">Rekapitulasi Pengumpulan Tugas</h3>
          {activeCohortAssignments.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Belum ada kolom tugas yang tercatat.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold bg-slate-50">
                  <th className="py-2 px-2 w-8 text-center">No</th>
                  <th className="py-2 px-3">Nama Siswa</th>
                  {activeCohortAssignments.map(a => (
                    <th key={a.id} className="py-2 px-2 text-center text-[9px] w-24 truncate" title={a.title}>
                      {a.title.length > 15 ? a.title.slice(0, 12) + '...' : a.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeCohortStudents.map((st, i) => (
                  <tr key={st.id} className="border-b border-slate-100">
                    <td className="py-2 px-2 text-center font-mono text-slate-400">{i + 1}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{st.name}</td>
                    {activeCohortAssignments.map(a => {
                      const sub = a.submissions?.find(s => s.studentId === st.id);
                      const isSub = sub?.submitted;
                      return (
                        <td key={a.id} className="py-2 px-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isSub ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                            {isSub ? 'Kumpul' : 'Belum'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Grades Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1 uppercase">Rekapitulasi Nilai Ujian & Kuis</h3>
          {activeCohortGrades.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Belum ada kolom nilai yang tercatat.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold bg-slate-50">
                  <th className="py-2 px-2 w-8 text-center">No</th>
                  <th className="py-2 px-3">Nama Siswa</th>
                  {activeCohortGrades.map(g => (
                    <th key={g.id} className="py-2 px-2 text-center text-[9px] w-24 truncate" title={`[${g.type}] ${g.title}`}>
                      <span className="block text-[8px] font-mono text-slate-400">{g.type}</span>
                      {g.title.length > 12 ? g.title.slice(0, 10) + '...' : g.title}
                    </th>
                  ))}
                  <th className="py-2 px-2 text-center w-16 bg-slate-100 font-bold text-slate-700">Rata-Rata</th>
                </tr>
              </thead>
              <tbody>
                {activeCohortStudents.map((st, i) => {
                  let sum = 0;
                  let count = 0;

                  return (
                    <tr key={st.id} className="border-b border-slate-100">
                      <td className="py-2 px-2 text-center font-mono text-slate-400">{i + 1}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{st.name}</td>
                      {activeCohortGrades.map(g => {
                        const scoreObj = g.scores?.find(s => s.studentId === st.id);
                        const score = scoreObj?.score;
                        const isUnderKKM = score !== undefined && score !== null && score < 75;
                        if (score !== undefined && score !== null) {
                          sum += score;
                          count++;
                        }

                        return (
                          <td key={g.id} className={`py-2 px-2 text-center font-mono font-medium ${isUnderKKM ? 'text-red-650 font-bold bg-red-50/50' : ''}`}>
                            {score !== undefined && score !== null ? score : '-'}
                          </td>
                        );
                      })}
                      <td className={`py-2 px-2 text-center font-mono font-bold bg-slate-50 ${count > 0 && Math.round(sum / count) < 75 ? 'text-red-650 font-black bg-red-50/30' : 'text-slate-900'}`}>
                        {count > 0 ? Math.round(sum / count) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  const renderActiveReport = () => {
    switch (reportType) {
      case 'dashboard': return renderDashboardReport();
      case 'students': return renderStudentsReport();
      case 'attendance': return renderAttendanceReport();
      case 'academia': return renderAcademiaReport();
      default: return null;
    }
  };

  return (
    <>
      {/* Modal Dialog Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print">
        <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden border border-slate-200">
          
          {/* Modal Header */}
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center select-none shrink-0">
            <div className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-blue-600 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wide">
                  Cetak & Ekspor Report Dashboard
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Pengaturan cetak dokumen dan data akademika UTB Banjar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-450 hover:text-slate-700 hover:bg-slate-200 p-1 rounded-md transition cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Modal Body Container */}
          <div className="flex-1 flex min-h-0">
            
            {/* Left Config Panel */}
            <div className="w-80 border-r border-slate-200 p-5 overflow-y-auto space-y-5 select-none bg-slate-50/40 shrink-0">
              
              {/* Type Select */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jenis Laporan</label>
                <div className="space-y-1">
                  {[
                    { id: 'dashboard', label: 'Ringkasan Dashboard', icon: LayoutDashboard },
                    { id: 'students', label: 'Direktori Data Siswa', icon: Users },
                    { id: 'attendance', label: 'Rekap Presensi & Kehadiran', icon: Calendar },
                    { id: 'academia', label: 'Tugas & Nilai Akademik', icon: Award }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setReportType(tab.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                          reportType === tab.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/50'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Selector for Attendance */}
              {reportType === 'attendance' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Laporan Kehadiran</label>
                  <input
                    type="date"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              )}

              {/* Custom Titles */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kustomisasi Dokumen</h4>
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Judul Dokumen</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Sub-Judul / Catatan Kaki</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500"
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilihan Tambahan</h4>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                  />
                  <span>Sertakan Tanda Tangan</span>
                </label>
              </div>

              {/* Color Themes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tema Aksen Warna Cetak</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'slate', name: 'Slate', color: 'bg-slate-600' },
                    { id: 'blue', name: 'Cobalt', color: 'bg-blue-600' },
                    { id: 'green', name: 'Emerald', color: 'bg-emerald-600' },
                    { id: 'bw', name: 'B&W', color: 'bg-slate-900 border border-slate-300' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setColorTheme(t.id as any)}
                      title={t.name}
                      className={`h-7 rounded-md flex items-center justify-center text-[10px] font-semibold transition-all relative cursor-pointer ${t.color} ${
                        colorTheme === t.id ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : 'hover:opacity-90'
                      }`}
                    >
                      {colorTheme === t.id && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Live Preview Area */}
            <div className="flex-1 bg-slate-700 p-8 overflow-y-auto flex justify-center">
              
              {/* Paper Layout (Scaled representation of A4) */}
              <div className="w-[800px] min-h-[1050px] bg-white shadow-2xl p-10 flex flex-col justify-between text-slate-900 relative rounded-sm">
                
                <div>
                  {/* Print Document Header */}
                  <div className="flex justify-between items-start border-b-2 pb-4 mb-6 border-slate-800" style={{ borderColor: colorTheme === 'bw' ? '#111827' : theme.bg.replace('bg-', '') }}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OFFICIAL REPORT SUMMARY</span>
                      <h2 className="text-xl font-extrabold text-slate-900 uppercase mt-0.5 tracking-tight">UTB BANJAR NIHONGO</h2>
                      <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Japanese Trainee Academic & Performance Management System</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 block">Tanggal Cetak: 16-06-2026</span>
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Oleh: Sensei Pengajar</span>
                    </div>
                  </div>

                  {/* Document Subject Area */}
                  <div className="mb-6">
                    <h1 className="text-lg font-bold text-slate-900">{customTitle || 'Laporan Kinerja Akademika'}</h1>
                    <p className="text-xs text-slate-500 mt-0.5">{customSubtitle || 'Ringkasan operasional dan kedisiplinan trainee'}</p>
                  </div>

                  {/* Active Report Formatted content */}
                  {renderActiveReport()}

                </div>

                {/* Print Document Footer */}
                <div className="mt-12">
                  {includeSignature && (
                    <div className="grid grid-cols-2 gap-12 text-center text-xs mt-8 pb-8">
                      <div className="space-y-14">
                        <p className="text-slate-500">Sensei Pengajar / Pemeriksa</p>
                        <div className="border-t border-slate-350 w-44 mx-auto pt-1 font-semibold text-slate-800">
                          ( ............................................ )
                        </div>
                      </div>
                      <div className="space-y-14">
                        <p className="text-slate-500">Pimpinan / Kepala Cabang UTB</p>
                        <div className="border-t border-slate-350 w-44 mx-auto pt-1 font-semibold text-slate-800">
                          ( ............................................ )
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                    <span>Dokumen ini dihasilkan secara otomatis oleh Sistem Manajemen Akademik UTB Banjar Nihongo.</span>
                    <span>Halaman 1 dari 1</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5 shrink-0 select-none no-print">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-250 rounded-lg text-xs font-bold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-4.5 w-4.5" />
              Cetak Sekarang
            </button>
          </div>

        </div>
      </div>

      {/* ====================================================================== */}
      {/* PRINT AREA: THIS CONTENT ONLY SHOWS ON PAPER PRINT (HIDDEN ON BROWSER SCREEN) */}
      {/* ====================================================================== */}
      <div id="print-area" className="hidden print:block w-full bg-white p-6 font-sans text-slate-900 leading-normal">
        {/* Document Header banner */}
        <div className="flex justify-between items-start border-b-2 pb-3 mb-6 border-slate-800" style={{ borderColor: colorTheme === 'bw' ? '#000000' : theme.bg.replace('bg-', '') }}>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">OFFICIAL ACADEMIC REPORT RECORD</span>
            <h2 className="text-xl font-black text-slate-950 uppercase mt-0.5 tracking-tight">UTB BANJAR NIHONGO</h2>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">Japanese Trainee Academic & Performance Management System</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-mono text-slate-600 block">Tanggal: 16-06-2026</span>
            <span className="text-[9px] font-mono text-slate-600 block">Oleh: Sensei Pengajar</span>
          </div>
        </div>

        {/* Title Block */}
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-900 border-l-4 pl-3 py-0.5" style={{ borderLeftColor: colorTheme === 'bw' ? '#000000' : theme.bg.replace('bg-', '') }}>
            {customTitle || 'Laporan Kinerja Akademika'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 pl-4">{customSubtitle || 'Ringkasan operasional dan kedisiplinan trainee'}</p>
        </div>

        {/* Printable Data Content */}
        <div className="print-content-wrapper">
          {renderActiveReport()}
        </div>

        {/* Signature Box Section */}
        {includeSignature && (
          <div className="grid grid-cols-2 gap-12 text-center text-xs mt-12 pt-8 page-break-inside-avoid">
            <div className="space-y-12">
              <p className="text-slate-500">Sensei Pengajar / Pemeriksa</p>
              <div className="border-t border-slate-350 w-44 mx-auto pt-1 font-semibold text-slate-800">
                ( ............................................ )
              </div>
            </div>
            <div className="space-y-12">
              <p className="text-slate-500">Pimpinan / Kepala Cabang UTB</p>
              <div className="border-t border-slate-350 w-44 mx-auto pt-1 font-semibold text-slate-800">
                ( ............................................ )
              </div>
            </div>
          </div>
        )}

        {/* Document Footer stamp */}
        <div className="border-t border-slate-200 mt-12 pt-3 flex justify-between items-center text-[8px] text-slate-400 font-mono page-break-inside-avoid">
          <span>Dokumen ini dihasilkan secara otomatis oleh Sistem Manajemen Akademik UTB Banjar Nihongo.</span>
          <span>Sistem Cetak Secure v2.0</span>
        </div>
      </div>
    </>
  );
}
