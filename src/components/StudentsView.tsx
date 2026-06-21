import React, { useState } from 'react';
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
  Printer
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
  
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Filter students
  const filteredStudents = students.filter(s => {
    return s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           s.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim() || !newName.trim()) return;

    // Check if ID already exists
    if (students.some(s => s.id.toLowerCase() === newId.trim().toLowerCase())) {
      alert('Siswa dengan ID ini sudah terdaftar!');
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

    // Reset fields
    setNewId('');
    setNewName('');
    setNewAge(20);
  };

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
  };

  const startEditing = (s: Student) => {
    setEditingStudentId(s.id);
    setEditName(s.name);
    setEditAge(s.age);
    setEditClassroom(s.classroom);
    setEditStatus(s.status);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Data Siswa (Student Directory)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen lengkap biodata siswa, filter kelas, dan status kelulusan/cuti secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 select-none">
          <button
            onClick={onPrintClick}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="h-4 w-4" />
            Cetak Data Siswa
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* Filters Deck */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row gap-4 items-center">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:w-auto">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Cari nama atau nomor ID siswa..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center select-none">
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-700">Tidak ada siswa ditemukan</h4>
            <p className="text-[10px] text-slate-450 mt-1 max-w-[280px] mx-auto leading-normal">
              Silakan periksa kata kunci pencarian Anda atau tambahkan siswa baru jika belum terdaftar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px] bg-slate-50/50 select-none">
                  <th className="py-3 px-4">Informasi Siswa</th>
                  <th className="py-3 px-4">Poin Perilaku</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => {
                  const isEditing = editingStudentId === st.id;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/40 transition-colors">
                      
                      {/* Name Card */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full font-bold flex items-center justify-center shrink-0 ${
                            st.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                          }`}>
                            {st.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            {isEditing ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="text"
                                  className="border border-slate-200 rounded px-1.5 py-0.5 font-bold text-slate-900 text-xs w-48 focus:outline-hidden focus:border-blue-500"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                />
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                                  <span>{st.id} • Umur:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="border border-slate-200 rounded px-1 py-0.5 text-[10px] w-12 focus:outline-hidden focus:border-blue-500 font-bold"
                                    value={editAge}
                                    onChange={(e) => setEditAge(Number(e.target.value))}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="font-bold text-slate-900 truncate">{st.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{st.id} • Umur {st.age}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </td>



                      {/* Behavior Score Points */}
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-sm font-semibold border ${
                          st.behaviorScore >= 85 ? 'bg-green-50 text-green-700 border-green-100' :
                          st.behaviorScore >= 70 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {st.behaviorScore} Pts
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <select
                            className="border border-slate-200 rounded p-1 text-[11px] font-semibold"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as any)}
                          >
                            <option value="Active">Active</option>
                            <option value="Graduated">Graduated</option>
                            <option value="Leave">Leave</option>
                            <option value="Dropped">Dropped</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold border uppercase ${
                            st.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                            st.status === 'Graduated' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            st.status === 'Leave' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {st.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-1.5 justify-center">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(st)}
                                className="p-1 bg-green-50 text-green-700 rounded-md border border-green-200 hover:bg-green-100 transition cursor-pointer"
                                title="Simpan"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingStudentId(null)}
                                className="p-1 bg-slate-50 text-slate-600 rounded-md border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                                title="Batal"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(st)}
                                className="p-1 text-slate-450 hover:text-blue-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                title="Ubah data"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus siswa "${st.name}"? Semua log presensi, tugas, dan perilakunya akan ikut terhapus dari sistem.`)) {
                                    onDeleteStudent(st.id);
                                  }
                                }}
                                className="p-1 text-slate-450 hover:text-red-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
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

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-250 flex justify-between items-center select-none">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-blue-600" />
                Registrasi Siswa Baru
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-450 hover:text-slate-700 hover:bg-slate-200 p-1 rounded-md transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nomor ID Siswa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: UTB-2026-031"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Iqbal"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Gender</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold cursor-pointer"
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                  >
                    <option value="Male">Laki-Laki</option>
                    <option value="Female">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Umur (Tahun)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-hidden"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Masuk</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-hidden"
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
                  className="px-4 py-2 border border-slate-250 rounded-lg text-xs font-bold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
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
