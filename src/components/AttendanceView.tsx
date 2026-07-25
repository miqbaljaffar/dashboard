import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord } from '../types';
import {
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  Flame,
  CheckCircle,
  TrendingDown,
  Sparkles,
  HelpCircle,
  Activity,
  CheckCircle2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  FileSpreadsheet,
  Moon,
  Sun,
  BookOpen,
  CheckCheck
} from 'lucide-react';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onPrintClick?: () => void;
}

export default function AttendanceView({
  students,
  attendance,
  onUpdateAttendance,
  onPrintClick
}: AttendanceViewProps) {
  
  // Date State
  const [selectedDate, setSelectedDate] = useState('2026-06-16');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issue' | 'permit'>('all');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // All active students (single class)
  const activeStudents = useMemo(() => {
    return students.filter(s => s.status === 'Active');
  }, [students]);

  const totalActive = activeStudents.length;

  // Date Navigation Helper
  const handleShiftDate = (deltaDays: number) => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        d.setDate(d.getDate() + deltaDays);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
      }
    } catch (e) {}
  };

  const handleSetToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  // Status Lookup Helper
  const getStatusForStudent = (studentId: string, session: 'morning' | 'classSession' | 'eveningRollCall') => {
    const record = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
    if (!record) return 'Present'; // default to Present if unmarked
    return record[session];
  };

  // Status Update Handler
  const handleStatusChange = (
    studentId: string,
    session: 'morning' | 'classSession' | 'eveningRollCall',
    newStatus: 'Present' | 'Late' | 'Sick' | 'Permission' | 'Absent'
  ) => {
    const existing = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
    
    const baseRecord: AttendanceRecord = existing
      ? { ...existing }
      : {
          studentId,
          date: selectedDate,
          morning: 'Present',
          classSession: 'Present',
          eveningRollCall: 'Present'
        };

    baseRecord[session] = newStatus;
    onUpdateAttendance(baseRecord);
  };

  // Mass Bulk Mark All Present Handler
  const handleBulkMarkPresent = (session: 'morning' | 'classSession' | 'eveningRollCall') => {
    let updateCount = 0;
    activeStudents.forEach(st => {
      const existing = attendance.find(a => a.studentId === st.id && a.date === selectedDate);
      const baseRecord: AttendanceRecord = existing
        ? { ...existing }
        : {
            studentId: st.id,
            date: selectedDate,
            morning: 'Present',
            classSession: 'Present',
            eveningRollCall: 'Present'
          };

      if (baseRecord[session] !== 'Present') {
        baseRecord[session] = 'Present';
        onUpdateAttendance(baseRecord);
        updateCount++;
      }
    });

    const sessionLabel = session === 'morning' ? 'Sesi 1 (Pagi)' : session === 'classSession' ? 'Sesi 2 (Kelas)' : 'Sesi 3 (Apel Malam)';
    setToastMessage(`Berhasil menandai ${totalActive} siswa HADIR pada ${sessionLabel}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculate Class Stats for 3 Sessions
  const classStats = useMemo(() => {
    let presentCount = 0;
    let lateCount = 0;
    let sickCount = 0;
    let absentCount = 0;

    activeStudents.forEach(s => {
      ['morning', 'classSession', 'eveningRollCall'].forEach(session => {
        const stat = getStatusForStudent(s.id, session as any);
        if (stat === 'Present') presentCount++;
        else if (stat === 'Late') lateCount++;
        else if (stat === 'Sick' || stat === 'Permission') sickCount++;
        else if (stat === 'Absent') absentCount++;
      });
    });

    const totalSessions = totalActive * 3;
    if (totalSessions === 0) return { rate: 100, present: 0, late: 0, sickAndPerm: 0, absent: 0 };
    
    // Formula: (Present + Late * 0.5) / Total Sessions
    const rate = Math.round(((presentCount + lateCount * 0.5) / totalSessions) * 100);
    return {
      rate,
      present: presentCount,
      late: lateCount,
      sickAndPerm: sickCount,
      absent: absentCount
    };
  }, [activeStudents, attendance, selectedDate]);

  // High Risk Students (<82% attendance rate)
  const highRiskStudents = useMemo(() => {
    return students.filter(s => s.status === 'Active' && s.attendanceRate < 0.82);
  }, [students]);

  // Dynamic Weekly Heatmap Computed Real-Time from Attendance Data
  const dynamicHeatmapData = useMemo(() => {
    const targetDateObj = new Date(selectedDate);
    const daysList = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(targetDateObj);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });

      const dayRecords = attendance.filter(a => a.date === dateStr);

      const getSessionColor = (session: 'morning' | 'classSession' | 'eveningRollCall') => {
        if (dayRecords.length === 0) return 'gray';
        let hasAbsent = false;
        let hasLateOrPermit = false;

        dayRecords.forEach(r => {
          if (r[session] === 'Absent') hasAbsent = true;
          else if (r[session] === 'Late' || r[session] === 'Sick' || r[session] === 'Permission') hasLateOrPermit = true;
        });

        if (hasAbsent) return 'red';
        if (hasLateOrPermit) return 'amber';
        return 'green';
      };

      daysList.push({
        date: dateStr,
        day: dayLabel,
        isToday: dateStr === selectedDate,
        morning: getSessionColor('morning'),
        class: getSessionColor('classSession'),
        evening: getSessionColor('eveningRollCall')
      });
    }

    return daysList;
  }, [attendance, selectedDate]);

  // Filtered Students List for Table
  const filteredStudents = useMemo(() => {
    let list = activeStudents;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    }

    if (statusFilter !== 'all') {
      list = list.filter(s => {
        const m = getStatusForStudent(s.id, 'morning');
        const c = getStatusForStudent(s.id, 'classSession');
        const e = getStatusForStudent(s.id, 'eveningRollCall');

        if (statusFilter === 'issue') {
          return m === 'Late' || m === 'Absent' || c === 'Late' || c === 'Absent' || e === 'Late' || e === 'Absent';
        }
        if (statusFilter === 'permit') {
          return m === 'Sick' || m === 'Permission' || c === 'Sick' || c === 'Permission' || e === 'Sick' || e === 'Permission';
        }
        return true;
      });
    }

    return list;
  }, [activeStudents, searchQuery, statusFilter, attendance, selectedDate]);

  // Export Daily Attendance CSV Handler
  const handleExportAttendanceCSV = () => {
    const headers = ['ID Siswa', 'Nama Siswa', 'Tanggal', 'Sesi 1 (Pagi 08:30)', 'Sesi 2 (Kelas 13:00)', 'Sesi 3 (Apel 19:30)'];
    const rows = activeStudents.map(st => {
      const m = getStatusForStudent(st.id, 'morning');
      const c = getStatusForStudent(st.id, 'classSession');
      const e = getStatusForStudent(st.id, 'eveningRollCall');
      return [
        st.id,
        `"${st.name.replace(/"/g, '""')}"`,
        selectedDate,
        m,
        c,
        e
      ].join(',');
    });

    const csvString = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Presensi_UTB_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Date Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Digital Attendance & Roll Call Register
          </h2>
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
              <Sun className="h-3 w-3 text-amber-500" /> Sesi 1: 08:30 - 11:30
            </span>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-blue-500" /> Sesi 2: 13:00 - 16:00
            </span>
            <span className="bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-0.5 rounded-md border border-violet-100 flex items-center gap-1">
              <Moon className="h-3 w-3 text-violet-500" /> Sesi 3: 19:30 - 20:30 (Apel Malam)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Pencatatan presensi 3-sesi harian untuk siswa Fuji Elite Class UTB Banjar.
          </p>
        </div>

        {/* Global Date & Export Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end select-none">
          
          {/* Quick Date Shift Buttons */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => handleShiftDate(-1)}
              title="Hari Sebelumnya"
              className="p-1 text-slate-600 hover:text-blue-600 hover:bg-white rounded transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={handleSetToday}
              className="px-2 py-0.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-white rounded transition cursor-pointer"
            >
              Hari Ini
            </button>

            <input
              type="date"
              aria-label="Pilih Tanggal Presensi"
              className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <button
              onClick={() => handleShiftDate(1)}
              title="Hari Selanjutnya"
              className="p-1 text-slate-600 hover:text-blue-600 hover:bg-white rounded transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportAttendanceCSV}
            title="Unduh Rekap Presensi Tanggal Ini ke CSV"
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs no-print"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={onPrintClick}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition duration-200 flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="h-4 w-4" />
            Cetak Rekap
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tingkat Presensi Harian</span>
          <div className="flex items-baseline gap-1 mt-1">
            <h4 className="text-2xl font-extrabold text-slate-900 font-mono">{classStats.rate}%</h4>
            <span className={`text-xs font-bold ${classStats.rate >= 95 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {classStats.rate >= 95 ? '▲ Target' : '▼ Risk'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full ${classStats.rate >= 95 ? 'bg-emerald-500' : classStats.rate >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`} 
              style={{ width: `${classStats.rate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Siswa Hadir</span>
          <h4 className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{classStats.present}</h4>
          <p className="text-xs text-slate-500 mt-1">Total sesi terisi hadir</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Telat (Tardy)</span>
          <h4 className={`text-2xl font-extrabold font-mono mt-1 ${classStats.late > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {classStats.late}
          </h4>
          <p className="text-xs text-amber-600 mt-1">Pengurangan 0.5 poin perilaku</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Sakit / Izin</span>
          <h4 className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{classStats.sickAndPerm}</h4>
          <p className="text-xs text-slate-500 mt-1">Izin resmi terverifikasi</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tanpa Kabar (Alpa)</span>
          <h4 className={`text-2xl font-extrabold font-mono mt-1 ${classStats.absent > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {classStats.absent}
          </h4>
          <p className="text-xs text-rose-600 mt-1">Pelanggaran disiplin berat</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ATTENDANCE MAIN SHEET & BULK ACTIONS */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header & Bulk Actions Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Presensi Mandiri — Fuji Elite Class ({selectedDate})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Verifikasi 3-Sesi Aktif Harian</p>
              </div>

              {/* Bulk Mark All Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap select-none">
                <button
                  onClick={() => handleBulkMarkPresent('morning')}
                  title="Tandai Hadir Semua Siswa Sesi 1 Pagi"
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-bold transition cursor-pointer"
                >
                  <Sun className="h-3 w-3 text-amber-500 inline mr-1" /> All Hadir S1
                </button>
                
                <button
                  onClick={() => handleBulkMarkPresent('classSession')}
                  title="Tandai Hadir Semua Siswa Sesi 2 Kelas"
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-bold transition cursor-pointer"
                >
                  <BookOpen className="h-3 w-3 text-blue-500 inline mr-1" /> All Hadir S2
                </button>

                <button
                  onClick={() => handleBulkMarkPresent('eveningRollCall')}
                  title="Tandai Hadir Semua Siswa Sesi 3 Apel Malam"
                  className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-md text-xs font-bold transition cursor-pointer"
                >
                  <Moon className="h-3 w-3 text-violet-500 inline mr-1" /> All Hadir S3
                </button>
              </div>
            </div>

            {/* SEARCH & FILTER BAR */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama siswa atau ID..."
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 shrink-0 select-none">
                <span className="text-xs font-bold text-slate-500">Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">📊 Semua Siswa ({activeStudents.length})</option>
                  <option value="issue">⚠️ Bermasalah (Telat/Alpa)</option>
                  <option value="permit">🏥 Sakit / Izin</option>
                </select>
              </div>
            </div>

            {/* ATTENDANCE TABLE */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-xs bg-slate-50">
                    <th className="py-3 px-3">Nama Siswa</th>
                    <th className="py-3 px-2 text-center w-36">S1: Pagi (08:30)</th>
                    <th className="py-3 px-2 text-center w-36">S2: Kelas (13:00)</th>
                    <th className="py-3 px-2 text-center w-36">S3: Apel Malam (19:30)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        Tidak ada siswa yang cocok dengan kriteria pencarian / filter status.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(st => {
                      const morningStat = getStatusForStudent(st.id, 'morning');
                      const classStat = getStatusForStudent(st.id, 'classSession');
                      const eveningStat = getStatusForStudent(st.id, 'eveningRollCall');

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900 text-xs">{st.name}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{st.id}</p>
                          </td>
                          
                          {/* Sesi 1 Shift */}
                          <td className="py-3 px-2 text-center">
                            <select
                              id={`attn-morn-${st.id}`}
                              aria-label={`Presensi Sesi 1 ${st.name}`}
                              className={`border rounded-lg px-2 py-1 text-xs font-bold cursor-pointer focus:outline-none transition-colors ${
                                morningStat === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                morningStat === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                                morningStat === 'Absent' ? 'bg-rose-50 text-rose-700 border-rose-300 font-extrabold' : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                              value={morningStat}
                              onChange={(e) => handleStatusChange(st.id, 'morning', e.target.value as any)}
                            >
                              <option value="Present">✅ Hadir</option>
                              <option value="Late">⚠️ Telat</option>
                              <option value="Sick">🏥 Sakit</option>
                              <option value="Permission">📋 Izin</option>
                              <option value="Absent">❌ Alpa</option>
                            </select>
                          </td>

                          {/* Sesi 2 Shift */}
                          <td className="py-3 px-2 text-center">
                            <select
                              id={`attn-class-${st.id}`}
                              aria-label={`Presensi Sesi 2 ${st.name}`}
                              className={`border rounded-lg px-2 py-1 text-xs font-bold cursor-pointer focus:outline-none transition-colors ${
                                classStat === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                classStat === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                                classStat === 'Absent' ? 'bg-rose-50 text-rose-700 border-rose-300 font-extrabold' : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                              value={classStat}
                              onChange={(e) => handleStatusChange(st.id, 'classSession', e.target.value as any)}
                            >
                              <option value="Present">✅ Hadir</option>
                              <option value="Late">⚠️ Telat</option>
                              <option value="Sick">🏥 Sakit</option>
                              <option value="Permission">📋 Izin</option>
                              <option value="Absent">❌ Alpa</option>
                            </select>
                          </td>

                          {/* Sesi 3 Shift (Evening Roll Call) */}
                          <td className="py-3 px-2 text-center">
                            <select
                              id={`attn-eve-${st.id}`}
                              aria-label={`Presensi Sesi 3 ${st.name}`}
                              className={`border rounded-lg px-2 py-1 text-xs font-bold cursor-pointer focus:outline-none transition-colors ${
                                eveningStat === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                eveningStat === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                                eveningStat === 'Absent' ? 'bg-rose-50 text-rose-700 border-rose-300 font-extrabold' : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                              value={eveningStat}
                              onChange={(e) => handleStatusChange(st.id, 'eveningRollCall', e.target.value as any)}
                            >
                              <option value="Present">✅ Hadir</option>
                              <option value="Late">⚠️ Telat</option>
                              <option value="Sick">🏥 Sakit</option>
                              <option value="Permission">📋 Izin</option>
                              <option value="Absent">❌ Alpa</option>
                            </select>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* SIDEBAR ANALYTICS / DYNAMIC HEATMAP & AT RISK */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Dynamic Real-Time Heatmap representation */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Weekly Attendance Heatmap
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Histori presensi 7 hari terakhir (Real-Time)</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold text-slate-400 mt-3 border-b border-slate-100 pb-1">
              <span className="text-left">Hari</span>
              <span>S1 (Pagi)</span>
              <span>S2 (Kelas)</span>
              <span>S3 (Apel)</span>
            </div>

            <div className="space-y-2 mt-2">
              {dynamicHeatmapData.map((row, i) => (
                <div key={i} className={`grid grid-cols-4 gap-2 text-xs items-center p-1 rounded-md ${row.isToday ? 'bg-blue-50/50 font-bold' : ''}`}>
                  <span className={`text-left font-mono text-xs ${row.isToday ? 'text-blue-700 font-bold' : 'text-slate-600'}`}>
                    {row.day} {row.isToday && '(Today)'}
                  </span>
                  
                  <div title={`${row.day} Sesi 1`} className={`h-5 rounded-md transition-all ${
                    row.morning === 'green' ? 'bg-emerald-500' : row.morning === 'amber' ? 'bg-amber-400' : row.morning === 'gray' ? 'bg-slate-200' : 'bg-rose-500'
                  }`} />
                  
                  <div title={`${row.day} Sesi 2`} className={`h-5 rounded-md transition-all ${
                    row.class === 'green' ? 'bg-emerald-500' : row.class === 'amber' ? 'bg-amber-400' : row.class === 'gray' ? 'bg-slate-200' : 'bg-rose-500'
                  }`} />

                  <div title={`${row.day} Sesi 3`} className={`h-5 rounded-md transition-all ${
                    row.evening === 'green' ? 'bg-emerald-500' : row.evening === 'amber' ? 'bg-amber-400' : row.evening === 'gray' ? 'bg-slate-200' : 'bg-rose-500'
                  }`} />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-4 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500 shrink-0" /> Hadir</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-400 shrink-0" /> Telat/Izin</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-rose-500 shrink-0" /> Alpa</span>
            </div>
          </div>

          {/* Automatic Risk Detection Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold border-b border-slate-100 pb-2 text-rose-700 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              Siswa At-Risk Presensi (&lt; 82%)
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Siswa yang berada di bawah ambang batas presensi aman (82%). Membutuhkan bimbingan konseling atau peneguran resmi dari Sensei.
            </p>

            <div className="space-y-2.5 mt-3">
              {highRiskStudents.length === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Semua siswa memiliki presensi di atas 82%.</span>
                </div>
              ) : (
                highRiskStudents.map(st => (
                  <div key={st.id} className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 text-xs space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-slate-900 text-xs block">{st.name}</strong>
                        <span className="text-xs text-rose-600 font-mono">{st.id}</span>
                      </div>
                      <span className="font-mono font-extrabold text-rose-700 text-xs bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                        {Math.round(st.attendanceRate * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-rose-700 mt-1 font-medium">💡 Rekomendasi: Kirim surat peringatan & konseling wali siswa.</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
