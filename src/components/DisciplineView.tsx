import React, { useState } from 'react';
import { Student, BehavioralIncidence, BehavioralReward } from '../types';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Bookmark,
  Calendar,
  Printer
} from 'lucide-react';

interface DisciplineViewProps {
  students: Student[];
  incidents: BehavioralIncidence[];
  rewards: BehavioralReward[];
  onLogIncident: (incident: BehavioralIncidence) => void;
  onUpdateIncident: (id: string, data: Partial<BehavioralIncidence>) => void;
  onDeleteIncident: (id: string) => void;
  onLogReward: (reward: BehavioralReward) => void;
  onUpdateReward: (id: string, data: Partial<BehavioralReward>) => void;
  onDeleteReward: (id: string) => void;
  role: string;
  onPrintClick?: () => void;
}

export default function DisciplineView({
  students,
  incidents,
  rewards,
  onLogIncident,
  onUpdateIncident,
  onDeleteIncident,
  onLogReward,
  onUpdateReward,
  onDeleteReward,
  role,
  onPrintClick
}: DisciplineViewProps) {
  
  const [activeTab, setActiveTab] = useState<'violations' | 'merits'>('violations');

  // Create Form States
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [violationCategory, setViolationCategory] = useState<BehavioralIncidence['category']>('Late Wake Up');
  const [violationSeverity, setViolationSeverity] = useState<BehavioralIncidence['severity']>('Low');
  const [violationNotes, setViolationNotes] = useState('');

  const [rewardStudentId, setRewardStudentId] = useState('');
  const [rewardCategory, setRewardCategory] = useState<BehavioralReward['category']>('Perfect Attendance');
  const [rewardNotes, setRewardNotes] = useState('');

  // Inline Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<any>('');
  const [editSeverity, setEditSeverity] = useState<any>('Low');
  const [editNotes, setEditNotes] = useState('');
  const [editPoints, setEditPoints] = useState(5);
  const [editDate, setEditDate] = useState('');

  // Auto-deduct values based on violation type:
  const getDeductionPoints = (category: string, severity: string) => {
    switch (category) {
      case 'Curfew Violation': return 20;
      case 'Improper Conduct': return severity === 'High' ? 25 : 15;
      case 'Late Attendance': return 10;
      case 'Missing Prayer': return 10;
      case 'Late Wake Up': return 5;
      case 'Room Not Clean': return 5;
      case 'Missing Assignment': return 5;
      default: return 5;
    }
  };

  const handlePostViolation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    const studentObj = students.find(s => s.id === selectedStudentId);
    if (!studentObj) return;

    const ptsDeduct = getDeductionPoints(violationCategory, violationSeverity);

    const report: BehavioralIncidence = {
      id: `INC-${String(Date.now()).slice(-6)}`,
      studentId: selectedStudentId,
      studentName: studentObj.name,
      date: new Date().toISOString().split('T')[0],
      category: violationCategory,
      severity: violationSeverity,
      pointsDeducted: ptsDeduct,
      status: 'Active',
      actionTaken: violationNotes || 'Recorded under administrative file.'
    };

    onLogIncident(report);
    setViolationNotes('');
  };

  const handlePostReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardStudentId) return;

    const studentObj = students.find(s => s.id === rewardStudentId);
    if (!studentObj) return;

    const ptsAdded = rewardCategory === 'Leadership' ? 15 : 10;

    const report: BehavioralReward = {
      id: `REW-${String(Date.now()).slice(-6)}`,
      studentId: rewardStudentId,
      studentName: studentObj.name,
      date: new Date().toISOString().split('T')[0],
      category: rewardCategory,
      pointsAdded: ptsAdded,
      description: rewardNotes || 'Perfect discipline reward.'
    };

    onLogReward(report);
    setRewardNotes('');
  };

  const startEditingIncident = (inc: BehavioralIncidence) => {
    setEditingId(inc.id);
    setEditCategory(inc.category);
    setEditSeverity(inc.severity);
    setEditNotes(inc.actionTaken);
    setEditPoints(inc.pointsDeducted);
    setEditDate(inc.date);
  };

  const startEditingReward = (rew: BehavioralReward) => {
    setEditingId(rew.id);
    setEditCategory(rew.category);
    setEditNotes(rew.description);
    setEditPoints(rew.pointsAdded);
    setEditDate(rew.date);
  };

  const saveIncidentEdit = (id: string) => {
    onUpdateIncident(id, {
      category: editCategory,
      severity: editSeverity,
      actionTaken: editNotes,
      pointsDeducted: Number(editPoints),
      date: editDate
    });
    setEditingId(null);
  };

  const saveRewardEdit = (id: string) => {
    onUpdateReward(id, {
      category: editCategory,
      description: editNotes,
      pointsAdded: Number(editPoints),
      date: editDate
    });
    setEditingId(null);
  };

  const studentsSortedByScore = [...students].sort((a,b) => a.behaviorScore - b.behaviorScore);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-blue-600" />
            Kedisiplinan & Perilaku (Conduct Hub)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Audit perilaku siswa, masukkan berkas pelanggaran kedisiplinan, dan berikan penghargaan bagi siswa berprestasi.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 select-none">
          <button
            onClick={onPrintClick}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="h-4 w-4" />
            Cetak Catatan Perilaku
          </button>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => { setActiveTab('violations'); setEditingId(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'violations' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar Pelanggaran ({incidents.length})
            </button>
            <button
              onClick={() => { setActiveTab('merits'); setEditingId(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'merits' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar Penghargaan ({rewards.length})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LOG TILES & FEEDS */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeTab === 'violations' ? (
            /* INCIDENTS LIST BOARD */
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-2">
                Buku Catatan Pelanggaran Siswa
              </h3>

              <div className="space-y-3">
                {incidents.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Belum ada catatan pelanggaran.</p>
                ) : (
                  incidents.map((inc) => {
                    const isEditing = editingId === inc.id;

                    return (
                      <div key={inc.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/20 flex flex-col justify-between gap-3 items-stretch">
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kategori Pelanggaran</label>
                              <select
                                className="w-full border border-slate-200 rounded p-1.5"
                                value={editCategory}
                                onChange={e => setEditCategory(e.target.value as any)}
                              >
                                <option value="Late Wake Up">Late Wake Up (Tidur Lewat Jam 05:00)</option>
                                <option value="Late Attendance">Late Classroom Attendance (Meleset kuis)</option>
                                <option value="Missing Prayer">Missing Prayer Duty (Lalai Ibadah)</option>
                                <option value="Room Not Clean">Room Not Clean/Sanitary (Asrama kotor)</option>
                                <option value="Curfew Violation">Curfew Breach (Melanggar jam malam)</option>
                                <option value="Missing Assignment">Missing Academic Homework sheets</option>
                                <option value="Improper Conduct">Improper Conduct (Perilaku buruk/Etika)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Skala Keparahan</label>
                              <select
                                className="w-full border border-slate-200 rounded p-1.5"
                                value={editSeverity}
                                onChange={e => setEditSeverity(e.target.value as any)}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pengurangan Poin</label>
                              <input
                                type="number"
                                className="w-full border border-slate-200 rounded p-1"
                                value={editPoints}
                                onChange={e => setEditPoints(Number(e.target.value))}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal</label>
                              <input
                                type="date"
                                className="w-full border border-slate-200 rounded p-1"
                                value={editDate}
                                onChange={e => setEditDate(e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Catatan Pelanggaran</label>
                              <input
                                type="text"
                                className="w-full border border-slate-200 rounded p-1.5"
                                value={editNotes}
                                onChange={e => setEditNotes(e.target.value)}
                              />
                            </div>
                            <div className="col-span-2 flex gap-2 justify-end mt-1">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 border border-slate-200 rounded-lg text-xs text-slate-500 font-bold"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => saveIncidentEdit(inc.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <Save className="h-3.5 w-3.5" /> Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
                            <div>
                              <div className="flex gap-2 items-center">
                                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 rounded-sm font-mono">
                                  -{inc.pointsDeducted} PTS
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">{inc.studentName}</h4>
                                <span className="text-[10px] text-slate-450 font-mono">{inc.studentId}</span>
                              </div>
                              <p className="text-xs text-red-700 font-semibold mt-1.5">Kategori: {inc.category}</p>
                              <p className="text-xs text-slate-605 mt-1">Tindakan: <strong className="font-semibold text-slate-700">{inc.actionTaken}</strong></p>
                            </div>

                            <div className="flex justify-between items-center w-full md:w-auto shrink-0 gap-3 border-t md:border-t-0 border-slate-100 pt-2.5 md:pt-0">
                              <div className="text-right flex flex-col items-end">
                                <span className="text-[10px] text-slate-400 font-mono">{inc.date}</span>
                                <span className={`text-[9px] uppercase font-bold mt-1 px-1 py-0.5 rounded-sm ${
                                  inc.severity === 'High' ? 'bg-red-50 text-red-700' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {inc.severity}
                                </span>
                              </div>
                              
                              <div className="flex gap-1">
                                <button
                                  onClick={() => startEditingIncident(inc)}
                                  className="p-1 hover:bg-slate-100 hover:text-blue-600 rounded text-slate-400"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if(confirm('Hapus log pelanggaran ini? Poin perilaku siswa akan dikembalikan.')) {
                                      onDeleteIncident(inc.id);
                                    }
                                  }}
                                  className="p-1 hover:bg-slate-100 hover:text-red-650 rounded text-slate-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* REWARDS LIST BOARD */
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-2">
                Buku Catatan Penghargaan & Prestasi
              </h3>

              <div className="space-y-3">
                {rewards.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Belum ada catatan penghargaan.</p>
                ) : (
                  rewards.map((rew) => {
                    const isEditing = editingId === rew.id;

                    return (
                      <div key={rew.id} className="p-4 border border-slate-200 rounded-lg bg-green-50/5 flex flex-col justify-between gap-3 items-stretch">
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kategori Penghargaan</label>
                              <select
                                className="w-full border border-slate-200 rounded p-1.5"
                                value={editCategory}
                                onChange={e => setEditCategory(e.target.value as any)}
                              >
                                <option value="Perfect Attendance">Perfect Attendance (+10 Pts)</option>
                                <option value="Excellent Academic Performance">Outstanding Exams Study (+10 Pts)</option>
                                <option value="Leadership">Discipline Leadership / Hall Captain (+15 Pts)</option>
                                <option value="Cleanliness">Exemplary Cleanliness checklist (+10 Pts)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tambahan Poin</label>
                              <input
                                type="number"
                                className="w-full border border-slate-200 rounded p-1"
                                value={editPoints}
                                onChange={e => setEditPoints(Number(e.target.value))}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal</label>
                              <input
                                type="date"
                                className="w-full border border-slate-200 rounded p-1"
                                value={editDate}
                                onChange={e => setEditDate(e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Catatan Detail</label>
                              <input
                                type="text"
                                className="w-full border border-slate-200 rounded p-1.5"
                                value={editNotes}
                                onChange={e => setEditNotes(e.target.value)}
                              />
                            </div>
                            <div className="col-span-2 flex gap-2 justify-end mt-1">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 border border-slate-200 rounded-lg text-xs text-slate-500 font-bold"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => saveRewardEdit(rew.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <Save className="h-3.5 w-3.5" /> Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
                            <div>
                              <div className="flex gap-2 items-center">
                                <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 rounded-sm font-mono">
                                  +{rew.pointsAdded} PTS
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">{rew.studentName}</h4>
                                <span className="text-[10px] text-slate-450 font-mono">{rew.studentId}</span>
                              </div>
                              <p className="text-xs text-green-700 font-bold mt-1.5">Penghargaan: {rew.category}</p>
                              <p className="text-xs text-slate-605 mt-1">{rew.description}</p>
                            </div>

                            <div className="flex justify-between items-center w-full md:w-auto shrink-0 gap-3 border-t md:border-t-0 border-slate-100 pt-2.5 md:pt-0">
                              <span className="text-[10px] text-slate-400 font-mono">{rew.date}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => startEditingReward(rew)}
                                  className="p-1 hover:bg-slate-100 hover:text-blue-600 rounded text-slate-400"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if(confirm('Hapus log penghargaan ini? Poin perilaku siswa akan ditarik kembali.')) {
                                      onDeleteReward(rew.id);
                                    }
                                  }}
                                  className="p-1 hover:bg-slate-100 hover:text-red-650 rounded text-slate-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* DYNAMIC LOGGING FORMS */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-3">
              {activeTab === 'violations' ? 'Buat Laporan Pelanggaran Baru' : 'Berikan Penghargaan Baru'}
            </h3>

            {activeTab === 'violations' ? (
              <form onSubmit={handlePostViolation} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pilih Siswa *</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:bg-white"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {students.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.id})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori Pelanggaran</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:bg-white"
                      value={violationCategory}
                      onChange={(e) => setViolationCategory(e.target.value as any)}
                    >
                      <option value="Late Wake Up">Late Wake Up (Tidur Lewat Jam 05:00)</option>
                      <option value="Late Attendance">Late Classroom Attendance (Meleset kuis)</option>
                      <option value="Missing Prayer">Missing Prayer Duty (Lalai Ibadah)</option>
                      <option value="Room Not Clean">Room Not Clean/Sanitary (Asrama kotor)</option>
                      <option value="Curfew Violation">Curfew Breach (Melanggar jam malam)</option>
                      <option value="Missing Assignment">Missing Academic Homework sheets</option>
                      <option value="Improper Conduct">Improper Conduct (Perilaku buruk/Etika)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Skala Keparahan</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:bg-white"
                        value={violationSeverity}
                        onChange={(e) => setViolationSeverity(e.target.value as any)}
                      >
                        <option value="Low">Low (-5 Pts)</option>
                        <option value="Medium">Medium (-10 Pts)</option>
                        <option value="High">High (-20 Pts)</option>
                      </select>
                    </div>
                    <div className="bg-red-50 p-2 rounded-lg border border-red-100 flex flex-col justify-center text-center">
                      <span className="text-[10px] text-red-500 font-bold uppercase block leading-none">Pengurangan</span>
                      <strong className="text-red-700 text-lg font-mono font-extrabold mt-1">
                        -{getDeductionPoints(violationCategory, violationSeverity)} pts
                      </strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Detail Pelanggaran</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                      placeholder="Contoh: Terlambat masuk kelas pagi..."
                      value={violationNotes}
                      onChange={(e) => setViolationNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full p-2.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    Kirim Catatan Pelanggaran
                  </button>
                </div>
              </form>
            ) : (
              /* AWARDS FORM */
              <form onSubmit={handlePostReward} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pilih Siswa *</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:bg-white"
                      value={rewardStudentId}
                      onChange={(e) => setRewardStudentId(e.target.value)}
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {students.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.id})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori Penghargaan</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:bg-white"
                      value={rewardCategory}
                      onChange={(e) => setRewardCategory(e.target.value as any)}
                    >
                      <option value="Perfect Attendance">Perfect Attendance (+10 Pts)</option>
                      <option value="Excellent Academic Performance">Outstanding Exams Study (+10 Pts)</option>
                      <option value="Leadership">Discipline Leadership / Hall Captain (+15 Pts)</option>
                      <option value="Cleanliness">Exemplary Cleanliness checklist (+10 Pts)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Keterangan Penghargaan</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
                      placeholder="Contoh: Memimpin kelas belajar mandiri malam..."
                      value={rewardNotes}
                      onChange={(e) => setRewardNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full p-2.5 bg-green-650 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    Kirim Catatan Penghargaan
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* BEHAVIOR SCORE RANKINGS SUMMARY */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase flex items-center justify-between">
              <span>Papan Peringkat Poin Perilaku</span>
              <Bookmark className="h-4 w-4 text-slate-400" />
            </h3>

            <div className="space-y-3 mt-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {studentsSortedByScore.map((st) => {
                const getRiskLabel = (score: number) => {
                  if (score >= 85) return { text: 'Healthy', style: 'text-green-700 bg-green-50 border-green-100' };
                  if (score >= 70 && score < 85) return { text: 'Warning', style: 'text-amber-700 bg-amber-50 border-amber-100' };
                  return { text: 'Critical', style: 'text-red-700 bg-red-50 border-red-100' };
                };
                const risk = getRiskLabel(st.behaviorScore);

                return (
                  <div key={st.id} className="text-xs flex justify-between items-center bg-slate-50/50 p-2.5 border border-slate-100/60 rounded-lg">
                    <div>
                      <strong className="text-slate-800 block text-xs">{st.name}</strong>
                      <span className="text-[10px] text-slate-450 font-mono">ID: {st.id}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1 rounded-sm border ${risk.style}`}>
                        {risk.text}
                      </span>
                      <strong className="font-mono font-extrabold text-slate-950 text-xs">
                        {st.behaviorScore} pts
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
