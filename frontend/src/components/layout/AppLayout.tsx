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
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
      <QuickActionFAB />
    </div>
  );
};
