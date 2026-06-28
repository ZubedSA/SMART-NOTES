'use client';

import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Bot, Sparkles, ArrowLeft } from 'lucide-react';

export default function AIAssistantPage() {
  return (
    <AppLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/95 dark:bg-slate-950/80 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] p-8 text-center space-y-6 relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-accent/15 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10" />
          
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-accent flex items-center justify-center mx-auto shadow-inner relative animate-pulse">
            <Bot className="w-8 h-8 stroke-[1.5px]" />
            <Sparkles className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-bounce" />
          </div>

          <div className="space-y-2 relative z-10">
            <span className="text-[9px] uppercase font-bold tracking-widest text-accent bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              AI Feature
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">Fitur Sedang Dikembangkan</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-4">
              Kami sedang merancang asisten kecerdasan buatan (AI) pintar untuk merangkum notulen rapat dan mengekstrak tugas otomatis. Fitur ini akan segera tersedia pada pembaruan mendatang.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-premium hover:shadow-accent/25 hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5px]" /> Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
