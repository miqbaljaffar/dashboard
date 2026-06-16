import React, { useState } from 'react';
import { Student, QuizTest, Assignment } from '../types';
import {
  BookOpen,
  Award,
  Calendar,
  AlertCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Percent,
  Plus,
  HelpCircle,
  FileCheck,
  ChevronRight
} from 'lucide-react';

interface AcademiaViewProps {
  students: Student[];
  quizzes: QuizTest[];
  assignments: Assignment[];
  onAddQuiz: (quiz: QuizTest) => void;
  onAddAssignment: (assignment: Assignment) => void;
  role: string;
}

export default function AcademiaView({
  students,
  quizzes,
  assignments,
  onAddQuiz,
  onAddAssignment,
  role
}: AcademiaViewProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<'quizzes' | 'assignments'>('quizzes');

  // Input states for creating assignments
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Homework' | 'Kanji Writing' | 'Vocabulary Memorization' | 'Conversation Recording' | 'Listening Exercise' | 'JLPT Practice'>('Kanji Writing');
  const [newDeadline, setNewDeadline] = useState('2026-06-20');
  const [newCohort, setNewCohort] = useState('Cohort 24');

  // Handle post
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const task: Assignment = {
      id: `HW-${String(assignments.length + 1).padStart(3, '0')}`,
      title: newTitle,
      type: newType,
      deadline: newDeadline,
      cohort: newCohort,
      totalStudents: students.filter(s => s.cohort === newCohort).length,
      submittedCount: 0,
      lateCount: 0
    };

    onAddAssignment(task);
    setNewTitle('');
  };

  // State to simulate a Quiz selection for "Question Analysis" drill down
  const [selectedQuizId, setSelectedQuizId] = useState('QUIZ-001');
  const activeQuiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0];

  return (
    <div className="space-y-6">
      
      {/* Header tab switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Academia & Training Master Panel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate mock Kanji quizzes, record listening, monitor Keigo, and distribute Japanese homework.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveSubTab('quizzes')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeSubTab === 'quizzes' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tests & Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveSubTab('assignments')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeSubTab === 'assignments' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Homework Hub ({assignments.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'quizzes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* List of Quizzes */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-5 shadow-3xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Japanese Aptitude Tests
              </h3>
              <span className="text-[10px] text-blue-600 font-mono">Select a row to parse mistakes</span>
            </div>

            <div className="space-y-3.5">
              {quizzes.map((q) => {
                const isSelected = q.id === selectedQuizId;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuizId(q.id)}
                    className={`p-4 border rounded-lg transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-blue-500 bg-linear-to-b from-blue-50/25 to-white ring-2 ring-blue-50' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded font-mono">
                          {q.type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{q.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Date: <strong className="font-semibold">{q.date}</strong> | Target: {q.cohort}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Avg passing</p>
                        <p className="text-base font-extrabold font-mono text-slate-900 mt-0.5">{q.averageScore}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100/60 text-center text-[10px] font-medium text-slate-500">
                      <div>Highest: <strong className="font-bold font-mono text-slate-700">{q.highestScore}%</strong></div>
                      <div>Lowest: <strong className="font-bold font-mono text-slate-700">{q.lowestScore}%</strong></div>
                      <div>Pass Rate: <strong className="font-bold font-mono text-green-600">{q.passRate}%</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drilldown details on Weak & Strong areas */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Question by question study analysis */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-2">
                Errant analysis: {activeQuiz?.title}
              </h3>

              <div className="space-y-3">
                {activeQuiz?.questionAnalysis.map((item, idx) => (
                  <div key={idx} className="text-xs p-3 rounded-md bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-start">
                      <strong className="text-slate-800 font-bold block">{item.question}</strong>
                      <span className={`font-mono font-bold px-1 rounded ${
                        item.correctPct >= 80 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                      }`}>
                        {item.correctPct}% OK
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                      <span>Concept Topic: <strong className="font-semibold text-slate-600">{item.topic}</strong></span>
                      <span>{item.correctPct < 70 ? '⚠️ High Fail rate' : '✅ Clear'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Cohort strengths and weaknesses */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-2">
                Vocabulary concepts breakdown
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-green-700 flex items-center gap-1.5 mb-2">
                    <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                    Concept Strengths (Nihongo Mastered)
                  </h4>
                  <div className="flex gap-1.5 flex-wrap">
                    {activeQuiz?.strongTopics.map((top, i) => (
                      <span key={i} className="text-[10px] bg-green-50 border border-green-100 text-green-700 rounded-sm font-semibold px-2 py-0.5">
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase font-bold text-red-700 flex items-center gap-1.5 mb-2">
                    <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                    Struggling Concepts (Need Reviews)
                  </h4>
                  <div className="flex gap-1.5 flex-wrap animate-pulse">
                    {activeQuiz?.weakTopics.map((top, i) => (
                      <span key={i} className="text-[10px] bg-red-50 border border-red-100 text-red-700 rounded-sm font-bold px-2 py-0.5">
                        {top}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* ASSIGNMENTS SUB-TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active Assignments and completion rates */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-2">
              Distributed Homework Sheets
            </h3>

            <div className="space-y-4">
              {assignments.map((ass) => {
                const completionPct = Math.round((ass.submittedCount / ass.totalStudents) * 100);
                
                return (
                  <div key={ass.id} className="p-4 border border-slate-200 rounded-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                      <div>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded font-mono">
                          {ass.type}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm mt-1">{ass.title}</h4>
                        <div className="flex gap-3 text-[11px] text-slate-500 mt-1">
                          <span>Cohort: <strong className="font-semibold text-slate-700">{ass.cohort}</strong></span>
                          <span>Deadline: <strong className="font-semibold text-slate-700">{ass.deadline}</strong></span>
                        </div>
                      </div>
                      
                      <div className="text-right md:w-36">
                        <span className="text-xs text-slate-400">Handed in</span>
                        <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                          {ass.submittedCount} / {ass.totalStudents} ({completionPct}%)
                        </p>
                      </div>
                    </div>

                    {/* Progress slider bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${completionPct}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-medium">
                      <span>Assigned to: {ass.totalStudents} candidates</span>
                      <span>Late Submissions: <strong className="text-amber-600">{ass.lateCount}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher Distribute Duty (Create Assignment) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-3xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-2 flex items-center gap-1.5">
              Distribute Homework Sheet
            </h3>

            {role === 'MANAGEMENT' ? (
              <p className="text-xs text-slate-400 py-3 leading-relaxed">
                As a Management observer, you possess read-only visibility for study assignments distributions.
              </p>
            ) : (
              <form onSubmit={handleCreateAssignment} className="space-y-4 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Homework Paper Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Write Genko Yoshi Lesson 18"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Task Subtype</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                  >
                    <option value="Homework">Homework Worksheet</option>
                    <option value="Kanji Writing">Kanji writing template</option>
                    <option value="Vocabulary Memorization">Vocab recitation checklist</option>
                    <option value="Conversation Recording">Conversation recording (Audio)</option>
                    <option value="Listening Exercise">Audio listening questionnaire</option>
                    <option value="JLPT Practice">JLPT sample mock exam booklets</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Cohort</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={newCohort}
                      onChange={(e) => setNewCohort(e.target.value)}
                    >
                      <option value="Cohort 23">Cohort 23</option>
                      <option value="Cohort 24">Cohort 24</option>
                      <option value="Cohort 25">Cohort 25</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium focus:outline-hidden"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Publish active Homework
                </button>
              </form>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
