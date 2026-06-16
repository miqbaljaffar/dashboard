import React, { useState } from 'react';
import { Student, BehavioralIncidence, BehavioralReward } from '../types';
import {
  ShieldAlert,
  Frown,
  CheckCircle,
  Percent,
  Plus,
  Trash2,
  Bookmark,
  Calendar,
  AlertTriangle,
  User,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface DisciplineViewProps {
  students: Student[];
  incidents: BehavioralIncidence[];
  rewards: BehavioralReward[];
  onLogIncident: (incident: BehavioralIncidence) => void;
  onLogReward: (reward: BehavioralReward) => void;
  role: string;
}

export default function DisciplineView({
  students,
  incidents,
  rewards,
  onLogIncident,
  onLogReward,
  role
}: DisciplineViewProps) {
  
  const [activeTab, setActiveTab] = useState<'violations' | 'merits'>('violations');

  // Input states for reporting violations
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [violationCategory, setViolationCategory] = useState<'Late Wake Up' | 'Late Attendance' | 'Missing Prayer' | 'Room Not Clean' | 'Curfew Violation' | 'Missing Assignment' | 'Improper Conduct'>('Late Wake Up');
  const [violationSeverity, setViolationSeverity] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [violationNotes, setViolationNotes] = useState('');

  // Input states for reporting awards
  const [rewardStudentId, setRewardStudentId] = useState('');
  const [rewardCategory, setRewardCategory] = useState<'Perfect Attendance' | 'Excellent Academic Performance' | 'Leadership' | 'Cleanliness'>('Perfect Attendance');
  const [rewardNotes, setRewardNotes] = useState('');

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
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
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
    alert(`Violation logged: ${studentObj.name} behavior score reduced by -${ptsDeduct} points!`);
  };

  const handlePostReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardStudentId) return;

    const studentObj = students.find(s => s.id === rewardStudentId);
    if (!studentObj) return;

    const ptsAdded = rewardCategory === 'Leadership' ? 15 : 10;

    const report: BehavioralReward = {
      id: `REW-${String(rewards.length + 1).padStart(3, '0')}`,
      studentId: rewardStudentId,
      studentName: studentObj.name,
      date: new Date().toISOString().split('T')[0],
      category: rewardCategory,
      pointsAdded: ptsAdded,
      description: rewardNotes || 'Perfect discipline reward.'
    };

    onLogReward(report);
    setRewardNotes('');
    alert(`Merit points added: ${studentObj.name} behavior score restored by +${ptsAdded} points!`);
  };

  // Student list order by risk level (lowest behavior score first)
  const studentsSortedByScore = [...students].sort((a,b) => a.behaviorScore - b.behaviorScore);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-blue-600" />
            Discipline & Conduct Operations Panel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit candidate behavior files, enforce dormitory curfews, and distribute merit awards to outstanding student heads.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('violations')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'violations' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Misconduct Violations ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('merits')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'merits' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Merit Point Awards ({rewards.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LOG TILES & FEEDS */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeTab === 'violations' ? (
            /* INCIDENTS LIST BOARD */
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-3xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-2">
                Enforced Infractions Ledger
              </h3>

              <div className="space-y-3">
                {incidents.map((inc) => (
                  <div key={inc.id} className="p-4 border border-slate-200 rounded-md bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4 items-start">
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 rounded font-mono">
                          -{inc.pointsDeducted} PTS
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{inc.studentName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{inc.studentId}</span>
                      </div>
                      <p className="text-xs text-red-700 font-semibold mt-1">Ref: {inc.category}</p>
                      <p className="text-xs text-slate-600 mt-1">Action: <strong className="font-semibold text-slate-700">{inc.actionTaken}</strong></p>
                    </div>

                    <div className="text-right flex md:flex-col justify-between w-full md:w-32 items-center md:items-end">
                      <span className="text-[10px] text-slate-400 font-mono">{inc.date}</span>
                      <span className={`text-[10px] uppercase font-bold mt-1 px-1.5 py-0.5 rounded ${
                        inc.status === 'Escalated' ? 'bg-red-50 text-red-700 animate-pulse' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {inc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* REWARDS LIST BOARD */
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-3xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-2">
                Honors & Merits point Ledger
              </h3>

              <div className="space-y-3">
                {rewards.map((rew) => (
                  <div key={rew.id} className="p-4 border border-slate-200 rounded-md bg-linear-to-b from-white to-green-50/10 flex flex-col md:flex-row justify-between gap-4 items-start">
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 rounded font-mono">
                          +{rew.pointsAdded} PTS
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{rew.studentName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{rew.studentId}</span>
                      </div>
                      <p className="text-xs text-green-700 font-bold mt-1">Honor: {rew.category}</p>
                      <p className="text-xs text-slate-600 mt-1">{rew.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono">{rew.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC LOGGING FORMS */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-3xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-3">
              {activeTab === 'violations' ? 'Log New Misconduct Infraction' : 'Issue Merit Restorative points'}
            </h3>

            {role === 'TEACHER' ? (
              <p className="text-xs text-slate-400 py-3 block text-slate-500 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                ⚠️ Teacher Access Restricted: Classroom teachers are granted read-only visibility for housing/conduct scoring. Enforcing curfew infractions and merit restorative adjustments are handled by the <strong>Dormitory Supervisor</strong> or <strong>Administrator</strong>.
              </p>
            ) : activeTab === 'violations' ? (
              <form onSubmit={handlePostViolation} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                      <option value="">-- Choose Candidate --</option>
                      {students.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.id})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Violation Category</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
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
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Severity scale</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                        value={violationSeverity}
                        onChange={(e) => setViolationSeverity(e.target.value as any)}
                      >
                        <option value="Low">Low (-5 Pts)</option>
                        <option value="Medium">Medium (-10 Pts)</option>
                        <option value="High">High (-20 Pts)</option>
                      </select>
                    </div>
                    <div className="bg-red-50 p-2.5 rounded text-center border border-red-100 flex flex-col justify-center">
                      <span className="text-[10px] text-red-500 font-bold uppercase block leading-none">Auto-Deduction</span>
                      <strong className="text-red-700 text-lg font-mono font-extrabold mt-1">
                        -{getDeductionPoints(violationCategory, violationSeverity)} pts
                      </strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Notes / Actions taken</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-hidden"
                      placeholder="e.g. Memberikan teguran lisan di lobi asrama..."
                      value={violationNotes}
                      onChange={(e) => setViolationNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full p-2.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Log Infraction File
                  </button>
                </div>
              </form>
            ) : (
              /* AWARDS FORM */
              <form onSubmit={handlePostReward} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={rewardStudentId}
                      onChange={(e) => setRewardStudentId(e.target.value)}
                    >
                      <option value="">-- Choose Candidate --</option>
                      {students.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.id})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reward Category</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
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

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Award Description Notes</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-hidden"
                      placeholder="e.g. Memimpin pembersihan koridor asrama lantai 1..."
                      value={rewardNotes}
                      onChange={(e) => setRewardNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full p-2.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold shadow-xs transition mt-7 cursor-pointer"
                  >
                    Award Restorative merits
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* BEHAVIOR SCORE RANKINGS SUMMARY */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase flex items-center justify-between">
              <span>Behavior file scoreboard</span>
              <Bookmark className="h-4 w-4 text-slate-400" />
            </h3>

            <div className="space-y-3.5 mt-2">
              {studentsSortedByScore.map((st) => {
                const getRiskLabel = (score: number) => {
                  if (score >= 85) return { text: 'Healthy', style: 'text-green-700 bg-green-50 border-green-100' };
                  if (score >= 70 && score < 85) return { text: 'Warning', style: 'text-amber-700 bg-amber-50 border-amber-100' };
                  return { text: 'Critical', style: 'text-red-700 bg-red-50 border-red-100' };
                };
                const risk = getRiskLabel(st.behaviorScore);

                return (
                  <div key={st.id} className="text-xs flex justify-between items-center bg-slate-50/50 p-2 border border-slate-100/60 rounded">
                    <div>
                      <strong className="text-slate-800 block text-xs">{st.name}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {st.id}</span>
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
