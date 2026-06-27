'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { QuickActionFAB } from './QuickActionFAB';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">Memuat Smart Notes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 lg:ml-64 pb-24 lg:pb-8 pt-3 px-3.5 lg:px-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto space-y-3.5 md:space-y-6">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
      <QuickActionFAB />
    </div>
  );
};
