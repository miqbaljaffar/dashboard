import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import {
  BookOpen,
  CheckSquare,
  Award,
  Users,
  Search,
  CheckCircle,
  FileCheck2,
  Trash
} from 'lucide-react';

interface AcademiaViewProps {
  students: Student[];
  onUpdateStudent: (student: Student) => void;
}

export default function AcademiaView({
  students,
  onUpdateStudent
}: AcademiaViewProps) {
  
  const [selectedCohort, setSelectedCohort] = useState('Cohort 24');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local states for inputs to make typing smooth without waiting for API roundtrips
  const [localScores, setLocalScores] = useState<{
    [studentId: string]: { quiz: string; exam: string }
  }>({});

  // Initialize/sync local input states when students list changes
  useEffect(() => {
    const newLocalScores: typeof localScores = {};
    students.forEach(s => {
      newLocalScores[s.id] = {
        quiz: s.quizScore !== null && s.quizScore !== undefined ? String(s.quizScore) : '',
        exam: s.examScore !== null && s.examScore !== undefined ? String(s.examScore) : ''
      };
    });
    setLocalScores(newLocalScores);
  }, [students]);

  // Filter students based on cohort and search query
  const cohortStudents = students.filter(s => 
    s.status === 'Active' && 
    s.cohort === selectedCohort &&
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Statistics calculations for the selected cohort
  const totalStudents = students.filter(s => s.status === 'Active' && s.cohort === selectedCohort).length;
  
  const activeCohortStudents = students.filter(s => s.status === 'Active' && s.cohort === selectedCohort);
  const submittedCount = activeCohortStudents.filter(s => s.assignmentSubmitted).length;
  const submissionRate = totalStudents ? Math.round((submittedCount / totalStudents) * 100) : 0;

  // Calculate averages (filtering out null scores)
  const studentsWithQuiz = activeCohortStudents.filter(s => s.quizScore !== null && s.quizScore !== undefined);
  const avgQuizScore = studentsWithQuiz.length
    ? Math.round(studentsWithQuiz.reduce((acc, s) => acc + (s.quizScore || 0), 0) / studentsWithQuiz.length)
    : 0;

  const studentsWithExam = activeCohortStudents.filter(s => s.examScore !== null && s.examScore !== undefined);
  const avgExamScore = studentsWithExam.length
    ? Math.round(studentsWithExam.reduce((acc, s) => acc + (s.examScore || 0), 0) / studentsWithExam.length)
    : 0;

  // Handler for assignment checkbox toggle
  const handleAssignmentToggle = (student: Student) => {
    const updated = {
      ...student,
      assignmentSubmitted: !student.assignmentSubmitted
    };
    onUpdateStudent(updated);
  };

  // Handler for text input change (updates local state only)
  const handleScoreInputChange = (studentId: string, type: 'quiz' | 'exam', value: string) => {
    // Only allow digits or empty string
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    // Allow up to 100
    if (value !== '' && parseInt(value) > 100) return;

    setLocalScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [type]: value
      }
    }));
  };

  // Handler to persist the score to the database (on blur or enter key)
  const persistScore = (student: Student, type: 'quiz' | 'exam') => {
    const localVal = localScores[student.id]?.[type] || '';
    const parsedVal = localVal === '' ? null : parseInt(localVal);
    
    // Check if the value actually changed
    const dbVal = type === 'quiz' ? student.quizScore : student.examScore;
    if (dbVal === parsedVal) return;

    const updated = {
      ...student,
      [type === 'quiz' ? 'quizScore' : 'examScore']: parsedVal
    };
    onUpdateStudent(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, student: Student, type: 'quiz' | 'exam') => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Tugas & Nilai (Academic Hub)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola pengumpulan tugas harian, nilai kuis, dan nilai ulangan/ujian untuk setiap siswa.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Cari siswa atau ID..."
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Cohort Selector */}
          <select
            className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 transition-colors cursor-pointer"
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
          >
            <option value="Cohort 23">Cohort 23</option>
            <option value="Cohort 24">Cohort 24</option>
            <option value="Cohort 25">Cohort 25</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Siswa Aktif</span>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{totalStudents}</h4>
            <p className="text-[9px] text-slate-500 mt-0.5">Terdaftar di {selectedCohort}</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Assignments Submitted */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tugas Terkumpul</span>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{submissionRate}%</h4>
            <p className="text-[9px] text-slate-500 mt-0.5">{submittedCount} dari {totalStudents} Siswa</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Quiz Average */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Rata-Rata Kuis</span>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{avgQuizScore || '-'}</h4>
            <p className="text-[9px] text-slate-500 mt-0.5">{studentsWithQuiz.length} siswa dinilai</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="h-5 w-5 text-amber-500" />
          </div>
        </div>

        {/* Card 4: Exam Average */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Rata-Rata Ulangan</span>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{avgExamScore || '-'}</h4>
            <p className="text-[9px] text-slate-500 mt-0.5">{studentsWithExam.length} siswa dinilai</p>
          </div>
          <div className="p-2.5 bg-violet-50 text-violet-600 rounded-lg">
            <FileCheck2 className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Main Student Grades Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        
        {/* Table Title Bar */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Lembar Penilaian & Tugas Siswa
          </h3>
          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
            Auto-save: perubahan disimpan saat keluar kolom (blur)
          </span>
        </div>

        {cohortStudents.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Tidak ada data siswa</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Tidak ditemukan siswa aktif untuk {selectedCohort} yang cocok dengan pencarian Anda.
            </p>
          </div>
        ) : (
          /* Students Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px] bg-slate-50/50 select-none">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center w-40">Pengumpulan Tugas</th>
                  <th className="py-3 px-4 text-center w-40">Nilai Kuis</th>
                  <th className="py-3 px-4 text-center w-40">Nilai Ulangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cohortStudents.map((st) => {
                  const studentQuiz = localScores[st.id]?.quiz ?? '';
                  const studentExam = localScores[st.id]?.exam ?? '';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/40 transition-colors">
                      
                      {/* Name Card */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-8 w-8 rounded-full font-bold flex items-center justify-center text-xs ${
                            st.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                          }`}>
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{st.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {st.id} • {st.classroom}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Assignment Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          <label className="relative flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={st.assignmentSubmitted}
                              onChange={() => handleAssignmentToggle(st)}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            <span className="ml-2 text-[10px] font-semibold text-slate-500 w-16 text-left select-none">
                              {st.assignmentSubmitted ? 'Terkumpul' : 'Belum'}
                            </span>
                          </label>
                        </div>
                      </td>

                      {/* Quiz Score Input */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="-"
                            className="w-16 text-center py-1 bg-slate-50 border border-slate-200 rounded-md font-semibold font-mono text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                            value={studentQuiz}
                            onChange={(e) => handleScoreInputChange(st.id, 'quiz', e.target.value)}
                            onBlur={() => persistScore(st, 'quiz')}
                            onKeyDown={(e) => handleKeyDown(e, st, 'quiz')}
                          />
                          <span className="text-[10px] font-bold text-slate-400 font-mono w-4">/100</span>
                        </div>
                      </td>

                      {/* Exam Score Input */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="-"
                            className="w-16 text-center py-1 bg-slate-50 border border-slate-200 rounded-md font-semibold font-mono text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                            value={studentExam}
                            onChange={(e) => handleScoreInputChange(st.id, 'exam', e.target.value)}
                            onBlur={() => persistScore(st, 'exam')}
                            onKeyDown={(e) => handleKeyDown(e, st, 'exam')}
                          />
                          <span className="text-[10px] font-bold text-slate-400 font-mono w-4">/100</span>
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

    </div>
  );
}
