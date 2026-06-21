import React, { useState, useEffect } from 'react';
import { Student, Assignment, GradeColumn } from '../types';
import {
  BookOpen,
  Award,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle,
  FileCheck,
  Search,
  Users,
  Calendar,
  AlertCircle,
  Printer
} from 'lucide-react';

interface AcademiaViewProps {
  students: Student[];
  assignments: Assignment[];
  grades: GradeColumn[];
  onCreateAssignment: (title: string, dueDate: string) => void;
  onUpdateAssignment: (id: string, title: string, dueDate: string) => void;
  onDeleteAssignment: (id: string) => void;
  onToggleSubmission: (submissionId: string, assignmentId: string, submitted: boolean) => void;
  onCreateGradeColumn: (title: string, type: 'Kuis' | 'Ulangan', date: string) => void;
  onUpdateGradeColumn: (id: string, title: string, date: string) => void;
  onDeleteGradeColumn: (id: string) => void;
  onUpdateStudentGrade: (gradeId: string, columnId: string, score: number | null) => void;
  onPrintClick?: () => void;
}

export default function AcademiaView({
  students,
  assignments,
  grades,
  onCreateAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onToggleSubmission,
  onCreateGradeColumn,
  onUpdateGradeColumn,
  onDeleteGradeColumn,
  onUpdateStudentGrade,
  onPrintClick
}: AcademiaViewProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<'assignments' | 'grades'>('assignments');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item states
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedGradeColId, setSelectedGradeColId] = useState<string | null>(null);

  // Form input states
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newGradeType, setNewGradeType] = useState<'Kuis' | 'Ulangan'>('Kuis');

  // Inline editing states for items (Assignments / Grade Columns)
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');

  // Local inputs state for student scores (for smooth typing)
  const [localScores, setLocalScores] = useState<{ [gradeId: string]: string }>({});

  // Selected details
  const activeAssignment = assignments.find(a => a.id === selectedAssignmentId);
  const activeGradeCol = grades.find(g => g.id === selectedGradeColId);

  // Sync local inputs when active grade column changes
  useEffect(() => {
    if (activeGradeCol?.scores) {
      const scoresMap: typeof localScores = {};
      activeGradeCol.scores.forEach(scoreObj => {
        scoresMap[scoreObj.id] = scoreObj.score !== null ? String(scoreObj.score) : '';
      });
      setLocalScores(scoresMap);
    }
  }, [activeGradeCol, grades]);

  // Handle creates
  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateAssignment(newTitle, newDate);
    setNewTitle('');
  };

  const handleCreateGradeColSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateGradeColumn(newTitle, newGradeType, newDate);
    setNewTitle('');
  };

  // Handle inline edits save
  const handleSaveEdit = (id: string, type: 'assignment' | 'grade') => {
    if (!editTitle.trim()) return;
    if (type === 'assignment') {
      onUpdateAssignment(id, editTitle, editDate);
    } else {
      onUpdateGradeColumn(id, editTitle, editDate);
    }
    setEditingItemId(null);
  };

  const startEditing = (id: string, title: string, date: string) => {
    setEditingItemId(id);
    setEditTitle(title);
    setEditDate(date);
  };

  // Score typing validation
  const handleScoreChange = (gradeId: string, value: string) => {
    if (value !== '' && !/^\d*[.,]?\d*$/.test(value)) return;
    
    const normalizedVal = parseFloat(value.replace(',', '.'));
    if (!isNaN(normalizedVal) && normalizedVal > 100) return;

    setLocalScores(prev => ({
      ...prev,
      [gradeId]: value
    }));
  };

  // Score save trigger
  const handleScoreBlur = (gradeId: string, currentScore: number | null, columnId: string) => {
    const localVal = localScores[gradeId] ?? '';
    const parsedVal = localVal === '' ? null : parseFloat(localVal.replace(',', '.'));

    if (currentScore === parsedVal) return;
    onUpdateStudentGrade(gradeId, columnId, parsedVal);
  };

  const handleScoreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, gradeId: string, currentScore: number | null, columnId: string) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  // Reset selected when tab changes
  useEffect(() => {
    setSelectedAssignmentId(null);
    setSelectedGradeColId(null);
    setEditingItemId(null);
  }, [activeSubTab]);

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('assignments')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'assignments' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4 text-blue-600" />
            Pengumpulan Tugas
          </button>
          <button
            onClick={() => setActiveSubTab('grades')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'grades' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="h-4 w-4 text-amber-500" />
            Nilai Kuis & Ulangan
          </button>
        </div>

        {/* Global Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end select-none">
          <button
            onClick={onPrintClick}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="h-4 w-4" />
            Cetak Nilai & Tugas
          </button>
        </div>
      </div>

      {/* Main Master-Detail Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LIST PANEL (MASTER) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Create Item Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase">
              {activeSubTab === 'assignments' ? 'Buat Tugas Baru' : 'Buat Kolom Kuis / Ulangan'}
            </h3>
            
            <form 
              onSubmit={activeSubTab === 'assignments' ? handleCreateAssignmentSubmit : handleCreateGradeColSubmit}
              className="space-y-4 mt-3"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Judul / Materi *</label>
                <input
                  type="text"
                  required
                  placeholder={activeSubTab === 'assignments' ? "Contoh: Menulis Kanji L12" : "Contoh: Kuis Hiragana L1"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {activeSubTab === 'grades' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jenis</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 cursor-pointer"
                      value={newGradeType}
                      onChange={(e) => setNewGradeType(e.target.value as any)}
                    >
                      <option value="Kuis">Kuis</option>
                      <option value="Ulangan">Ulangan</option>
                    </select>
                  </div>
                )}
                <div className={activeSubTab === 'assignments' ? "col-span-2" : "col-span-1"}>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {activeSubTab === 'assignments' ? 'Batas Waktu (Deadline)' : 'Tanggal'}
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-medium focus:outline-hidden"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Tambahkan
              </button>
            </form>
          </div>

          {/* List panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              {activeSubTab === 'assignments' ? 'Daftar Tugas Aktif' : 'Daftar Kuis & Ulangan'}
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {activeSubTab === 'assignments' ? (
                assignments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Belum ada tugas yang dibuat.</p>
                ) : (
                  assignments.map(a => {
                    const isSelected = selectedAssignmentId === a.id;
                    const isEditing = editingItemId === a.id;
                    
                    return (
                      <div
                        key={a.id}
                        onClick={() => !isEditing && setSelectedAssignmentId(a.id)}
                        className={`p-3 border rounded-lg transition-all flex flex-col gap-2 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50/20' 
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white cursor-pointer'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              className="w-full border border-slate-200 rounded-md p-1 text-xs"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                            />
                            <input
                              type="date"
                              className="w-full border border-slate-200 rounded-md p-1 text-xs"
                              value={editDate}
                              onChange={e => setEditDate(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="px-2 py-0.5 border border-slate-200 rounded text-[10px] text-slate-500 font-semibold"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => handleSaveEdit(a.id, 'assignment')}
                                className="px-2.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold flex items-center gap-0.5"
                              >
                                <Save className="h-3 w-3" /> Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-800 text-xs truncate">{a.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <Calendar className="h-3 w-3 shrink-0" />
                                DL: {a.dueDate}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                              <button 
                                onClick={() => startEditing(a.id, a.title, a.dueDate)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button 
                                onClick={() => {
                                  if(confirm('Hapus tugas ini? Semua status pengumpulan siswa akan hilang.')) {
                                    onDeleteAssignment(a.id);
                                    if(selectedAssignmentId === a.id) setSelectedAssignmentId(null);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )
              ) : (
                grades.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Belum ada kuis/ulangan yang dibuat.</p>
                ) : (
                  grades.map(g => {
                    const isSelected = selectedGradeColId === g.id;
                    const isEditing = editingItemId === g.id;
                    
                    return (
                      <div
                        key={g.id}
                        onClick={() => !isEditing && setSelectedGradeColId(g.id)}
                        className={`p-3 border rounded-lg transition-all flex flex-col gap-2 ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-50/10' 
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white cursor-pointer'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              className="w-full border border-slate-200 rounded-md p-1 text-xs"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                            />
                            <input
                              type="date"
                              className="w-full border border-slate-200 rounded-md p-1 text-xs"
                              value={editDate}
                              onChange={e => setEditDate(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="px-2 py-0.5 border border-slate-200 rounded text-[10px] text-slate-500 font-semibold"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => handleSaveEdit(g.id, 'grade')}
                                className="px-2.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold flex items-center gap-0.5"
                              >
                                <Save className="h-3 w-3" /> Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <span className={`text-[9px] font-bold px-1 rounded-sm ${
                                g.type === 'Kuis' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-violet-50 text-violet-700 border border-violet-100'
                              }`}>
                                {g.type}
                              </span>
                              <h4 className="font-bold text-slate-800 text-xs truncate mt-1">{g.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <Calendar className="h-3 w-3 shrink-0" />
                                {g.date}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                              <button 
                                onClick={() => startEditing(g.id, g.title, g.date)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button 
                                onClick={() => {
                                  if(confirm('Hapus kolom nilai ini? Semua nilai siswa didalamnya akan hilang.')) {
                                    onDeleteGradeColumn(g.id);
                                    if(selectedGradeColId === g.id) setSelectedGradeColId(null);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DETAILS SHEET (DETAIL) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs min-h-[400px] flex flex-col">
          
          {activeSubTab === 'assignments' ? (
            /* ASSIGNMENT SUBMISSIONS SHEET */
            !activeAssignment ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
                <div className="h-12 w-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">Pilih Tugas Terlebih Dahulu</h4>
                <p className="text-[10px] text-slate-400 max-w-[240px] mt-1 leading-normal">
                  Klik salah satu judul tugas di kolom kiri untuk menampilkan lembar presensi pengumpulan tugas siswa.
                </p>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="border-b border-slate-150 pb-3 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{activeAssignment.title}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Fuji Elite Class • Batas: {activeAssignment.dueDate}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Tugas Aktif
                  </span>
                </div>

                {/* Submissions Table */}
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-450 uppercase font-bold text-[9px] bg-slate-50/50">
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3 text-center w-40">Status Pengumpulan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.filter(s => s.status === 'Active').map(student => {
                        const sub = activeAssignment.submissions?.find(s => s.studentId === student.id);
                        
                        return (
                          <tr key={student.id} className="hover:bg-slate-55/20 transition-colors">
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-slate-900">{student.name}</p>
                              <p className="text-[10px] text-slate-455 font-mono">{student.id}</p>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {sub ? (
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={sub.submitted}
                                    onChange={() => onToggleSubmission(sub.id, activeAssignment.id, !sub.submitted)}
                                  />
                                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                  <span className="ml-2 text-[10px] font-semibold text-slate-500 w-16 text-left select-none">
                                    {sub.submitted ? 'Terkumpul' : 'Belum'}
                                  </span>
                                </label>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium italic">Record missing</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            /* GRADES AND SCORES SHEET */
            !activeGradeCol ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
                <div className="h-12 w-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3">
                  <Award className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">Pilih Kolom Nilai Terlebih Dahulu</h4>
                <p className="text-[10px] text-slate-400 max-w-[240px] mt-1 leading-normal">
                  Klik salah satu judul kuis/ulangan di kolom kiri untuk menampilkan lembar penginputan nilai siswa.
                </p>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="border-b border-slate-150 pb-3 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      [{activeGradeCol.type}] {activeGradeCol.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Fuji Elite Class • Tanggal: {activeGradeCol.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    activeGradeCol.type === 'Kuis' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-violet-50 text-violet-700 border-violet-100'
                  }`}>
                    {activeGradeCol.type}
                  </span>
                </div>

                {/* Scores Input Table */}
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-450 uppercase font-bold text-[9px] bg-slate-50/50">
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3 text-center w-40">Input Nilai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.filter(s => s.status === 'Active').map(student => {
                        const scoreObj = activeGradeCol.scores?.find(s => s.studentId === student.id);
                        const displayVal = scoreObj ? (localScores[scoreObj.id] ?? '') : '';

                        return (
                          <tr key={student.id} className="hover:bg-slate-55/20 transition-colors">
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-slate-900">{student.name}</p>
                              <p className="text-[10px] text-slate-455 font-mono">{student.id}</p>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {scoreObj ? (
                                <div className="inline-flex items-center gap-2">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="-"
                                    className="w-16 text-center py-1 bg-slate-50 border border-slate-200 rounded-md font-semibold font-mono text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                                    value={displayVal}
                                    onChange={(e) => handleScoreChange(scoreObj.id, e.target.value)}
                                    onBlur={() => handleScoreBlur(scoreObj.id, scoreObj.score, activeGradeCol.id)}
                                    onKeyDown={(e) => handleScoreKeyDown(e, scoreObj.id, scoreObj.score, activeGradeCol.id)}
                                  />
                                  <span className="text-[10px] font-bold text-slate-400 font-mono">/100</span>
                                  {displayVal !== (scoreObj.score !== null ? String(scoreObj.score) : '') && (
                                    <button
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleScoreBlur(scoreObj.id, scoreObj.score, activeGradeCol.id);
                                      }}
                                      className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition shadow-xs cursor-pointer"
                                    >
                                      Simpan
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium italic">Record missing</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}
