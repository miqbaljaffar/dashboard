import React, { useState } from 'react';
import { Student, DailyReport } from '../types';
import {
  FileText,
  Clock,
  User,
  Heart,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Plus,
  Send,
  Sparkles,
  Check,
  TrendingUp,
  XCircle
} from 'lucide-react';

interface ReportsViewProps {
  students: Student[];
  reports: DailyReport[];
  onSubmitReport: (report: DailyReport) => void;
  onReviewReport: (reportId: string, status: 'Approved' | 'Flagged', comment: string) => void;
  role: string;
  selectedStudentId: string;
}

export default function ReportsView({
  students,
  reports,
  onSubmitReport,
  onReviewReport,
  role,
  selectedStudentId
}: ReportsViewProps) {
  
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Pending' | 'Approved' | 'Flagged'>('Pending');

  // Student form input states
  const [learnedToday, setLearnedToday] = useState('');
  const [difficultMaterial, setDifficultMaterial] = useState('');
  const [studyDuration, setStudyDuration] = useState(4);
  const [evaluation, setEvaluation] = useState(4);
  const [mood, setMood] = useState<'Excellent' | 'Good' | 'Neutral' | 'Tired' | 'Struggling'>('Good');
  const [tomorrowTarget, setTomorrowTarget] = useState('');

  // Comment input states for teacher reviews
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [teacherComment, setTeacherComment] = useState('');

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnedToday.trim() || !tomorrowTarget.trim()) return;

    const newReport: DailyReport = {
      id: `REP-${String(reports.length + 1).padStart(3, '0')}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      date: new Date().toISOString().split('T')[0],
      learnedToday,
      difficultMaterial: difficultMaterial || 'Tidak ada (None)',
      studyDurationHours: Number(studyDuration),
      selfEvaluation: Number(evaluation),
      mood,
      tomorrowTarget,
      status: 'Pending'
    };

    onSubmitReport(newReport);
    setLearnedToday('');
    setDifficultMaterial('');
    setTomorrowTarget('');
    alert('Laporan harian Anda (Nippou) berhasil dikirim untuk review Sensei!');
  };

  const handleApprove = (reportId: string) => {
    onReviewReport(reportId, 'Approved', teacherComment || 'Excellent self-evaluation. Keep up the high effort!');
    setActiveReviewId(null);
    setTeacherComment('');
  };

  const handleFlag = (reportId: string) => {
    onReviewReport(reportId, 'Flagged', teacherComment || 'Student displays declining mood or indicates severe difficulty. supervisor investigation requested.');
    setActiveReviewId(null);
    setTeacherComment('');
  };

  // Filter reports list based on active view/tab
  const visibleReports = reports.filter(r => filterStatus === 'ALL' || r.status === filterStatus);

  // Render mood color/icon helper
  const renderMoodBadge = (reportMood: string) => {
    switch (reportMood) {
      case 'Excellent': return <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">✨ Excellent</span>;
      case 'Good': return <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px]">🙂 Good</span>;
      case 'Neutral': return <span className="bg-slate-50 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px]">😐 Neutral</span>;
      case 'Tired': return <span className="bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded text-[10px]">🥱 Tired</span>;
      case 'Struggling': return <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded text-[10px] animate-pulse">😰 Struggling</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Daily Student Report Log (Nippou / 日報)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Japanese UTB Banjar standard for self-reflection. Candidates submit study summaries, difficulties, and mood trackers every night to establish discipline.
        </p>
      </div>

      {role === 'STUDENT' ? (
        /* STUDENT PORTAL SUBMITTER FORM */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-5 shadow-3xs">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Tulis Laporan Harian (Write Nippou) - {currentStudent?.name}
            </h3>

            <form onSubmit={handleStudentSubmit} className="space-y-4 mt-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Study hours */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Study Duration (Hours Today)</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-hidden"
                    value={studyDuration}
                    onChange={(e) => setStudyDuration(Number(e.target.value))}
                  />
                </div>

                {/* Self evaluation scale */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-semibold">Self-Evaluation (1 to 5)</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                    value={evaluation}
                    onChange={(e) => setEvaluation(Number(e.target.value))}
                  >
                    <option value="5">5 - Outstanding Effort</option>
                    <option value="4">4 - Good Progress</option>
                    <option value="3">3 - Standard Focus</option>
                    <option value="2">2 - Needs More Effort</option>
                    <option value="1">1 - Extremely Struggling</option>
                  </select>
                </div>

                {/* Mood selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Feelings / Mood Index</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                    value={mood}
                    onChange={(e) => setMood(e.target.value as any)}
                  >
                    <option value="Excellent">Excellent / Sangat Baik</option>
                    <option value="Good">Good / Cukup Baik</option>
                    <option value="Neutral">Neutral / Sedang</option>
                    <option value="Tired">Tired / Lelah</option>
                    <option value="Struggling">Struggling / Sulit</option>
                  </select>
                </div>

              </div>

              {/* Text Area 1: Learned Today */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">What did you learn today? *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Saya belajar Minna no Nihongo Bab 23 mengenai Ukemikei (Passive Form) serta menghafal 15 Kanji Kakekotoba..."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white resize-none"
                  value={learnedToday}
                  onChange={(e) => setLearnedToday(e.target.value)}
                />
              </div>

              {/* Text Area 2: Difficult material */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Difficult material / Questions (Materi Sulit)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Masih bingung membedakan Passive Form standard dengan Meiwaku no Ukemi (passive merugikan)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white resize-none"
                  value={difficultMaterial}
                  onChange={(e) => setDifficultMaterial(e.target.value)}
                />
              </div>

              {/* Text Area 3: Tomorrow's target */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tomorrow's target (Target Besok) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Mengerjakan PR menyusun frasa di lembar kerja Bab 23 dan menghafalkan vocabulary asrama..."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white resize-none"
                  value={tomorrowTarget}
                  onChange={(e) => setTomorrowTarget(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                Kirim Laporan Nippou ke Sensei
              </button>

            </form>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-4 shadow-3xs h-fit space-y-4">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              Why Nippou Matters (UX Rationale)
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Di Jepang, budaya <strong>Hou-Ren-So (Hokoku,連絡 Renraku,相談 Sodan)</strong> sangat dijunjung tinggi. Mengisi formulir ini melatih Anda untuk terbiasa melaporkan hasil kerja secara konsisten serta merefleksikan kelemahan belajar Anda kepada instruktur.
            </p>
          </div>

        </div>
      ) : (
        /* SENSEI / ADMINISTRATIVE REVIEW SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main reports list */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
            
            {/* Filter controls tab */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                Student reflections directory
              </h3>
              
              <div className="flex bg-slate-50 border border-slate-200 p-1 rounded">
                {['Pending', 'Approved', 'Flagged', 'ALL'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st as any)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                      filterStatus === st ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-4.5">
              {visibleReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No {filterStatus.toLowerCase()} Nippou reflections registered today.
                </div>
              ) : (
                visibleReports.map((rep) => (
                  <div key={rep.id} className="p-4 border border-slate-200 rounded-md space-y-3 relative hover:border-slate-300 transition">
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      {renderMoodBadge(rep.mood)}
                      {rep.status === 'Approved' ? (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          Approved
                        </span>
                      ) : rep.status === 'Flagged' ? (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                          ⚠️ Flagged
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                        {rep.studentName[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{rep.studentName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {rep.studentId} • Submitted: {rep.date}</p>
                      </div>
                    </div>

                    {/* Studied Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50/50 p-3 rounded-md">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight font-bold block">1. Today's Study Summary</span>
                        <p className="text-slate-700 leading-relaxed mt-1 font-medium">{rep.learnedToday}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight font-bold block text-red-600">2. Troubles / Difficult topics</span>
                        <p className="text-slate-700 leading-relaxed mt-1 font-medium">{rep.difficultMaterial}</p>
                      </div>
                    </div>

                    {/* Tomorrow target */}
                    <div className="text-xs bg-indigo-50/10 p-2.5 px-3 rounded-md border border-indigo-50/30">
                      <span className="text-[10px] text-indigo-400 uppercase tracking-tight font-bold block">3. Tomorrow's study target</span>
                      <p className="text-slate-700 leading-relaxed mt-1 font-medium">{rep.tomorrowTarget}</p>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                      <p className="flex gap-3">
                        <span>Self Rating: <strong className="font-semibold text-slate-700">{rep.selfEvaluation}/5</strong></span>
                        <span>Study duration: <strong className="font-semibold text-slate-700">{rep.studyDurationHours} Hrs</strong></span>
                      </p>
                    </div>

                    {/* Teacher comment if approved */}
                    {rep.teacherComment && (
                      <div className="bg-slate-50 border-l-2 border-slate-400 p-2.5 rounded-r-sm text-[11px] text-slate-600 flex gap-2 items-start mt-2">
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
                        <div>
                          <strong>Sensei Feedback:</strong> {rep.teacherComment}
                        </div>
                      </div>
                    )}

                    {rep.flaggedReason && (
                      <div className="bg-red-50 border-l-2 border-red-500 p-2.5 rounded-r-md text-[11px] text-red-800 flex gap-1.5 items-start mt-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <div>
                          <strong>Concern Flag Reason:</strong> {rep.flaggedReason}
                        </div>
                      </div>
                    )}

                    {/* Action toggles for Teacher/Admin */}
                    {rep.status === 'Pending' && role !== 'MANAGEMENT' && (
                      <div className="pt-2 border-t border-slate-100 flex gap-2 justify-end">
                        {activeReviewId === rep.id ? (
                          <div className="w-full flex flex-col gap-2 bg-slate-50 p-3 rounded-md mt-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Write feedback comment *</label>
                            <input
                              type="text"
                              placeholder="e.g. Keep up the high effort, the parsing particle NI is correctly utilized."
                              className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs focus:outline-hidden"
                              value={teacherComment}
                              onChange={(e) => setTeacherComment(e.target.value)}
                            />
                            <div className="flex justify-end gap-2 mt-1">
                              <button
                                onClick={() => setActiveReviewId(null)}
                                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleFlag(rep.id)}
                                className="bg-red-50 text-red-700 hover:bg-red-100 text-[10px] font-bold px-2.5 py-1 rounded border border-red-100 flex items-center gap-1 cursor-pointer"
                              >
                                Flag as Concern
                              </button>
                              <button
                                onClick={() => handleApprove(rep.id)}
                                className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-3 py-1 rounded shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                Approve report
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            id={`btn-review-${rep.id}`}
                            onClick={() => {
                              setActiveReviewId(rep.id);
                              setTeacherComment('');
                            }}
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded px-3 py-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            Add Critique & Review
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>
          </div>

          {/* Side analytics */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1 uppercase">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Reflective consistency stats
              </h3>

              <div className="space-y-3 text-xs leading-none">
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Submissions consistency</p>
                  <p className="text-base font-extrabold text-slate-900 mt-1">94.8%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Daily study average</p>
                  <p className="text-base font-extrabold text-slate-900 mt-1">4.6 Hours / Day</p>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Active warning flags</p>
                  <p className="text-base font-extrabold text-red-600 mt-1">
                    {reports.filter(r => r.status === 'Flagged').length} Students
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
