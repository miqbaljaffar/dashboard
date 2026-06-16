import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  FileCheck,
  Home,
  ShieldAlert,
  Compass,
  FileCode2,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingReportsCount: number;
  atRiskStudentsCount: number;
  totalViolationsCount: number;
}

export default function Sidebar({
  currentRole,
  activeTab,
  setActiveTab,
  pendingReportsCount,
  atRiskStudentsCount,
  totalViolationsCount
}: SidebarProps) {
  
  // Logic to determine menu items based on role
  const getMenuItems = () => {
    const allItems = [
      { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGEMENT', 'TEACHER', 'DORM_SUPERVISOR', 'STUDENT'] },
      { id: 'students', label: 'Student Directory', icon: Users, roles: ['ADMIN', 'MANAGEMENT', 'TEACHER'] },
      { id: 'attendance', label: 'Attendance Hub', icon: CalendarCheck, roles: ['ADMIN', 'MANAGEMENT', 'TEACHER'] },
      { id: 'academia', label: 'Quiz & Assignments', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
      { id: 'reports', label: 'Daily Reports (Nippou)', icon: FileCheck, roles: ['ADMIN', 'MANAGEMENT', 'TEACHER', 'STUDENT'], badge: currentRole !== 'STUDENT' ? pendingReportsCount : 0 },
      { id: 'dormitory', label: 'Dormitory Operations', icon: Home, roles: ['ADMIN', 'MANAGEMENT', 'DORM_SUPERVISOR', 'STUDENT'] },
      { id: 'discipline', label: 'Discipline & Behavior', icon: ShieldAlert, roles: ['ADMIN', 'MANAGEMENT', 'DORM_SUPERVISOR'], badge: currentRole === 'ADMIN' ? totalViolationsCount : 0 },
      { id: 'blueprint', label: 'System Architecture', icon: FileCode2, roles: ['ADMIN', 'MANAGEMENT', 'TEACHER', 'DORM_SUPERVISOR'] }
    ];

    return allItems.filter(item => item.roles.includes(currentRole));
  };

  const menuItems = getMenuItems();

  return (
    <div id="application-sidebar" className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 md:h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-slate-100 flex items-center justify-center text-slate-800">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 leading-none">UTB BANJAR</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">日本語トレーニングセンター</p>
          </div>
        </div>
        <div className="mt-3 bg-slate-50 rounded border border-slate-100 py-1 px-2.5 text-[10px] text-slate-600 flex justify-between items-center font-medium">
          <span>Target Market: Japan</span>
          <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded font-semibold font-mono text-[9px] border border-emerald-100">active</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 overflow-y-auto custom-scrollbar flex-1">
        <p className="px-2.5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {currentRole === 'STUDENT' ? 'Student Portal' : 'Primary modules'}
        </p>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-none'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
              </div>
              
              {item.badge && item.badge > 0 ? (
                <span className={`inline-flex items-center justify-center h-4 min-w-4 px-1.5 text-[9px] font-semibold rounded-full ${
                  isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Access Summary Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-mono text-slate-500">
            System Level: {currentRole}
          </span>
        </div>
        <p className="text-[9px] text-slate-400 mt-0.5">
          Japanese Language Training & Dormitory Hub v1.8.4
        </p>
      </div>
    </div>
  );
}
