'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, TrendingUp } from 'lucide-react';

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'Bulanan' | 'Mingguan' | 'Harian'>('Bulanan');

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await api.get('/calendar');
        setEvents(res.data.data || []);
      } catch (err) {
        setEvents([
          { id: '1', title: '[Agenda] Audit Keamanan Sistem Q3', date: '2026-06-28', time: '13:00', type: 'agenda', color: '#16A34A', location: 'Ruang Server' },
          { id: '2', title: '[Meeting] Rapat Sinkronisasi Project', date: '2026-06-28', time: '09:00', type: 'meeting', color: '#3B82F6', location: 'Zoom' },
          { id: '3', title: '[Task] Uji Coba PWA Offline', date: '2026-06-30', time: '23:59', type: 'task', color: '#F59E0B' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  return (
    <AppLayout>
      {/* Header - Konsisten dengan Manajemen Rapat */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
              <CalIcon className="w-6 h-6 text-accent shrink-0" /> Kalender & Agenda Terpadu
            </h1>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Jadwal lengkap rapat, agenda organisasi, dan tenggat waktu tugas
            </p>
          </div>
          <button
            className="md:hidden px-3.5 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" /> Agenda
          </button>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
            {(['Bulanan', 'Mingguan', 'Harian'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === m ? 'bg-white dark:bg-slate-700 shadow-sm text-accent font-bold' : 'text-slate-500'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <Link
            href="/monitoring"
            className="hidden md:flex text-center px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-accent" /> Dashboard
          </Link>
          <button
            className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Agenda Baru
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      ) : (
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Juni - Juli 2026 ({mode})</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {events.map((ev) => (
              <div key={ev.id} className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent" />
                <div className="flex items-center justify-between pl-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg text-white uppercase tracking-wider shadow-sm" style={{ backgroundColor: ev.color }}>
                    {ev.type.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{ev.date}</span>
                </div>
                <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white pl-2 leading-snug">{ev.title}</h3>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50 ml-2">
                  <span className="flex items-center gap-1 font-semibold"><Clock className="w-3.5 h-3.5 text-accent" /> {ev.time}</span>
                  {ev.location && <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-3.5 h-3.5" /> {ev.location}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
