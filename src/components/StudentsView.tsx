import React, { useState } from 'react';
import { Student } from '../types';
import {
  Search,
  Filter,
  UserPlus,
  BookOpen,
  Phone,
  Home,
  FileEdit,
  GraduationCap,
  Sparkles,
  HelpCircle,
  AlertOctagon,
  X,
  Plus
} from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  role: string;
}

export default function StudentsView({ students, onAddStudent, onUpdateStudent, role }: StudentsViewProps) {
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [cohortFilter, setCohortFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [sswFilter, setSswFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form Fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'Male' | 'Female'>('Male');
  const [formAge, setFormAge] = useState(20);
  const [formCohort, setFormCohort] = useState('Cohort 24');
  const [formClassroom, setFormClassroom] = useState('Sakura Class');
  const [formEnrollment, setFormEnrollment] = useState('2026-01-10');
  const [formGraduation, setFormGraduation] = useState('2026-08-30');
  const [formJlptTarget, setFormJlptTarget] = useState<'N5' | 'N4' | 'N3' | 'N2' | 'N1'>('N4');
  const [formJlptCurrent, setFormJlptCurrent] = useState<'None' | 'N5' | 'N4' | 'N3' | 'N2'>('N5');
  const [formJftTarget, setFormJftTarget] = useState<'JFT-Basic' | 'None'>('None');
  const [formSswField, setFormSswField] = useState<'Caregiver' | 'Food Service' | 'Agriculture' | 'Construction' | 'Manufacture' | 'None'>('Caregiver');
  const [formInterview, setFormInterview] = useState<'Ready' | 'In Progress' | 'Not Ready'>('Not Ready');
  const [formParent, setFormParent] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRelationship, setFormRelationship] = useState('Father');
  const [formDormBuilding, setFormDormBuilding] = useState('Fuji Hall');
  const [formDormRoom, setFormDormRoom] = useState('Room 101');
  const [formDormBed, setFormDormBed] = useState(1);
  const [formStatus, setFormStatus] = useState<'Active' | 'Graduated' | 'Leave' | 'Dropped'>('Active');

  const openAddModal = () => {
    setEditingStudent(null);
    const nextIdNum = students.length + 1;
    setFormId(`UTB-2026-${String(nextIdNum).padStart(3, '0')}`);
    setFormName('');
    setFormGender('Male');
    setFormAge(21);
    setFormCohort('Cohort 24');
    setFormClassroom('Sakura Class');
    setFormEnrollment('2026-01-10');
    setFormGraduation('2026-08-30');
    setFormJlptTarget('N4');
    setFormJlptCurrent('None');
    setFormJftTarget('None');
    setFormSswField('Caregiver');
    setFormInterview('Not Ready');
    setFormParent('');
    setFormPhone('');
    setFormRelationship('Father');
    setFormDormBuilding('Fuji Hall');
    setFormDormRoom('Room 101');
    setFormDormBed(1);
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormId(student.id);
    setFormName(student.name);
    setFormGender(student.gender);
    setFormAge(student.age);
    setFormCohort(student.cohort);
    setFormClassroom(student.classroom);
    setFormEnrollment(student.enrollmentDate);
    setFormGraduation(student.graduationTarget);
    setFormJlptTarget(student.jlptTarget);
    setFormJlptCurrent(student.currentJlptLevel);
    setFormJftTarget(student.jftTarget);
    setFormSswField(student.sswField);
    setFormInterview(student.interviewReadiness);
    setFormParent(student.emergencyContactName.split(' ')[0] || '');
    setFormPhone(student.emergencyContactPhone);
    setFormRelationship(student.relationship);
    setFormDormBuilding(student.dormBuilding);
    setFormDormRoom(student.dormRoom);
    setFormDormBed(student.dormBed);
    setFormStatus(student.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const studentData: Student = {
      id: formId,
      name: formName,
      gender: formGender,
      age: Number(formAge),
      cohort: formCohort,
      classroom: formClassroom,
      enrollmentDate: formEnrollment,
      graduationTarget: formGraduation,
      jlptTarget: formJlptTarget,
      currentJlptLevel: formJlptCurrent,
      jftTarget: formJftTarget,
      sswField: formSswField,
      interviewReadiness: formInterview,
      emergencyContactName: `${formParent} (${formRelationship})`,
      emergencyContactPhone: formPhone,
      relationship: formRelationship,
      dormBuilding: formDormBuilding,
      dormRoom: formDormRoom,
      dormBed: Number(formDormBed),
      status: formStatus,
      // Carry existing values if updating, otherwise default
      behaviorScore: editingStudent ? editingStudent.behaviorScore : 95,
      attendanceRate: editingStudent ? editingStudent.attendanceRate : 0.95,
      quizAverage: editingStudent ? editingStudent.quizAverage : 80.0,
      missingAssignmentsCount: editingStudent ? editingStudent.missingAssignmentsCount : 0,
      violationsCount: editingStudent ? editingStudent.violationsCount : 0,
      progressTrend: editingStudent ? editingStudent.progressTrend : 'Stable'
    };

    if (editingStudent) {
      onUpdateStudent(studentData);
    } else {
      onAddStudent(studentData);
    }
    setIsModalOpen(false);
  };

  // Perform client-side filter and search
  const filteredStudents = students.filter(student => {
    // Search match
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.classroom.toLowerCase().includes(searchQuery.toLowerCase());

    // Cohort match
    const matchesCohort = cohortFilter === 'ALL' || student.cohort === cohortFilter;

    // Status match
    const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;

    // SSW match
    const matchesSsw = sswFilter === 'ALL' || student.sswField === sswFilter;

    // Risk match ("YES" filters for attendance < 0.85 OR quiz < 70 OR missing > 3)
    const isAtRisk = student.attendanceRate < 0.82 || student.quizAverage < 70 || student.missingAssignmentsCount > 2;
    const matchesRisk = riskFilter === 'ALL' || 
                        (riskFilter === 'RISK' && isAtRisk) || 
                        (riskFilter === 'HEALTHY' && !isAtRisk);

    return matchesSearch && matchesCohort && matchesStatus && matchesSsw && matchesRisk;
  });

  const getCohortList = () => {
    const cohorts = new Set(students.map(s => s.cohort));
    return ['ALL', ...Array.from(cohorts)];
  };

  const getSswList = () => {
    const fields = new Set(students.map(s => s.sswField));
    return ['ALL', ...Array.from(fields)];
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Student Master Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage comprehensive Japanese prep training profiles, emergency guardian networks, and housing occupancy locks.
          </p>
        </div>
        
        {role !== 'MANAGEMENT' && (
          <button
            id="btn-add-student"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Add New Student
          </button>
        )}
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-3xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              id="student-search-input"
              placeholder="Search by student name, ID, or classroom..."
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-9 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:flex gap-2">
            
            {/* Cohort filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">Cohort:</span>
              <select
                id="cohort-filter-select"
                className="bg-transparent text-slate-700 font-bold focus:outline-hidden"
                value={cohortFilter}
                onChange={(e) => setCohortFilter(e.target.value)}
              >
                {getCohortList().map(coh => (
                  <option key={coh} value={coh}>{coh}</option>
                ))}
              </select>
            </div>

            {/* SSW Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">SSW:</span>
              <select
                id="ssw-filter-select"
                className="bg-transparent text-slate-700 font-bold focus:outline-hidden"
                value={sswFilter}
                onChange={(e) => setSswFilter(e.target.value)}
              >
                {getSswList().map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                id="status-filter-select"
                className="bg-transparent text-slate-700 font-bold focus:outline-hidden"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Graduated">Graduated</option>
                <option value="Leave">On Leave</option>
                <option value="Dropped">Dropped Out</option>
              </select>
            </div>

            {/* Risk filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">Risk:</span>
              <select
                id="risk-filter-select"
                className="bg-transparent text-slate-700 font-bold focus:outline-hidden"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="ALL">All Levels</option>
                <option value="RISK">At Risk Index</option>
                <option value="HEALTHY">Healthy Index</option>
              </select>
            </div>

          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
          <span>Found <strong>{filteredStudents.length}</strong> matching candidate records</span>
          <button 
            onClick={() => {
              setSearchQuery('');
              setCohortFilter('ALL');
              setStatusFilter('Active');
              setSswFilter('ALL');
              setRiskFilter('ALL');
            }}
            className="text-blue-600 font-bold hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* STUDENT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStudents.map(student => {
          const isAtRisk = student.attendanceRate < 0.82 || student.quizAverage < 70 || student.missingAssignmentsCount > 2;
          
          return (
            <div
              key={student.id}
              id={`student-card-${student.id}`}
              className={`bg-white rounded-lg border transition-all duration-200 shadow-3xs p-5 relative ${
                isAtRisk ? 'border-red-200 bg-linear-to-b from-white to-red-50/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              
              {/* Risk Banner Badge */}
              {isAtRisk && (
                <span className="absolute top-4 right-4 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1">
                  <AlertOctagon className="h-3 w-3" />
                  At Risk / Needs Tutor
                </span>
              )}

              {/* Basic Profile top line */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase shrink-0 text-lg">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 border-none truncate text-sm">{student.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">{student.id}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {student.cohort} • <strong className="font-semibold text-slate-700">{student.classroom}</strong> • {student.gender} ({student.age} y/o)
                  </p>
                </div>
              </div>

              {/* Japanese Preparation Targets */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 rounded-md p-3 mt-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-tight block font-semibold">JLPT Target</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-bold text-blue-600">{student.jlptTarget}</span>
                    <span className="text-[10px] text-slate-500">(Curr: {student.currentJlptLevel})</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-tight block font-semibold">SSW Specialty</span>
                  <p className="font-bold text-indigo-700 truncate mt-0.5 bg-indigo-50 border border-indigo-100 px-1 rounded-xs inline-block text-[10px]">{student.sswField}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-tight block font-semibold">Interview Status</span>
                  <span className={`inline-block font-bold text-[10px] mt-0.5 ${
                    student.interviewReadiness === 'Ready' 
                      ? 'text-green-600' 
                      : student.interviewReadiness === 'In Progress' 
                        ? 'text-amber-600' 
                        : 'text-slate-400'
                  }`}>
                    {student.interviewReadiness}
                  </span>
                </div>
              </div>

              {/* Academic Metrics info row */}
              <div className="grid grid-cols-4 gap-3 mt-4 text-center">
                <div className="p-1 px-2 border border-slate-100 rounded-sm">
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Mock Avg</p>
                  <p className="font-bold font-mono text-slate-800 text-xs mt-0.5">{student.quizAverage}%</p>
                </div>
                <div className="p-1 px-2 border border-slate-100 rounded-sm">
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Attendance</p>
                  <p className="font-bold font-mono text-slate-800 text-xs mt-0.5">{Math.round(student.attendanceRate * 100)}%</p>
                </div>
                <div className="p-1 px-2 border border-slate-100 rounded-sm">
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Missing HW</p>
                  <p className={`font-bold font-mono text-xs mt-0.5 ${student.missingAssignmentsCount > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                    {student.missingAssignmentsCount}
                  </p>
                </div>
                <div className="p-1 px-2 border border-slate-100 rounded-sm">
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Discipline</p>
                  <p className="font-bold font-mono text-slate-800 text-xs mt-0.5">{student.behaviorScore} pts</p>
                </div>
              </div>

              {/* Housing Assignment info & emergency */}
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    Asrama Assignment
                  </h4>
                  <p className="text-slate-500 font-medium text-[11px] mt-0.5">
                    {student.dormBuilding} • <strong className="font-semibold text-slate-700">{student.dormRoom}</strong> (Bed {student.dormBed})
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    Emergency Contact
                  </h4>
                  <p className="text-slate-700 font-medium truncate text-[11px] mt-0.5">
                    {student.emergencyContactName} • <span className="font-mono text-slate-500">{student.emergencyContactPhone}</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              {role !== 'MANAGEMENT' && (
                <div className="mt-4 bg-slate-50 rounded-sm p-1.5 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-mono">Enrolled: {student.enrollmentDate}</span>
                  <button
                    onClick={() => openEditModal(student)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <FileEdit className="h-3 w-3" />
                    Modify Profile
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* STUDENT CREATE/EDIT DRAWER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                {editingStudent ? `Modify Student Account File [${formId}]` : 'Create New Training Candidate profile'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 flex-1">
              
              {/* Segment 1: Personal Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. General Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Student Name (Romaji) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ahmad Santoso"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-blue-500 focus:bg-white"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Enrollment Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-blue-500"
                      value={formEnrollment}
                      onChange={(e) => setFormEnrollment(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium focus:outline-hidden focus:border-blue-500"
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value as 'Male' | 'Female')}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium focus:outline-hidden"
                      value={formAge}
                      onChange={(e) => setFormAge(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Training Cohort</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium focus:outline-hidden"
                      value={formCohort}
                      onChange={(e) => setFormCohort(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Class</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={formClassroom}
                      onChange={(e) => setFormClassroom(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Segment 2: Japan Preparation metrics */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Japan Preparation Matrix</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target JLPT Level</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={formJlptTarget}
                      onChange={(e) => setFormJlptTarget(e.target.value as any)}
                    >
                      <option value="N5">N5 (Basic)</option>
                      <option value="N4">N4 (Nihongo L25-50)</option>
                      <option value="N3">N3 (Intermediate)</option>
                      <option value="N2">N2 (Business)</option>
                      <option value="N1">N1 (Fluent)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Certified JLPT</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={formJlptCurrent}
                      onChange={(e) => setFormJlptCurrent(e.target.value as any)}
                    >
                      <option value="None">None (Beginner)</option>
                      <option value="N5">N5 Passed</option>
                      <option value="N4">N4 Passed</option>
                      <option value="N3">N3 Passed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">SSW Focus Area</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={formSswField}
                      onChange={(e) => setFormSswField(e.target.value as any)}
                    >
                      <option value="Caregiver">Kaigoseki (Caregiver)</option>
                      <option value="Food Service">Inshokuten (Food Service)</option>
                      <option value="Agriculture">Nougyou (Agriculture)</option>
                      <option value="Construction">Kensetsu (Construction)</option>
                      <option value="Manufacture">Seizougou (Manufacture)</option>
                      <option value="None">None / General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Prep</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={formInterview}
                      onChange={(e) => setFormInterview(e.target.value as any)}
                    >
                      <option value="Not Ready">Not Ready</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Ready">Ready (Sugu Kaisha Menseki)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Segment 3: Dormitory Area Mapping */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Dormitory (Asrama) & Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dorm Building</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={formDormBuilding}
                      onChange={(e) => setFormDormBuilding(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Room Code</label>
                    <input
                      type="text"
                      placeholder="e.g. Rm 101"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={formDormRoom}
                      onChange={(e) => setFormDormRoom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bed Number Lock</label>
                    <input
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={formDormBed}
                      onChange={(e) => setFormDormBed(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Student Status</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                    >
                      <option value="Active">Active Student</option>
                      <option value="Graduated">Graduated (Sent to Japan)</option>
                      <option value="Leave">On Formal Leave</option>
                      <option value="Dropped">Dropped Out</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Segment 4: Emergency Contacts */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. Emergency Contact (Wali Orang Tua)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Parent/Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hendra Fauzi"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={formParent}
                      onChange={(e) => setFormParent(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +62 812-..."
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium font-mono"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={formRelationship}
                      onChange={(e) => setFormRelationship(e.target.value)}
                    >
                      <option value="Father">Father (Ayah)</option>
                      <option value="Mother">Mother (Ibu)</option>
                      <option value="Uncle">Uncle (Paman)</option>
                      <option value="Sibling">Sibling (Kakak)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded text-slate-700 font-medium text-xs cursor-pointer text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded text-xs hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
                >
                  {editingStudent ? 'Save and Sync Records' : 'Publish Account profile'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
