'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  FileText,
  Users,
  CheckSquare,
  Calendar,
  Sparkles,
  Plus,
  Grid,
  TrendingUp,
  BarChart3,
  Database,
  Bot,
  X,
  ChevronRight,
  Zap,
  LogOut,
  Sun,
  Moon,
  Download,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface MoreMenuItem {
  label: string;
  href: string;
  icon: any;
  color: string;
  bg: string;
  badge?: string;
  roles?: string[];
}

export const MobileNav = () => {
  const pathname = usePathname() || '/';
  const { user, hasRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

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

  const mainNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Catatan', href: '/notes', icon: FileText },
    { label: 'Rapat', href: '/meetings', icon: Users },
  ];

  const moreMenuItems: MoreMenuItem[] = [
    { label: 'Tugas & Kanban', href: '/tasks', icon: CheckSquare, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Kalender', href: '/calendar', icon: Calendar, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
    { label: 'AI Assistant', href: '/ai-assistant', icon: Bot, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', badge: 'New' },
    { label: 'Dashboard', href: '/monitoring', icon: TrendingUp, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Laporan', href: '/reports', icon: BarChart3, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Master Data', href: '/master', icon: Database, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', roles: ['Admin'] },
  ];

  const quickActions = [
    { label: 'Catatan Baru', href: '/notes?new=true', icon: FileText, desc: 'Tulis ide atau notulen', roles: ['Admin', 'Manager', 'Staff'] },
    { label: 'Jadwalkan Rapat', href: '/meetings?new=true', icon: Users, desc: 'Buat agenda rapat baru', roles: ['Admin', 'Manager'] },
    { label: 'Tanya AI', href: '/ai-assistant', icon: Sparkles, desc: 'Rangkum transkrip otomatis', roles: ['Admin', 'Manager', 'Staff', 'Viewer'] },
  ].filter(act => !user || act.roles.includes(user.roleName));

  const isOnMorePage = ['/tasks', '/calendar', '/ai-assistant', '/monitoring', '/reports', '/master'].some(p => pathname.startsWith(p));
  const closeAll = () => { setShowMoreMenu(false); setShowQuickAdd(false); };
  const checkActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      {/* Backdrop overlay */}
      {(showMoreMenu || showQuickAdd) && (
        <div className="mobile-dock-overlay" onClick={closeAll} />
      )}

      {/* Quick Add Drawer */}
      {showQuickAdd && (
        <div className="mobile-dock-drawer">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3.5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-primary to-accent text-white shadow-md">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-white text-sm">Aksi Cepat</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Pintasan data baru</div>
              </div>
            </div>
            <button onClick={() => setShowQuickAdd(false)} className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {quickActions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <Link
                  key={idx}
                  href={act.href}
                  onClick={closeAll}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 border border-slate-100/50 dark:border-slate-800/40 text-slate-700 dark:text-slate-300 transition-all hover:translate-x-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 dark:bg-accent/20 text-accent flex items-center justify-center shadow-inner">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{act.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{act.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* More Menu Drawer */}
      {showMoreMenu && (
        <div className="mobile-dock-drawer max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3.5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 shadow-sm">
                <Grid className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-white text-sm">Menu & Modul</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Akses seluruh fitur</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                title={theme === 'dark' ? 'Mode Siang' : 'Mode Malam'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
              <button onClick={() => setShowMoreMenu(false)} className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-650 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {moreMenuItems.filter(item => !item.roles || hasRole(item.roles)).map((item, idx) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={closeAll}
                  className={`flex flex-col items-start p-3.5 rounded-2xl text-slate-700 dark:text-slate-300 relative overflow-hidden transition-all ${
                    active
                      ? 'bg-gradient-to-tr from-primary via-primary/95 to-accent text-white shadow-premium scale-[1.01]'
                      : 'bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 border border-slate-100/50 dark:border-slate-800/40'
                  }`}
                >
                  {item.badge && !active && (
                    <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-accent text-white text-[8px] font-bold tracking-wider uppercase animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  <div
                    className={`p-2 rounded-xl mb-2.5 ${
                      active ? 'bg-white/20 text-white' : 'dark:bg-slate-850 bg-white shadow-sm'
                    }`}
                    style={{ color: active ? 'white' : item.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wide leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-accent text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-premium"
            >
              <Download className="w-4 h-4 stroke-[2.5px]" />
              <span>Unduh Aplikasi PWA</span>
            </button>
          )}
          <button
            onClick={() => { closeAll(); logout(); }}
            className="w-full mt-4 py-3 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/10 dark:border-red-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar / Logout</span>
          </button>
        </div>
      )}

      {/* ===== NAVBAR DOCK ===== */}
      <nav className="mobile-dock">
        {/* Left: Home + Catatan */}
        <div className="flex items-center gap-1.5">
          {mainNavItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = checkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeAll}
                className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 rounded-2xl transition-all ${
                  active
                    ? 'text-primary dark:text-accent font-bold bg-primary/5 dark:bg-accent/10'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110 stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[9px] font-semibold tracking-wide mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Center: FAB */}
        <div className="relative -mt-6">
          <button
            onClick={() => { setShowQuickAdd(!showQuickAdd); setShowMoreMenu(false); }}
            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-primary/95 to-accent text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transition-all ${
              showQuickAdd ? 'rotate-45' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <Plus className="w-5.5 h-5.5 stroke-[3px]" />
          </button>
        </div>

        {/* Right: Rapat + Menu */}
        <div className="flex items-center gap-1.5">
          {mainNavItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = checkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeAll}
                className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 rounded-2xl transition-all ${
                  active
                    ? 'text-primary dark:text-accent font-bold bg-primary/5 dark:bg-accent/10'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110 stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[9px] font-semibold tracking-wide mt-1">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => { setShowMoreMenu(!showMoreMenu); setShowQuickAdd(false); }}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 rounded-2xl transition-all ${
              showMoreMenu || isOnMorePage
                ? 'text-primary dark:text-accent font-bold bg-primary/5 dark:bg-accent/10'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[9px] font-semibold tracking-wide mt-1">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
