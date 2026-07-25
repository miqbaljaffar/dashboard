import React, { useState, useEffect, useMemo } from 'react';
import { Student, AttendanceRecord, GradeColumn } from '../types';
import {
  X,
  Printer,
  FileText,
  Check,
  Calendar,
  Users,
  Award,
  LayoutDashboard,
  FileSpreadsheet,
  PenTool,
  Info,
  Sparkles
} from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  attendance: AttendanceRecord[];
  grades: GradeColumn[];
  initialTab?: string;
  selectedStudentId?: string;
}

export default function PrintReportModal({
  isOpen,
  onClose,
  students,
  attendance,
  grades,
  initialTab = 'dashboard',
  selectedStudentId = 'all'
}: PrintReportModalProps) {
  const [reportType, setReportType] = useState<string>(initialTab);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubtitle, setCustomSubtitle] = useState<string>('');
  const [includeSignature, setIncludeSignature] = useState<boolean>(true);
  const [colorTheme, setColorTheme] = useState<'slate' | 'blue' | 'green' | 'bw'>('blue');
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-16');

  // Custom Signatory Names
  const [teacherName, setTeacherName] = useState<string>('Sensei Pengajar');
  const [headmasterName, setHeadmasterName] = useState<string>('Pimpinan UTB Banjar');

  // Academic Grade Type Print Filter
  const [academiaTypeFilter, setAcademiaTypeFilter] = useState<'all' | 'Kuis' | 'Ulangan'>('all');

  // Dynamic Current Date Formatting (Indonesian Locale)
  const currentDateFormatted = useMemo(() => {
    try {
      return new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }, []);

  // Sync default titles when report type changes
  useEffect(() => {
    switch (reportType) {
      case 'dashboard':
        setCustomTitle('Laporan Ringkasan Kinerja & Akademik');
        setCustomSubtitle('Ikhtisar Eksekutif Pusat Pelatihan UTB Banjar');
        break;
      case 'students':
        setCustomTitle('Laporan Direktori Data Siswa');
        setCustomSubtitle('Daftar Lengkap Profil dan Metrik Trainee UTB Banjar');
        break;
      case 'attendance':
        setCustomTitle('Laporan Rekap Presensi & Kehadiran');
        setCustomSubtitle(`Laporan Kehadiran Kelas Harian - Tanggal ${selectedDate}`);
        break;
      case 'academia':
        setCustomTitle('Laporan Capaian Akademik');
        setCustomSubtitle('Rekapitulasi Nilai Kuis dan Ulangan');
        break;
      default:
        setCustomTitle('Laporan Akademik');
        setCustomSubtitle('UTB Banjar Nihongo');
    }
  }, [reportType, selectedDate]);

  // Printable Grade Columns for Academic Report
  const printableGrades = useMemo(() => {
    if (academiaTypeFilter === 'all') return grades;
    return grades.filter(g => g.type === academiaTypeFilter);
  }, [grades, academiaTypeFilter]);

  if (!isOpen) return null;

  // All active students (single class)
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

  // Student Quiz Averages
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
    const avgQ = studentQuizAverages[idx];
    return s.attendanceRate < 0.82 || (avgQ !== null && avgQ < 75);
  }).length;

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

  const isIndividualFocus = selectedStudentId !== undefined && selectedStudentId !== 'all';
  const selectedStudent = students.find(s => s.id === selectedStudentId);



  // Render Dashboard Summary Report
  const renderDashboardReport = () => {
    if (isIndividualFocus && selectedStudent) {
      const studentIndex = activeStudents.findIndex(s => s.id === selectedStudentId);
      const studentQuizAvg = studentIndex !== -1 ? studentQuizAverages[studentIndex] : null;
      const displayQuizAvg = studentQuizAvg !== null ? Math.round(studentQuizAvg) : 0;

      let studentExamSum = 0;
      let studentExamCount = 0;
      examColumns.forEach(g => {
        const scoreObj = g.scores?.find(s => s.studentId === selectedStudentId);
        if (scoreObj && scoreObj.score !== null) {
          studentExamSum += scoreObj.score;
          studentExamCount++;
        }
      });

      return (
        <div className="space-y-6">
          {/* Header Profil Siswa */}
          <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Laporan Hasil Belajar Individual Trainee</h3>
              <p className="text-xs text-slate-700 mt-1">Nama: <strong className="text-slate-900">{selectedStudent.name}</strong> (ID: {selectedStudent.id})</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Status: {selectedStudent.status === 'Active' ? 'Aktif' : 'Cuti'}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-md border ${
                displayQuizAvg >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {displayQuizAvg >= 75 ? '✅ KKM TUNTAS (LULUS)' : '⚠️ KKM REMEDIAL'}
              </span>
            </div>
          </div>

          {/* KPI Individual */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-slate-200 p-3 rounded-xl bg-white text-center">
              <span className="text-xs uppercase font-bold text-slate-400 block">Presensi Kehadiran</span>
              <strong className="text-xl text-slate-900 block font-mono mt-1">{Math.round(selectedStudent.attendanceRate * 100)}%</strong>
              <span className={`text-xs font-bold block mt-1 ${Math.round(selectedStudent.attendanceRate * 100) >= 95 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {Math.round(selectedStudent.attendanceRate * 100) >= 95 ? 'Memenuhi Target (≥95%)' : 'Di Bawah Target (<95%)'}
              </span>
            </div>
            <div className="border border-slate-200 p-3 rounded-xl bg-white text-center">
              <span className="text-xs uppercase font-bold text-slate-400 block">Rata-Rata Kuis (Formatif)</span>
              <strong className="text-xl text-slate-900 block font-mono mt-1">{displayQuizAvg} Pts</strong>
              <span className={`text-xs font-bold block mt-1 ${displayQuizAvg >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                KKM Kelulusan: 75
              </span>
            </div>
            <div className="border border-slate-200 p-3 rounded-xl bg-white text-center">
              <span className="text-xs uppercase font-bold text-slate-400 block">Skor Perilaku (Behavior)</span>
              <strong className="text-xl text-slate-900 block font-mono mt-1">{selectedStudent.behaviorScore} Pts</strong>
              <span className="text-xs text-slate-500 font-semibold block mt-1">Pelanggaran: {selectedStudent.violationsCount} kasus</span>
            </div>
          </div>

          {/* Rincian Nilai Komparatif */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase tracking-wider">Rincian Nilai per Materi & Komparasi Kelas</h4>
            <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-xs bg-slate-50">
                  <th className="py-2.5 px-3">Nama Materi / Kolom Nilai</th>
                  <th className="py-2.5 px-2 text-center w-24">Tipe</th>
                  <th className="py-2.5 px-2 text-center w-24">Rata Kelas</th>
                  <th className="py-2.5 px-2 text-center w-24">Nilai Trainee</th>
                  <th className="py-2.5 px-2 text-center w-28">Status KKM</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(g => {
                  const match = g.scores?.find(s => s.studentId === selectedStudentId);
                  const score = match ? match.score : null;

                  let sum = 0;
                  let count = 0;
                  g.scores?.forEach(s => {
                    if (s.score !== null) {
                      sum += s.score;
                      count++;
                    }
                  });
                  const classAvg = count > 0 ? Math.round(sum / count) : 0;
                  const isUnderKKM = score !== null && score < 75;

                  return (
                    <tr key={g.id} className="border-b border-slate-100">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{g.title}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-xs">{g.type}</td>
                      <td className="py-2.5 px-2 text-center text-slate-600 font-mono font-medium">{classAvg}</td>
                      <td className={`py-2.5 px-2 text-center font-mono font-bold ${
                        isUnderKKM ? 'text-rose-700 bg-rose-50/50' : 'text-slate-900'
                      }`}>
                        {score !== null ? score : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold">
                        {score === null ? (
                          <span className="text-slate-400 font-medium italic text-xs">Belum Dinilai</span>
                        ) : score >= 75 ? (
                          <span className="text-emerald-700 text-xs">TUNTAS</span>
                        ) : (
                          <span className="text-rose-700 text-xs">REMEDIAL</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50">
            <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Total Siswa</span>
            <strong className="text-xl text-slate-900 block font-mono mt-1">{filteredStudents.length} Orang</strong>
            <span className="text-xs text-slate-500">Aktif: {activeStudents.length} | Cuti: {filteredStudents.filter(s => s.status === 'Leave').length}</span>
          </div>
          <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50">
            <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Kehadiran Kelas</span>
            <strong className="text-xl text-slate-900 block font-mono mt-1">{avgAttendance}%</strong>
            <span className="text-xs text-slate-500 font-semibold">Target Min: 95%</span>
          </div>
          <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50">
            <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Rata Nilai Kuis</span>
            <strong className="text-xl text-slate-900 block font-mono mt-1">{avgQuiz} Pts</strong>
            <span className="text-xs text-slate-500">Dari {quizColumns.length} kuis aktif</span>
          </div>
          <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50">
            <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Siswa At-Risk</span>
            <strong className={`text-xl block font-mono mt-1 ${atRiskCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-900'}`}>{atRiskCount} Siswa</strong>
            <span className="text-xs text-slate-500">Butuh Bimbingan</span>
          </div>
        </div>

        {/* Top Performers Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5 uppercase tracking-wider">Top Performing Trainees</h3>
          <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-bold bg-slate-50">
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3">Nomor ID</th>
                <th className="py-2.5 px-3 text-center">Rata Nilai Kuis</th>
                <th className="py-2.5 px-3 text-center">Rata Presensi</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map(st => (
                <tr key={st.id} className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{st.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{st.id}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-700 font-mono">{st.quizScore} Pts</td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold">{Math.round(st.attendanceRate * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Academic & Discipline Summary */}
        <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
          <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/60">
            <h4 className="text-xs uppercase font-bold text-slate-500 block mb-1.5 tracking-wider">Rangkuman Kedisiplinan & Perilaku</h4>
            <p className="text-slate-700">Rata-Rata Perilaku: <strong className="text-emerald-700 font-mono font-extrabold">{activeStudents.length ? Math.round(activeStudents.reduce((acc, s) => acc + s.behaviorScore, 0) / activeStudents.length) : 0} Pts</strong></p>
            <p className="text-xs text-slate-500 mt-1">Total pelanggaran: {activeStudents.reduce((acc, s) => acc + s.violationsCount, 0)} kasus tercatat.</p>
          </div>
          <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/60">
            <h4 className="text-xs uppercase font-bold text-slate-500 block mb-1.5 tracking-wider">Evaluasi Rata-Rata Nilai</h4>
            <p className="text-slate-700">Rata-Rata Kuis (Formatif): <strong className="text-slate-900 font-mono font-bold">{avgQuiz} Pts</strong></p>
            <p className="text-slate-700 mt-1">Rata-Rata Ujian (Sumatif): <strong className="text-slate-900 font-mono font-bold">{avgExam} Pts</strong></p>
          </div>
        </div>
      </div>
    );
  };

  // Render Students Directory Report
  const renderStudentsReport = () => (
    <div className="space-y-3">
      <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-bold bg-slate-50">
            <th className="py-2.5 px-3 w-10 text-center">No</th>
            <th className="py-2.5 px-3">ID Siswa</th>
            <th className="py-2.5 px-3">Nama Lengkap</th>
            <th className="py-2.5 px-3 w-16 text-center">Gender</th>
            <th className="py-2.5 px-3 w-16 text-center">Umur</th>
            <th className="py-2.5 px-3 text-center">Presensi</th>
            <th className="py-2.5 px-3 text-center w-24">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((st, i) => (
            <tr key={st.id} className="border-b border-slate-100">
              <td className="py-2.5 px-3 text-center font-mono text-slate-400">{i + 1}</td>
              <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{st.id}</td>
              <td className="py-2.5 px-3 font-bold text-slate-900">{st.name}</td>
              <td className="py-2.5 px-3 text-center">{st.gender === 'Male' ? 'L' : 'P'}</td>
              <td className="py-2.5 px-3 text-center font-mono">{st.age} Th</td>
              <td className="py-2.5 px-3 text-center font-mono font-semibold">{Math.round(st.attendanceRate * 100)}%</td>
              <td className="py-2.5 px-3 text-center">
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded border uppercase ${
                  st.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  st.status === 'Graduated' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  st.status === 'Leave' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-rose-700 border-rose-200'
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

  // Render Attendance Report
  const renderAttendanceReport = () => {
    const activeCohortStudents = students.filter(s => s.status === 'Active');
    
    const getStatus = (studentId: string, session: 'morning' | 'classSession') => {
      const rec = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
      return rec ? rec[session] : 'Present';
    };

    return (
      <div className="space-y-4">
        <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-xl flex justify-between items-center text-xs font-semibold">
          <span>Tanggal Cetak Laporan Kehadiran: <strong className="text-blue-700 font-mono font-bold">{selectedDate}</strong></span>
          <span className="text-slate-500 font-normal">Sesi 1 (Pagi 08:30) & Sesi 2 (Kelas 13:00)</span>
        </div>

        <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-bold bg-slate-50">
              <th className="py-2.5 px-3 w-10 text-center">No</th>
              <th className="py-2.5 px-3">Nama Siswa</th>
              <th className="py-2.5 px-3">ID Siswa</th>
              <th className="py-2.5 px-3 text-center">Sesi 1 (Pagi 08:30)</th>
              <th className="py-2.5 px-3 text-center">Sesi 2 (Kelas 13:00)</th>
            </tr>
          </thead>
          <tbody>
            {activeCohortStudents.map((st, i) => {
              const morn = getStatus(st.id, 'morning');
              const clss = getStatus(st.id, 'classSession');

              const getStatusBadge = (status: string) => {
                switch (status) {
                  case 'Present': return 'text-emerald-700 bg-emerald-50 border-emerald-200 font-bold';
                  case 'Late': return 'text-amber-700 bg-amber-50 border-amber-200 font-bold';
                  case 'Sick': return 'text-blue-700 bg-blue-50 border-blue-200 font-bold';
                  case 'Permission': return 'text-slate-700 bg-slate-100 border-slate-200 font-bold';
                  case 'Absent': return 'text-rose-700 bg-rose-50 border-rose-200 font-extrabold';
                  default: return '';
                }
              };

              return (
                <tr key={st.id} className="border-b border-slate-100">
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400">{i + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{st.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{st.id}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-xs border ${getStatusBadge(morn)}`}>
                      {morn === 'Present' ? '✅ Hadir' : morn === 'Late' ? '⚠️ Telat' : morn === 'Absent' ? '❌ Alpa' : morn}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-xs border ${getStatusBadge(clss)}`}>
                      {clss === 'Present' ? '✅ Hadir' : clss === 'Late' ? '⚠️ Telat' : clss === 'Absent' ? '❌ Alpa' : clss}
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

  // Render Academia Grades Report
  const renderAcademiaReport = () => {
    const activeCohortStudents = students.filter(s => s.status === 'Active');

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rekapitulasi Nilai Ujian & Kuis</h3>
          {academiaTypeFilter !== 'all' && (
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Filter: Hanya {academiaTypeFilter}
            </span>
          )}
        </div>

        {printableGrades.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">Belum ada kolom nilai yang tercatat untuk filter ini.</p>
        ) : (
          <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-bold bg-slate-50">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">Nama Siswa</th>
                {printableGrades.map(g => (
                  <th key={g.id} className="py-2.5 px-2 text-center text-xs w-28 truncate" title={`[${g.type}] ${g.title}`}>
                    <span className="block text-[10px] font-mono text-slate-400 uppercase">{g.type}</span>
                    {g.title.length > 12 ? g.title.slice(0, 10) + '...' : g.title}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center w-20 bg-slate-100 font-bold text-slate-900">Rata-Rata</th>
              </tr>
            </thead>
            <tbody>
              {activeCohortStudents.map((st, i) => {
                let sum = 0;
                let count = 0;

                return (
                  <tr key={st.id} className="border-b border-slate-100">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{i + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{st.name}</td>
                    {printableGrades.map(g => {
                      const scoreObj = g.scores?.find(s => s.studentId === st.id);
                      const score = scoreObj?.score;
                      const isUnderKKM = score !== undefined && score !== null && score < 75;
                      if (score !== undefined && score !== null) {
                        sum += score;
                        count++;
                      }

                      return (
                        <td key={g.id} className={`py-2.5 px-2 text-center font-mono font-semibold ${isUnderKKM ? 'text-rose-700 font-bold bg-rose-50/50' : ''}`}>
                          {score !== undefined && score !== null ? score : '-'}
                        </td>
                      );
                    })}
                    <td className={`py-2.5 px-3 text-center font-mono font-bold bg-slate-50 ${count > 0 && Math.round(sum / count) < 75 ? 'text-rose-700 font-black bg-rose-50/30' : 'text-slate-900'}`}>
                      {count > 0 ? Math.round(sum / count) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center select-none shrink-0">
            <div className="flex items-center gap-3">
              <Printer className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Cetak & Ekspor Laporan Resmi UTB Banjar
                </h3>
                <p className="text-xs text-slate-500 font-medium">Pengaturan cetak dokumen A4 dan kustomisasi tanda tangan penandatangan</p>
              </div>
            </div>

            {/* PDF Guidance Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1 rounded-lg font-semibold">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Tips: Pilih "Save as PDF" di dialog print browser untuk menyimpan file PDF.</span>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1 rounded-md transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body Container */}
          <div className="flex-1 flex min-h-0">
            
            {/* Left Config Panel */}
            <div className="w-80 border-r border-slate-200 p-5 overflow-y-auto space-y-5 select-none bg-slate-50/40 shrink-0">
              
              {/* Type Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis Laporan Dokumen</label>
                <div className="space-y-1">
                  {[
                    { id: 'dashboard', label: 'Ringkasan Dashboard', icon: LayoutDashboard },
                    { id: 'students', label: 'Direktori Data Siswa', icon: Users },
                    { id: 'attendance', label: 'Rekap Presensi & Kehadiran', icon: Calendar },
                    { id: 'academia', label: 'Nilai Akademik', icon: Award }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setReportType(tab.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg text-left transition duration-200 cursor-pointer ${
                          reportType === tab.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Selector for Attendance Report */}
              {reportType === 'attendance' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Laporan Kehadiran</label>
                  <input
                    type="date"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              )}

              {/* Grade Type Filter for Academic Report */}
              {reportType === 'academia' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Tipe Nilai Cetak (A4 Fit)</label>
                  <select
                    value={academiaTypeFilter}
                    onChange={(e) => setAcademiaTypeFilter(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">📊 Semua Nilai (Kuis & Ulangan)</option>
                    <option value="Kuis">📝 Hanya Nilai Kuis (Formatif)</option>
                    <option value="Ulangan">🎓 Hanya Nilai Ulangan (Sumatif)</option>
                  </select>
                </div>
              )}

              {/* Custom Titles */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kustomisasi Dokumen</h4>
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Judul Dokumen</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Sub-Judul / Catatan Kaki</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                  />
                </div>
              </div>

              {/* Custom Signatory Names */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <PenTool className="h-3.5 w-3.5 text-blue-600" />
                  Nama Penandatangan
                </h4>
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Nama Sensei / Pengajar</label>
                  <input
                    type="text"
                    placeholder="Nama Sensei Pengajar..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Nama Pimpinan / Kepala UTB</label>
                  <input
                    type="text"
                    placeholder="Nama Pimpinan UTB..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                    value={headmasterName}
                    onChange={(e) => setHeadmasterName(e.target.value)}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilihan Tambahan</h4>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                  />
                  <span>Sertakan Tanda Tangan Resmi</span>
                </label>
              </div>

              {/* Color Themes */}
              <div className="space-y-1.5 pt-3 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tema Warna Cetak Dokumen</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'slate', name: 'Slate', color: 'bg-slate-700' },
                    { id: 'blue', name: 'Cobalt', color: 'bg-blue-600' },
                    { id: 'green', name: 'Emerald', color: 'bg-emerald-600' },
                    { id: 'bw', name: 'B&W', color: 'bg-slate-900 border border-slate-300' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setColorTheme(t.id as any)}
                      title={t.name}
                      className={`h-7 rounded-md flex items-center justify-center text-xs font-bold transition duration-200 relative cursor-pointer ${t.color} ${
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
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OFFICIAL ACADEMIC REPORT RECORD</span>
                      <h2 className="text-xl font-extrabold text-slate-900 uppercase mt-0.5 tracking-tight">UTB BANJAR NIHONGO</h2>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Japanese Trainee Academic & Performance Management System</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-600 block font-semibold">Tanggal Cetak: {currentDateFormatted}</span>
                      <span className="text-xs font-mono text-slate-500 block mt-0.5">Oleh: {teacherName || 'Sensei Pengajar'}</span>
                    </div>
                  </div>

                  {/* Document Subject Area */}
                  <div className="mb-6">
                    <h1 className="text-lg font-extrabold text-slate-900">{customTitle || 'Laporan Kinerja Akademika'}</h1>
                    <p className="text-xs text-slate-500 mt-0.5">{customSubtitle || 'Ringkasan operasional dan kedisiplinan trainee'}</p>
                  </div>

                  {/* Active Report Formatted content */}
                  {renderActiveReport()}

                </div>

                {/* Print Document Footer Signatures */}
                <div className="mt-12">
                  {includeSignature && (
                    <div className="grid grid-cols-2 gap-12 text-center text-xs mt-8 pb-6">
                      <div className="space-y-12">
                        <p className="text-slate-600 font-bold">Sensei Pengajar / Pemeriksa</p>
                        <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-extrabold text-slate-900 text-xs">
                          ( {teacherName.trim() || '............................................'} )
                        </div>
                      </div>
                      <div className="space-y-12">
                        <p className="text-slate-600 font-bold">Pimpinan / Kepala Cabang UTB</p>
                        <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-extrabold text-slate-900 text-xs">
                          ( {headmasterName.trim() || '............................................'} )
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs text-slate-400 font-mono">
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
              className="px-4 py-2 border border-slate-250 rounded-lg text-xs font-bold text-slate-650 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-4.5 w-4.5" />
              Cetak Sekarang / Simpan PDF
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">OFFICIAL ACADEMIC REPORT RECORD</span>
            <h2 className="text-xl font-black text-slate-950 uppercase mt-0.5 tracking-tight">UTB BANJAR NIHONGO</h2>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">Japanese Trainee Academic & Performance Management System</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-700 font-bold block">Tanggal Cetak: {currentDateFormatted}</span>
            <span className="text-xs font-mono text-slate-600 block mt-0.5">Oleh: {teacherName || 'Sensei Pengajar'}</span>
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
              <p className="text-slate-600 font-bold">Sensei Pengajar / Pemeriksa</p>
              <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-extrabold text-slate-900 text-xs">
                ( {teacherName.trim() || '............................................'} )
              </div>
            </div>
            <div className="space-y-12">
              <p className="text-slate-600 font-bold">Pimpinan / Kepala Cabang UTB</p>
              <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-extrabold text-slate-900 text-xs">
                ( {headmasterName.trim() || '............................................'} )
              </div>
            </div>
          </div>
        )}

        {/* Document Footer stamp */}
        <div className="border-t border-slate-200 mt-12 pt-3 flex justify-between items-center text-xs text-slate-400 font-mono page-break-inside-avoid">
          <span>Dokumen ini dihasilkan secara otomatis oleh Sistem Manajemen Akademik UTB Banjar Nihongo.</span>
          <span>Halaman 1 dari 1</span>
        </div>
      </div>
    </>
  );
}
