import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  GraduationCap,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLogout
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Data Siswa', icon: Users },
    { id: 'attendance', label: 'Kehadiran (Attendance)', icon: CalendarCheck },
    { id: 'academia', label: 'Tugas & Nilai', icon: BookOpen }
  ];

  return (
    <div id="application-sidebar" className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 md:h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-slate-100 flex items-center justify-center text-slate-800">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 leading-none font-sans uppercase">UTB BANJAR</h1>
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
          Primary Modules
        </p>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-md text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-none'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Access Summary Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-mono text-slate-500">
            System Level: Admin/Teacher
          </span>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-650 hover:text-red-700 font-bold text-[10.5px] rounded-lg transition duration-200 cursor-pointer no-print"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log Out
          </button>
        )}
        <p className="text-[9px] text-slate-400 font-medium leading-none">
          Japanese Language Training Hub v2.0.0
        </p>
      </div>
    </div>
  );
}
