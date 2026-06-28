'use client';

import React, { useState, useEffect } from 'react';
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
  Download,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  roles?: string[];
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const pathname = usePathname() || '/';
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const menuGroups: { title: string; items: NavItem[] }[] = [
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
      className={`hidden lg:flex flex-col fixed top-4 left-4 bottom-4 z-30 bg-white/80 dark:bg-slate-950/45 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-premium transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-slate-800/40">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src="/logo.svg" alt="Smart Notes Logo" className="w-8 h-8 rounded-xl shadow-sm object-cover" />
            <span className="font-bold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent text-sm tracking-tight">Smart Notes</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mx-auto transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-none no-scrollbar">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400/90 dark:text-slate-500/90 px-3 mb-2.5">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-primary via-primary/95 to-accent text-white shadow-premium scale-[1.02] active:scale-[0.98]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-primary dark:hover:text-emerald-400 active:scale-[0.99]'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-lg animate-pulse">
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
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/40 space-y-2">
        {isInstallable && (
          <button
            onClick={handleInstallClick}
            title="Download App PWA"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-primary via-primary/95 to-accent text-white shadow-premium active:scale-[0.98] transition-all ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Download className="w-4 h-4 stroke-[2.5px] shrink-0" />
            {!collapsed && <span>Download App</span>}
          </button>
        )}

        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-primary dark:hover:text-emerald-400 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {user && (
          <div className="flex flex-col gap-2 items-center w-full">
            <div className={`flex items-center gap-2.5 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 w-full ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm" title={`${user.name} (${user.roleName})`}>
                {user.name?.charAt(0) || 'U'}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{user.name}</p>
                  <p className="text-[9px] text-accent dark:text-accent-light font-bold truncate tracking-wide mt-0.5">{user.roleName}</p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {collapsed && (
              <button
                onClick={logout}
                title="Logout"
                className="p-2 w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
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
