import React, { useState, useEffect, useMemo } from 'react';
import { Student, GradeColumn } from '../types';
import {
  Award,
  Plus,
  Trash2,
  Edit,
  Save,
  Printer,
  Calendar,
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  CheckCheck,
  Sparkles,
  BarChart2
} from 'lucide-react';

interface AcademiaViewProps {
  students: Student[];
  grades: GradeColumn[];
  onCreateGradeColumn: (title: string, type: 'Kuis' | 'Ulangan', date: string) => void;
  onUpdateGradeColumn: (id: string, title: string, date: string) => void;
  onDeleteGradeColumn: (id: string) => void;
  onUpdateStudentGrade: (gradeId: string, columnId: string, score: number | null) => void;
  onPrintClick?: () => void;
}

export default function AcademiaView({
  students,
  grades,
  onCreateGradeColumn,
  onUpdateGradeColumn,
  onDeleteGradeColumn,
  onUpdateStudentGrade,
  onPrintClick
}: AcademiaViewProps) {
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Kuis' | 'Ulangan'>('all');
  const [scoreStatusFilter, setScoreStatusFilter] = useState<'all' | 'remedial' | 'unrated'>('all');

  // Selected Grade Column State
  const [selectedGradeColId, setSelectedGradeColId] = useState<string | null>(null);

  // Form input states for creating new column
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newGradeType, setNewGradeType] = useState<'Kuis' | 'Ulangan'>('Kuis');

  // Inline editing states for Grade Columns
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');

  // Local inputs state for student scores (for smooth typing)
  const [localScores, setLocalScores] = useState<{ [gradeId: string]: string }>({});

  // Feedback Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Active Grade Column Details
  const activeGradeCol = useMemo(() => {
    return grades.find(g => g.id === selectedGradeColId);
  }, [grades, selectedGradeColId]);

  // Master List Filtered Grade Columns
  const filteredGradeCols = useMemo(() => {
    if (categoryFilter === 'all') return grades;
    return grades.filter(g => g.type === categoryFilter);
  }, [grades, categoryFilter]);

  // Sync local inputs when active grade column changes
  useEffect(() => {
    if (activeGradeCol?.scores) {
      const scoresMap: typeof localScores = {};
      activeGradeCol.scores.forEach(scoreObj => {
        scoresMap[scoreObj.id] = scoreObj.score !== null ? String(scoreObj.score) : '';
      });
      setLocalScores(scoresMap);
    }
  }, [activeGradeCol]);

  // Active Grade Column Analytics Calculation
  const activeColumnAnalytics = useMemo(() => {
    if (!activeGradeCol || !activeGradeCol.scores) {
      return { avg: 0, max: 0, min: 0, passed: 0, remedial: 0, unrated: 0, total: 0 };
    }

    const activeStudents = students.filter(s => s.status === 'Active');
    let sum = 0;
    let count = 0;
    let max = -Infinity;
    let min = Infinity;
    let passed = 0;
    let remedial = 0;
    let unrated = 0;

    activeStudents.forEach(student => {
      const scoreObj = activeGradeCol.scores?.find(s => s.studentId === student.id);
      if (!scoreObj || scoreObj.score === null || scoreObj.score === undefined) {
        unrated++;
      } else {
        const score = scoreObj.score;
        sum += score;
        count++;
        if (score > max) max = score;
        if (score < min) min = score;

        if (score >= 75) passed++;
        else remedial++;
      }
    });

    return {
      avg: count > 0 ? parseFloat((sum / count).toFixed(1)) : 0,
      max: count > 0 ? max : 0,
      min: count > 0 ? min : 0,
      passed,
      remedial,
      unrated,
      total: activeStudents.length
    };
  }, [activeGradeCol, students]);

  // Filtered Students List for Score Sheet
  const filteredStudents = useMemo(() => {
    let list = students.filter(s => s.status === 'Active');

    // Filter by Search Query (Name or ID)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    }

    // Filter by Score Status
    if (activeGradeCol && scoreStatusFilter !== 'all') {
      list = list.filter(student => {
        const scoreObj = activeGradeCol.scores?.find(s => s.studentId === student.id);
        const displayVal = scoreObj ? (localScores[scoreObj.id] ?? '') : '';
        const parsedScore = displayVal === '' ? null : parseFloat(displayVal.replace(',', '.'));

        if (scoreStatusFilter === 'remedial') {
          return parsedScore !== null && !isNaN(parsedScore) && parsedScore < 75;
        }
        if (scoreStatusFilter === 'unrated') {
          return parsedScore === null || isNaN(parsedScore);
        }
        return true;
      });
    }

    return list;
  }, [students, searchQuery, activeGradeCol, scoreStatusFilter, localScores]);

  // Submit Handler for New Grade Column
  const handleCreateGradeColSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateGradeColumn(newTitle, newGradeType, newDate);
    setNewTitle('');
    setToastMessage(`Kolom ${newGradeType} "${newTitle}" berhasil ditambahkan!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Save Edit for Grade Column Metadata
  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    onUpdateGradeColumn(id, editTitle, editDate);
    setEditingItemId(null);
    setToastMessage('Perubahan kolom berhasil disimpan!');
    setTimeout(() => setToastMessage(null), 3000);
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

  // Score Blur / Save Trigger
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

  // Bulk Save All Scores for Active Column
  const handleBulkSave = () => {
    if (!activeGradeCol || !activeGradeCol.scores) return;

    let saveCount = 0;
    activeGradeCol.scores.forEach(scoreObj => {
      const localVal = localScores[scoreObj.id] ?? '';
      const parsedVal = localVal === '' ? null : parseFloat(localVal.replace(',', '.'));
      if (scoreObj.score !== parsedVal) {
        onUpdateStudentGrade(scoreObj.id, activeGradeCol.id, parsedVal);
        saveCount++;
      }
    });

    setToastMessage(saveCount > 0 ? `${saveCount} nilai siswa berhasil disimpan!` : 'Semua nilai sudah tersimpan.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Export Active Column Data to CSV
  const handleExportColumnCSV = () => {
    if (!activeGradeCol) return;

    const headers = ['ID Siswa', 'Nama Siswa', 'Materi', 'Tipe', 'Tanggal', 'Nilai', 'Status KKM'];
    const activeStudentsList = students.filter(s => s.status === 'Active');

    const rows = activeStudentsList.map(student => {
      const scoreObj = activeGradeCol.scores?.find(s => s.studentId === student.id);
      const displayVal = scoreObj ? (localScores[scoreObj.id] ?? '') : '';
      const parsedScore = displayVal === '' ? null : parseFloat(displayVal.replace(',', '.'));
      const statusKkm = parsedScore === null || isNaN(parsedScore) ? 'Belum Ada Nilai' : parsedScore >= 75 ? 'LULUS' : 'REMEDIAL';

      return [
        student.id,
        `"${student.name.replace(/"/g, '""')}"`,
        `"${activeGradeCol.title.replace(/"/g, '""')}"`,
        activeGradeCol.type,
        activeGradeCol.date,
        parsedScore !== null && !isNaN(parsedScore) ? parsedScore : '-',
        statusKkm
      ].join(',');
    });

    const csvString = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nilai_${activeGradeCol.title.replace(/[^a-zA-Z0-9_]/g, '_')}_${activeGradeCol.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Manajemen Nilai Akademik Kuis & Ulangan
          </h2>
          <p className="text-xs text-slate-500 mt-1">Kelola pembuatan materi penilaian, evaluasi KKM, dan input nilai siswa UTB Banjar.</p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end select-none">
          {activeGradeCol && (
            <button
              onClick={handleExportColumnCSV}
              title="Unduh Laporan Nilai Kolom Ini ke CSV"
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer shadow-2xs no-print"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Export CSV Materi
            </button>
          )}

          <button
            onClick={onPrintClick}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition duration-200 flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="h-4 w-4" />
            Cetak Nilai Akademik
          </button>
        </div>
      </div>

      {/* Main Master-Detail Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LIST PANEL (MASTER) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Form Create New Grade Column Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-blue-600" />
              Buat Kolom Kuis / Ulangan Baru
            </h3>
            
            <form 
              onSubmit={handleCreateGradeColSubmit}
              className="space-y-3.5 mt-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Judul / Materi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kuis Hiragana L1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Jenis Penilaian</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:bg-white"
                    value={newGradeType}
                    onChange={(e) => setNewGradeType(e.target.value as any)}
                  >
                    <option value="Kuis">📝 Kuis (Formatif)</option>
                    <option value="Ulangan">🎓 Ulangan (Sumatif)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-medium focus:outline-none focus:bg-white"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Tambahkan Kolom Nilai
              </button>
            </form>
          </div>

          {/* Master List panel with Category Filter Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Daftar Penilaian
              </h3>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Total: {filteredGradeCols.length}
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex border-b border-slate-200 select-none">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`py-1.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Semua ({grades.length})
              </button>
              <button
                onClick={() => setCategoryFilter('Kuis')}
                className={`py-1.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  categoryFilter === 'Kuis'
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                📝 Kuis ({grades.filter(g => g.type === 'Kuis').length})
              </button>
              <button
                onClick={() => setCategoryFilter('Ulangan')}
                className={`py-1.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  categoryFilter === 'Ulangan'
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                🎓 Ulangan ({grades.filter(g => g.type === 'Ulangan').length})
              </button>
            </div>

            {/* Grade Columns Scrollable List */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar">
              {filteredGradeCols.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-xs font-bold">Tidak ada data kuis/ulangan 📊</p>
                  <p className="text-xs mt-1">Buat kolom nilai baru menggunakan form di atas.</p>
                </div>
              ) : (
                filteredGradeCols.map(g => {
                  const isSelected = selectedGradeColId === g.id;
                  const isEditing = editingItemId === g.id;
                  
                  return (
                    <div
                      key={g.id}
                      onClick={() => !isEditing && setSelectedGradeColId(g.id)}
                      className={`p-3 border rounded-xl transition duration-200 flex flex-col gap-2 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/30' 
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white cursor-pointer'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-md p-1.5 text-xs font-bold"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                          />
                          <input
                            type="date"
                            className="w-full border border-slate-200 rounded-md p-1.5 text-xs font-medium"
                            value={editDate}
                            onChange={e => setEditDate(e.target.value)}
                          />
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="px-2.5 py-1 border border-slate-200 rounded-md text-xs text-slate-500 font-semibold cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSaveEdit(g.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="h-3.5 w-3.5" /> Simpan
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                                g.type === 'Kuis' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-violet-50 text-violet-700 border border-violet-200'
                              }`}>
                                {g.type}
                              </span>
                              <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                <Calendar className="h-3 w-3 shrink-0" />
                                {g.date}
                              </p>
                            </div>
                            <h4 className="font-bold text-slate-900 text-xs truncate mt-1.5">{g.title}</h4>
                          </div>
                          <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => startEditing(g.id, g.title, g.date)}
                              title="Edit Judul/Tanggal"
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                if(confirm('Hapus kolom nilai ini? Semua nilai siswa didalamnya akan hilang.')) {
                                  onDeleteGradeColumn(g.id);
                                  if(selectedGradeColId === g.id) setSelectedGradeColId(null);
                                }
                              }}
                              title="Hapus Kolom Nilai"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DETAILS SHEET (DETAIL INPUT & ANALYTICS) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs min-h-[450px] flex flex-col justify-between">
          
          {!activeGradeCol ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
              <div className="h-14 w-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3">
                <Award className="h-7 w-7 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Pilih Kolom Nilai Terlebih Dahulu</h4>
              <p className="text-xs text-slate-400 max-w-[260px] mt-1 leading-relaxed">
                Klik salah satu materi kuis atau ulangan di sebelah kiri untuk membuka lembar penginputan nilai siswa dan analisis KKM.
              </p>
            </div>
          ) : (
            <div className="space-y-5 flex-1 flex flex-col">
              
              {/* Active Column Header Banner */}
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${
                      activeGradeCol.type === 'Kuis' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-violet-50 text-violet-700 border-violet-200'
                    }`}>
                      {activeGradeCol.type}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {activeGradeCol.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-1">Fuji Elite Class • Tanggal Pelaksanaan: {activeGradeCol.date}</p>
                </div>

                <div className="flex items-center gap-2 select-none">
                  <button
                    onClick={handleBulkSave}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-2xs transition duration-200 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Simpan Semua Nilai
                  </button>
                </div>
              </div>

              {/* ACTIVE COLUMN MINI ANALYTICS CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rata-Rata Kelas</p>
                  <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">{activeColumnAnalytics.avg || '-'}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Target KKM: <strong>75</strong></p>
                </div>
                
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Maks / Min</p>
                  <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                    {activeColumnAnalytics.max} <span className="text-slate-400 font-normal text-xs">/ {activeColumnAnalytics.min}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sebaran Nilai</p>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-200/80 p-3 rounded-xl">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Tuntas (≥75)
                  </p>
                  <p className="text-xl font-extrabold text-emerald-800 font-mono mt-1">{activeColumnAnalytics.passed} Siswa</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    {activeColumnAnalytics.total > 0 ? Math.round((activeColumnAnalytics.passed / activeColumnAnalytics.total) * 100) : 0}% Kelulusan
                  </p>
                </div>

                <div className="bg-rose-50/50 border border-rose-200/80 p-3 rounded-xl">
                  <p className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Remedial (&lt;75)
                  </p>
                  <p className="text-xl font-extrabold text-rose-800 font-mono mt-1">{activeColumnAnalytics.remedial} Siswa</p>
                  <p className="text-[11px] text-rose-600 mt-0.5">Butuh bimbingan ulang</p>
                </div>
              </div>

              {/* SEARCH & SCORE FILTER BAR */}
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

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-slate-500">Filter Status:</span>
                  <select
                    value={scoreStatusFilter}
                    onChange={(e) => setScoreStatusFilter(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">📊 Semua Siswa ({students.filter(s => s.status === 'Active').length})</option>
                    <option value="remedial">⚠️ Remedial (&lt;75)</option>
                    <option value="unrated">📝 Belum Dinilai</option>
                  </select>
                </div>
              </div>

              {/* Scores Input Table Sheet */}
              <div className="overflow-x-auto flex-1 border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-xs bg-slate-50">
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4 text-center w-52">Input Nilai Siswa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-slate-400 text-xs font-semibold">
                          Tidak ada siswa yang sesuai dengan pencarian / filter status.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => {
                        const scoreObj = activeGradeCol.scores?.find(s => s.studentId === student.id);
                        const displayVal = scoreObj ? (localScores[scoreObj.id] ?? '') : '';
                        const parsedScore = displayVal === '' ? null : parseFloat(displayVal.replace(',', '.'));

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900 text-xs">{student.name}</p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{student.id}</p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {scoreObj ? (
                                <div className="inline-flex items-center gap-2">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="-"
                                    className={`w-16 text-center py-1 border rounded-lg font-bold font-mono text-xs transition-colors focus:outline-none focus:bg-white ${
                                      parsedScore !== null && !isNaN(parsedScore)
                                        ? parsedScore >= 75
                                          ? 'bg-emerald-50/40 border-emerald-300 text-emerald-800 focus:border-emerald-500'
                                          : 'bg-rose-50/40 border-rose-300 text-rose-800 focus:border-rose-500'
                                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'
                                    }`}
                                    value={displayVal}
                                    onChange={(e) => handleScoreChange(scoreObj.id, e.target.value)}
                                    onBlur={() => handleScoreBlur(scoreObj.id, scoreObj.score, activeGradeCol.id)}
                                    onKeyDown={(e) => handleScoreKeyDown(e, scoreObj.id, scoreObj.score, activeGradeCol.id)}
                                  />
                                  <span className="text-xs font-bold text-slate-400 font-mono">/100</span>
                                  {parsedScore !== null && !isNaN(parsedScore) && (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-extrabold border transition-all ${
                                      parsedScore >= 75
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}>
                                      {parsedScore >= 75 ? 'LULUS' : 'REMEDIAL'}
                                    </span>
                                  )}
                                  {displayVal !== (scoreObj.score !== null ? String(scoreObj.score) : '') && (
                                    <button
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleScoreBlur(scoreObj.id, scoreObj.score, activeGradeCol.id);
                                      }}
                                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition shadow-2xs cursor-pointer"
                                    >
                                      Simpan
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium italic">Record missing</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
