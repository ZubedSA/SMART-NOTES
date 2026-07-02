'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { QuickActionFAB } from './QuickActionFAB';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wide text-slate-400 dark:text-slate-500 animate-pulse">Memuat Smart Notes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/20 relative">
      <div className="flex min-h-screen">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`flex-1 min-w-0 pb-24 lg:pb-8 pt-6 px-4 lg:px-8 transition-all duration-300 ${
          collapsed ? 'lg:ml-[7rem]' : 'lg:ml-[18.5rem]'
        }`}>
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            {/* Header Pengguna Global (Sticky) */}
            <header className="sticky top-4 z-[45] flex items-center justify-between bg-white/80 dark:bg-slate-950/85 backdrop-blur-lg px-5 py-3 md:px-6 md:py-3 rounded-2xl md:rounded-3xl border border-slate-250/60 dark:border-slate-800/60 shadow-premium animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-extrabold text-sm md:text-base shadow-sm">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
                    {user.name}
                  </h2>
                  <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] md:text-[9px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider bg-accent/15 text-accent dark:bg-emerald-500/10 dark:text-emerald-400 border border-accent/20 dark:border-emerald-500/20">
                  🛡️ {user.roleName}
                </span>
              </div>
            </header>

            {children}
          </div>
        </main>
      </div>
      <MobileNav />
      <QuickActionFAB />
    </div>
  );
};
