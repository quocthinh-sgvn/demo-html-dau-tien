import React from 'react';
import { BookOpen, User, ShieldAlert, GraduationCap, Mail } from 'lucide-react';

interface NavbarProps {
  role: 'student' | 'instructor';
  setRole: (role: 'student' | 'instructor') => void;
  unreadEmailsCount: number;
}

export default function Navbar({ role, setRole, unreadEmailsCount }: NavbarProps) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-lg text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-sans font-bold text-lg tracking-tight text-white block">
                LMS <span className="text-emerald-400">EduHub</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 block -mt-1 uppercase tracking-widest">
                Smart Education
              </span>
            </div>
          </div>

          {/* Role switcher & User info */}
          <div className="flex items-center space-x-6">
            {/* Quick switcher */}
            <div className="bg-slate-800 p-1 rounded-full flex items-center border border-slate-700">
              <button
                id="switch-student"
                onClick={() => setRole('student')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  role === 'student'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Học Viên</span>
              </button>
              <button
                id="switch-instructor"
                onClick={() => setRole('instructor')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  role === 'instructor'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Giảng Viên</span>
              </button>
            </div>

            {/* Profile / Mail Notification Quick Indicator */}
            <div className="flex items-center space-x-4 border-l border-slate-800 pl-4">
              <div className="relative cursor-pointer">
                <div className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                  <div className="relative">
                    <Mail className="h-5 w-5" />
                    {unreadEmailsCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-slate-900 animate-pulse">
                        {unreadEmailsCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-2 text-sm bg-slate-950 py-1.5 px-3 rounded-lg border border-slate-800">
                <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs ring-1 ring-emerald-500/30">
                  {role === 'student' ? 'TQ' : 'NS'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium leading-none text-slate-200">
                    {role === 'student' ? 'Trần Quyết Thịnh' : 'ThS. Nguyễn Văn Sơn'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 leading-none mt-1">
                    {role === 'student' ? 'MSSV: HV2026-9081' : 'QL: GIANGVIEN'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
