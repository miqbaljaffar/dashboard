import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (record: AttendanceRecord) => void;
}

export default function AttendanceView({
  students,
  attendance,
  onUpdateAttendance
}: AttendanceViewProps) {
  
  const [selectedDate, setSelectedDate] = useState('2026-06-16');
  const [selectedCohort, setSelectedCohort] = useState('Cohort 24');

  // Filter students to track for selected cohort
  const cohortStudents = students.filter(s => s.status === 'Active' && s.cohort === selectedCohort);

  // Stats
  const totalInCohort = cohortStudents.length;

  const getStatusForStudent = (studentId: string, session: 'morning' | 'classSession' | 'eveningRollCall') => {
    const record = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
    if (!record) return 'Present'; // default to Present if unmarked
    return record[session];
  };

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

  // Get total stats for the active date & cohort based on Sesi 1 and Sesi 2
  const getClassStats = () => {
    let presentCount = 0;
    let lateCount = 0;
    let sickCount = 0;
    let absentCount = 0;

    cohortStudents.forEach(s => {
      ['morning', 'classSession'].forEach(session => {
        const stat = getStatusForStudent(s.id, session as any);
        if (stat === 'Present') presentCount++;
        else if (stat === 'Late') lateCount++;
        else if (stat === 'Sick' || stat === 'Permission') sickCount++;
        else if (stat === 'Absent') absentCount++;
      });
    });

    const totalSessions = totalInCohort * 2;
    if (totalSessions === 0) return { rate: 100, present: 0, late: 0, absent: 0 };
    
    // Formula: (Present + Late / 2) / Total Sessions
    const rate = Math.round(((presentCount + lateCount * 0.5) / totalSessions) * 100);
    return {
      rate,
      present: presentCount,
      late: lateCount,
      sickAndPerm: sickCount,
      absent: absentCount
    };
  };

  const stats = getClassStats();

  // Highlight students at risk in attendance (attendance < 80%)
  const highRiskStudents = students.filter(s => s.status === 'Active' && s.attendanceRate < 0.82);

  // Render standard attendance heat map mock for Cohort 24 showing Sesi 1 & Sesi 2
  const heatmapData = [
    { day: 'Mon', morning: 'green', class: 'green' },
    { day: 'Tue', morning: 'green', class: 'green' },
    { day: 'Wed', morning: 'green', class: 'green' },
    { day: 'Thu', morning: 'green', class: 'green' },
    { day: 'Fri', morning: 'green', class: 'green' },
    { day: 'Sat', morning: 'gray', class: 'gray' },
    { day: 'Today', morning: stats.absent > 0 ? 'amber' : 'green', class: 'green' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Digital Attendance & Roll Call Register
          </h2>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
              Senin - Jumat
            </span>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100">
              Sesi 1: 08:30 - 11:30
            </span>
            <span className="bg-violet-50 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded border border-violet-100">
              Sesi 2: 13:00 - 16:00
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Jadwal kelas aktif UTB Banjar sejak 11 Juni 2026. Semua siswa terekam hadir penuh 100% pada hari pembelajaran aktif.
          </p>
        </div>

        {/* Date / Cohort select controls */}
        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <select
            className="bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-700"
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
          >
            <option value="Cohort 23">Cohort 23</option>
            <option value="Cohort 24">Cohort 24</option>
            <option value="Cohort 25">Cohort 25</option>
          </select>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cohort Daily Rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <h4 className="text-2xl font-bold text-slate-900">{stats.rate}%</h4>
            <span className="text-[10px] text-green-600 font-bold">▲ Target</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-600 h-full" style={{ width: `${stats.rate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Present ticks</span>
          <h4 className="text-2xl font-bold text-slate-900 mt-1">{stats.present}</h4>
          <p className="text-[9px] text-slate-400 mt-1">Total active sessions today</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tardy (Late)</span>
          <h4 className={`text-2xl font-bold mt-1 ${stats.late > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {stats.late}
          </h4>
          <p className="text-[9px] text-slate-400 mt-1">Loss of 0.5 points behavior</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sakit / Izin (Perm)</span>
          <h4 className="text-2xl font-bold text-slate-950 mt-1">{stats.sickAndPerm}</h4>
          <p className="text-[9px] text-slate-400 mt-1">Authorized health permissions</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-semibold">Tapa Kabar (Absent)</span>
          <h4 className={`text-2xl font-bold mt-1 ${stats.absent > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {stats.absent}
          </h4>
          <p className="text-[9px] text-slate-400 mt-1">Critical violations triggered</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ATTENDANCE SHEET */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-5 shadow-3xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase">
              Presensi Mandiri — {selectedCohort} ({selectedDate})
            </h3>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded font-mono font-medium">
              Verifikasi 2-Sesi Aktif
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase text-[9px] bg-slate-50/50">
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3 text-center w-40">Sesi 1 (08:30 - 11:30)</th>
                  <th className="py-2.5 px-3 text-center w-40">Sesi 2 (13:00 - 16:00)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cohortStudents.map(st => {
                  const morningStat = getStatusForStudent(st.id, 'morning');
                  const classStat = getStatusForStudent(st.id, 'classSession');

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{st.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{st.id} • {st.classroom}</p>
                      </td>
                      
                      {/* Sesi 1 Shift */}
                      <td className="py-3 px-3 text-center">
                        <select
                          id={`attn-morn-${st.id}`}
                          className={`border rounded px-1.5 py-1 text-[11px] font-semibold focus:outline-hidden ${
                            morningStat === 'Present' ? 'bg-green-50 text-green-700 border-green-200' :
                            morningStat === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            morningStat === 'Absent' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-600'
                          }`}
                          value={morningStat}
                          onChange={(e) => handleStatusChange(st.id, 'morning', e.target.value as any)}
                        >
                          <option value="Present">Present</option>
                          <option value="Late">Late</option>
                          <option value="Sick">Sick</option>
                          <option value="Permission">Permit</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>

                      {/* Sesi 2 Shift */}
                      <td className="py-3 px-3 text-center">
                        <select
                          id={`attn-class-${st.id}`}
                          className={`border rounded px-1.5 py-1 text-[11px] font-semibold focus:outline-hidden ${
                            classStat === 'Present' ? 'bg-green-50 text-green-700 border-green-200' :
                            classStat === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            classStat === 'Absent' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-600'
                          }`}
                          value={classStat}
                          onChange={(e) => handleStatusChange(st.id, 'classSession', e.target.value as any)}
                        >
                          <option value="Present">Present</option>
                          <option value="Late">Late</option>
                          <option value="Sick">Sick</option>
                          <option value="Permission">Permit</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR ANALYTICS / AT RISK */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Heat map representation */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-3xs">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between uppercase">
              <span>Weekly Attendance Heatmap</span>
              <Activity className="h-4 w-4 text-slate-400" />
            </h3>
            
            <p className="text-[10px] text-slate-400 mt-2">Historic daily overview for {selectedCohort}, illustrating critical spots:</p>
            
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold mt-3">
              <span className="text-slate-400 text-left">Day</span>
              <span>Sesi 1</span>
              <span>Sesi 2</span>
            </div>

            <div className="space-y-1.5 mt-2">
              {heatmapData.map((row, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 text-[10px] items-center">
                  <span className="text-slate-500 text-left font-mono">{row.day}</span>
                  
                  <div className={`h-4.5 rounded ${
                    row.morning === 'green' ? 'bg-green-500' : row.morning === 'amber' ? 'bg-amber-400' : row.morning === 'gray' ? 'bg-slate-200' : 'bg-red-500'
                  }`} />
                  
                  <div className={`h-4.5 rounded ${
                    row.class === 'green' ? 'bg-green-500' : row.class === 'amber' ? 'bg-amber-400' : row.morning === 'gray' ? 'bg-slate-200' : 'bg-red-500'
                  }`} />
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center text-[9px] text-slate-400 mt-4 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-green-500" /> 100% Present</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-400" /> Late / Izin</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-red-500" /> Alpa (Absent)</span>
            </div>
          </div>

          {/* Automatic Risk Detection Panel */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-3xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 text-red-700 flex items-center gap-1.5 uppercase">
              <AlertTriangle className="h-4 w-4" />
              Tapa Kabar Alert (&lt; 82%)
            </h3>
            
            <p className="text-[10px] text-slate-500">
              The following students are trending below the safety threshold. Administrative coordination or parent warning emails required.
            </p>

            <div className="space-y-3 mt-2">
              {highRiskStudents.map(st => (
                <div key={st.id} className="p-2.5 rounded border border-red-100 bg-red-50/40 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-red-950 block">{st.name}</strong>
                      <span className="text-[10px] text-red-600 font-medium">{st.id} • {st.cohort}</span>
                    </div>
                    <span className="font-mono font-bold text-red-700 text-sm bg-red-100 px-1 rounded">
                      {Math.round(st.attendanceRate * 100)}%
                    </span>
                  </div>
                  <p className="text-[9px] text-red-500 mt-1">Suggested action: Supervisor must send official counseling warning.</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
