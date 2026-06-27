'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Home,
  FileText,
  Users,
  CheckSquare,
  Calendar,
  BarChart2,
  Database,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname() || '/';
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const menuGroups = [
    {
      title: 'Utama',
      items: [
        { label: 'Dashboard', href: '/', icon: Home },
        { label: 'AI Assistant', href: '/ai-assistant', icon: Sparkles, badge: 'AI' },
      ],
    },
    {
      title: 'Productivity',
      items: [
        { label: 'Catatan', href: '/notes', icon: FileText },
        { label: 'Rapat & Action', href: '/meetings', icon: Users },
        { label: 'Tugas (Tasks)', href: '/tasks', icon: CheckSquare },
        { label: 'Agenda & Kalender', href: '/calendar', icon: Calendar },
      ],
    },
    {
      title: 'Enterprise',
      items: [
        { label: 'Monitoring Rapat', href: '/monitoring', icon: BarChart2 },
        { label: 'Laporan Eksekutif', href: '/reports', icon: BarChart2 },
        { label: 'Master Data', href: '/master', icon: Database, roles: ['Admin'] },
        { label: 'Pengaturan', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-md">
              S
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-sm">Smart Notes</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 mx-auto"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {!collapsed && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.filter(item => !item.roles || hasRole(item.roles)).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : ''}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Profile & Dark Mode */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {user && (
          <div className="flex flex-col gap-2 items-center w-full">
            <div className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-full ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xs shrink-0" title={`${user.name} (${user.roleName})`}>
                {user.name?.charAt(0) || 'U'}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-accent font-medium truncate">{user.roleName}</p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
            {collapsed && (
              <button
                onClick={logout}
                title="Logout"
                className="p-2 w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-50 hover:text-white transition-all flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
