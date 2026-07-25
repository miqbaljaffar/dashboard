import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  UserPlus,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  GraduationCap,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onPrintClick?: () => void;
}

export default function StudentsView({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onPrintClick
}: StudentsViewProps) {
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Graduated' | 'Leave' | 'Dropped'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'attendance-asc' | 'behavior-desc'>('name-asc');
  
  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal state for adding student
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female'>('Male');
  const [newAge, setNewAge] = useState(20);
  const [newClassroom, setNewClassroom] = useState('Fuji Elite Class');
  const [newEnrollDate, setNewEnrollDate] = useState(new Date().toISOString().split('T')[0]);
  const [newGradTarget, setNewGradTarget] = useState('2026-06-30');

  // Inline editing states
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState(20);
  const [editClassroom, setEditClassroom] = useState('');
  const [editStatus, setEditStatus] = useState<Student['status']>('Active');

  // Summary KPI Stats
  const studentStats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => s.status === 'Active').length;
    const graduated = students.filter(s => s.status === 'Graduated').length;
    const leave = students.filter(s => s.status === 'Leave').length;
    const dropped = students.filter(s => s.status === 'Dropped').length;

    return { total, active, graduated, leaveAndDropped: leave + dropped };
  }, [students]);

  // Filtered and Sorted Students
  const processedStudents = useMemo(() => {
    let list = [...students];

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    }

    // Status Filter
    if (statusFilter !== 'all') {
      list = list.filter(s => s.status === statusFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'attendance-asc') return a.attendanceRate - b.attendanceRate;
      if (sortBy === 'behavior-desc') return b.behaviorScore - a.behaviorScore;
      return 0;
    });

    return list;
  }, [students, searchQuery, statusFilter, sortBy]);

  // Submit Handler for Add Student
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim() || !newName.trim()) return;

    if (students.some(s => s.id.toLowerCase() === newId.trim().toLowerCase())) {
      setToastMessage('⚠️ Siswa dengan ID ini sudah terdaftar!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const student: Student = {
      id: newId.trim().toUpperCase(),
      name: newName.trim(),
      gender: newGender,
      age: Number(newAge),
      classroom: newClassroom,
      enrollmentDate: newEnrollDate,
      graduationTarget: newGradTarget,
      status: 'Active',
      behaviorScore: 100,
      attendanceRate: 1.0,
      violationsCount: 0
    };

    onAddStudent(student);
    setIsAddModalOpen(false);

    setNewId('');
    setNewName('');
    setNewAge(20);

    setToastMessage(`Siswa "${student.name}" berhasil terdaftar!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save Edit Handler
  const handleSaveEdit = (student: Student) => {
    if (!editName.trim()) return;

    const updated: Student = {
      ...student,
      name: editName.trim(),
      age: Number(editAge),
      classroom: editClassroom,
      status: editStatus
    };

    onUpdateStudent(updated);
    setEditingStudentId(null);

    setToastMessage(`Data siswa "${updated.name}" berhasil diperbarui!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startEditing = (s: Student) => {
    setEditingStudentId(s.id);
    setEditName(s.name);
    setEditAge(s.age);
    setEditClassroom(s.classroom);
    setEditStatus(s.status);
  };

  // Export CSV Handler
  const handleExportStudentsCSV = () => {
    const headers = ['ID Siswa', 'Nama Siswa', 'Gender', 'Umur', 'Kelas', 'Tanggal Masuk', 'Target Lulus', 'Status', 'Presensi (%)', 'Skor Perilaku', 'Pelanggaran'];
    const rows = processedStudents.map(s => {
      return [
        s.id,
        `"${s.name.replace(/"/g, '""')}"`,
        s.gender,
        s.age,
        `"${s.classroom.replace(/"/g, '""')}"`,
        s.enrollmentDate,
        s.graduationTarget,
        s.status,
        Math.round(s.attendanceRate * 100),
        s.behaviorScore,
        s.violationsCount
      ].join(',');
    });

    const csvString = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Direktori_Siswa_UTB_${new Date().toISOString().slice(0, 10)}.csv`);
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

      {/* Header and Add Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Data Siswa (Student Directory)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen lengkap biodata siswa, skor presensi, poin perilaku, dan status akademik UTB Banjar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 select-none">
          <button
            onClick={handleExportStudentsCSV}
            title="Unduh Seluruh Data Siswa ke CSV"
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs no-print"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={onPrintClick}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition duration-200 flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="h-4 w-4" />
            Cetak Data
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition duration-200 flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* TOP SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Siswa Terdaftar</p>
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{studentStats.total} Orang</h3>
            <p className="text-xs text-slate-500 mt-1">Direktori Lengkap</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa Aktif</p>
            <h3 className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">{studentStats.active} Siswa</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Status Pembelajaran Aktif</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alumni (Graduated)</p>
            <h3 className="text-2xl font-extrabold text-blue-700 font-mono mt-1">{studentStats.graduated} Siswa</h3>
            <p className="text-xs text-blue-600 font-semibold mt-1">Telah Lulus Studi</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cuti / Drop</p>
            <h3 className="text-2xl font-extrabold text-amber-700 font-mono mt-1">{studentStats.leaveAndDropped} Siswa</h3>
            <p className="text-xs text-amber-600 font-semibold mt-1">Status Non-Aktif</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* FILTERS & SEARCH DECK */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau nomor ID siswa..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter & Sort Dropdowns */}
        <div className="flex items-center gap-2 select-none shrink-0">
          
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">📊 Semua Status ({students.length})</option>
              <option value="Active">🟢 Aktif</option>
              <option value="Graduated">🎓 Graduated</option>
              <option value="Leave">🟡 Cuti (Leave)</option>
              <option value="Dropped">🔴 Dropped</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="name-asc">🔤 Nama (A-Z)</option>
              <option value="name-desc">🔤 Nama (Z-A)</option>
              <option value="attendance-asc">⚠️ Presensi Terendah</option>
              <option value="behavior-desc">🛡️ Skor Perilaku Tertinggi</option>
            </select>
          </div>

        </div>

      </div>

      {/* STUDENTS DIRECTORY TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {processedStudents.length === 0 ? (
          <div className="p-12 text-center select-none">
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Tidak ada siswa ditemukan</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
              Silakan periksa kata kunci pencarian Anda atau tambahkan siswa baru jika belum terdaftar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-xs bg-slate-50 select-none">
                  <th className="py-3 px-4">Informasi Siswa</th>
                  <th className="py-3 px-4 text-center">Tingkat Presensi (%)</th>
                  <th className="py-3 px-4 text-center">Skor Perilaku</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedStudents.map((st) => {
                  const isEditing = editingStudentId === st.id;
                  const attnPct = Math.round(st.attendanceRate * 100);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full font-extrabold flex items-center justify-center shrink-0 text-xs shadow-2xs ${
                            st.gender === 'Male' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-pink-50 text-pink-600 border border-pink-200'
                          }`}>
                            {st.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            {isEditing ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="text"
                                  className="border border-slate-200 rounded px-2 py-1 font-bold text-slate-900 text-xs w-48 focus:outline-none focus:border-blue-500"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                />
                                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono mt-0.5">
                                  <span>{st.id} • Umur:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="border border-slate-200 rounded px-1.5 py-0.5 text-xs w-14 focus:outline-none focus:border-blue-500 font-bold"
                                    value={editAge}
                                    onChange={(e) => setEditAge(Number(e.target.value))}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="font-bold text-slate-900 text-xs truncate">{st.name}</p>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">{st.id} • Umur {st.age} Th • {st.classroom}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Attendance Snapshot (%) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1 w-28">
                          <span className={`font-mono font-extrabold text-xs ${
                            attnPct >= 95 ? 'text-emerald-700' : attnPct >= 82 ? 'text-amber-700' : 'text-rose-700'
                          }`}>
                            {attnPct}%
                          </span>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${attnPct >= 95 ? 'bg-emerald-500' : attnPct >= 82 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${attnPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Behavior Score */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-mono font-extrabold text-slate-800 text-xs flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 inline" />
                            {st.behaviorScore} Pts
                          </span>
                          {st.violationsCount > 0 ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5 border border-rose-200">
                              ⚠️ {st.violationsCount} Pelanggaran
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Disiplin Baik</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isEditing ? (
                          <select
                            className="border border-slate-200 rounded px-2 py-1 text-xs font-bold focus:outline-none"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as any)}
                          >
                            <option value="Active">Active</option>
                            <option value="Graduated">Graduated</option>
                            <option value="Leave">Leave</option>
                            <option value="Dropped">Dropped</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-extrabold border ${
                            st.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            st.status === 'Graduated' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            st.status === 'Leave' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {st.status === 'Active' ? '🟢 Active' : st.status === 'Graduated' ? '🎓 Graduated' : st.status === 'Leave' ? '🟡 Leave' : '🔴 Dropped'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex gap-1.5 justify-center select-none">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(st)}
                                className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                title="Simpan Perubahan"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingStudentId(null)}
                                className="p-1.5 bg-slate-50 text-slate-600 rounded-md border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                                title="Batal"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(st)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                title="Ubah data"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus siswa "${st.name}"? Semua log presensi dan tugasnya akan terhapus permanen.`)) {
                                    onDeleteStudent(st.id);
                                    setToastMessage(`Siswa "${st.name}" berhasil dihapus.`);
                                    setTimeout(() => setToastMessage(null), 3000);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Add Student Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center select-none">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                Registrasi Siswa Baru
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1 rounded-md transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nomor ID Siswa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: UTB-2026-031"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Iqbal"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Jenis Kelamin</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:bg-white"
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                  >
                    <option value="Male">Laki-Laki</option>
                    <option value="Female">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Umur (Tahun)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold focus:outline-none focus:bg-white"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Masuk</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-none focus:bg-white"
                    value={newEnrollDate}
                    onChange={(e) => setNewEnrollDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Daftarkan Siswa
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
