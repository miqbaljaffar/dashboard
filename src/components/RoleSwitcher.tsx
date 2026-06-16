import React from 'react';
import { UserRole } from '../types';
import { Shield, BarChart3, GraduationCap, Home, UserCircle } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  selectedStudentIdForStudentView: string;
  onChangeSelectedStudent: (id: string) => void;
  studentsList: { id: string; name: string }[];
}

export default function RoleSwitcher({
  currentRole,
  onChangeRole,
  selectedStudentIdForStudentView,
  onChangeSelectedStudent,
  studentsList,
}: RoleSwitcherProps) {
  const roles: { val: UserRole; label: string; desc: string; icon: any; color: string }[] = [
    {
      val: 'ADMIN',
      label: 'Administrator',
      desc: 'Full Access (Academics, Dorms, Settings, System Blueprint)',
      icon: Shield,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    },
    {
      val: 'MANAGEMENT',
      label: 'Management',
      desc: 'Executive Analytics, Trends, High-level KPI Reports',
      icon: BarChart3,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    },
    {
      val: 'TEACHER',
      label: 'Japanese Teacher',
      desc: 'Academic Modules, Quizzes, Nippou Reports, Student Skills',
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    },
    {
      val: 'DORM_SUPERVISOR',
      label: 'Dorm Supervisor',
      desc: 'Dorm Rooms, Cleaning Checklist, Violation Logs, Curfew Status',
      icon: Home,
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    },
    {
      val: 'STUDENT',
      label: 'UTB Student Portal',
      desc: 'View My Status, Submit Daily Report, View My Room, Exams',
      icon: UserCircle,
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    },
  ];

  const activeRoleConfig = roles.find((r) => r.val === currentRole);

  return (
    <div id="role-switcher-panel" className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-none">
      <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
            Role-Based Access Control (RBAC) Sandbox Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Switch positions below to view pages, forms, and permission constraints tailored for that target user.
          </p>
        </div>
        
        {currentRole === 'STUDENT' && (
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 border border-slate-100 rounded-md">
            <label htmlFor="student-impersonate-select" className="text-xs font-semibold text-slate-600 pl-1">
              Impersonate Student:
            </label>
            <select
              id="student-impersonate-select"
              className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:border-blue-500"
              value={selectedStudentIdForStudentView}
              onChange={(e) => onChangeSelectedStudent(e.target.value)}
            >
              {studentsList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
        {roles.map((r) => {
          const IconComp = r.icon;
          const isActive = currentRole === r.val;
          return (
            <button
              key={r.val}
              id={`role-btn-${r.val.toLowerCase()}`}
              onClick={() => onChangeRole(r.val)}
              className={`flex flex-col items-start p-3 border text-left rounded-md transition-all duration-200 ${
                isActive
                  ? 'border-blue-500 bg-blue-50/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`p-1.5 rounded ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                </div>
                <span className={`text-xs font-semibold ${isActive ? 'text-blue-800' : 'text-slate-700'}`}>
                  {r.label}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 leading-tight block line-clamp-2">
                {r.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 border-l-2 border-slate-400 p-2.5 rounded-r-sm flex justify-between items-center">
        <span>
          <strong className="text-slate-700">Current Active View Context:</strong> {activeRoleConfig?.desc}
        </span>
        <span className="text-xs font-mono bg-slate-200/50 px-2 py-0.5 rounded text-slate-600 text-[9px] font-semibold">
          Session Token Secure
        </span>
      </div>
    </div>
  );
}
