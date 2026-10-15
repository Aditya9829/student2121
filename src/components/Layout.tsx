import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  GraduationCap as Logo,
  X,
  Menu,
} from 'lucide-react';
import type { Page } from '@/lib/types';

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  open: boolean;
  onClose: () => void;
}

const navItems: { label: string; icon: typeof LayoutDashboard; page: Page; match: (p: Page) => boolean }[] = [
  { label: 'Dashboard', icon: LayoutDashboard, page: { name: 'dashboard' }, match: (p) => p.name === 'dashboard' },
  { label: 'Students', icon: Users, page: { name: 'students' }, match: (p) => p.name === 'students' || p.name === 'student' },
  { label: 'Courses', icon: BookOpen, page: { name: 'courses' }, match: (p) => p.name === 'courses' },
  { label: 'Subjects', icon: GraduationCap, page: { name: 'subjects' }, match: (p) => p.name === 'subjects' },
];

export function Sidebar({ current, onNavigate, open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 flex flex-col z-40 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
              <Logo size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm leading-tight">EduAdmin</h1>
              <p className="text-slate-400 text-xs">College Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = item.match(current);
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-semibold">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-400 truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface TopBarProps {
  onMenuClick: () => void;
  onNavigate: (page: Page) => void;
  title: string;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-slate-600 hover:text-slate-900"
          >
            <Menu size={22} />
          </button>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
        <div className="hidden sm:block text-sm text-slate-500">{today}</div>
      </div>
    </header>
  );
}
