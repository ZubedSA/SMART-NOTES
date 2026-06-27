'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import api from '@/lib/api';
import {
  FileText,
  Users,
  CheckSquare,
  Calendar,
  TrendingUp,
  Clock,
  Bell,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch (err) {
        // Fallback mock jika backend belum nyala
        setData({
          stats: {
            totalNotes: 24,
            totalAgenda: 8,
            totalMeetings: 12,
            totalTasks: 18,
            taskCompleted: 14,
            taskPending: 4,
            progress: 78,
          },
          activityChart: [
            { name: 'Sen', notes: 4, meetings: 1, tasks: 3 },
            { name: 'Sel', notes: 6, meetings: 2, tasks: 5 },
            { name: 'Rab', notes: 8, meetings: 3, tasks: 4 },
            { name: 'Kam', notes: 5, meetings: 1, tasks: 7 },
            { name: 'Jum', notes: 9, meetings: 4, tasks: 8 },
            { name: 'Sab', notes: 3, meetings: 0, tasks: 2 },
            { name: 'Min', notes: 2, meetings: 0, tasks: 1 },
          ],
          todayAgenda: [
            { id: 'AGD-1', title: 'Audit Keamanan Sistem Q3', time: '13:00', location: 'Ruang Server & Zoom' },
            { id: 'AGD-2', title: 'Review Anggaran Operasional', time: '15:30', location: 'Lantai 4' },
          ],
          todayMeetings: [
            { id: 'MTG-1', title: 'Rapat Sinkronisasi Project Smart Notes', time: '09:00', location: 'Ruang Utama', status: 'Berlangsung' },
          ],
          recentNotes: [
            { id: 'NOTE-1', title: 'Strategi Pengembangan Q3', category: 'Catatan Project', date: 'Hari ini', priority: 'High' },
            { id: 'NOTE-2', title: 'Ide Rapat Evaluasi Bulanan', category: 'Catatan Meeting', date: 'Kemarin', priority: 'Medium' },
          ],
          deadlineTasks: [
            { id: 'TSK-1', title: 'Uji Coba PWA Offline Mode', deadline: 'Besok', priority: 'Critical', pic: 'Staff Lapangan' },
            { id: 'TSK-2', title: 'Lengkapi Dokumentasi API GAS', deadline: '30 Jun', priority: 'High', pic: 'Admin' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const { stats, activityChart, todayAgenda, todayMeetings, recentNotes, deadlineTasks } = data;

  return (
    <AppLayout>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary via-primary/90 to-accent text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="relative z-10 space-y-1">
          <span className="text-xs uppercase font-semibold tracking-wider text-emerald-200 bg-black/20 px-3 py-1 rounded-full">
            Enterprise Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-bold">Selamat Datang di Smart Notes</h1>
          <p className="text-sm text-emerald-100 max-w-xl">
            Kelola seluruh catatan, agenda rapat, tindak lanjut action item, serta tugas tim Anda secara real-time dan terintegrasi.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2">
          <Link
            href="/notes?new=true"
            className="px-4 py-2.5 bg-white text-primary font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:bg-emerald-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Catatan Baru
          </Link>
          <Link
            href="/meetings?new=true"
            className="px-4 py-2.5 bg-black/30 hover:bg-black/40 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-md transition-colors"
          >
            <Users className="w-4 h-4" /> Buat Rapat
          </Link>
        </div>
      </div>

      {/* Stats Cards - Konsisten dengan Manajemen Rapat */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent" />
          <div className="pl-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Total Catatan</p>
            <p className="text-2xl md:text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.totalNotes}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +12% minggu ini
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent" />
          <div className="pl-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Total Rapat</p>
            <p className="text-2xl md:text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.totalMeetings}</p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> 1 berlangsung
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent" />
          <div className="pl-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Total Agenda</p>
            <p className="text-2xl md:text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.totalAgenda}</p>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" /> Terjadwal rapi
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent" />
          <div className="pl-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Task Terlaksana</p>
            <p className="text-2xl md:text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats.taskCompleted}/{stats.totalTasks}</p>
            <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-accent h-full rounded-full" style={{ width: `${stats.progress}%` }} />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Today Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Grafik Aktivitas Mingguan</h3>
              <p className="text-xs text-slate-500">Intensitas pembuatan catatan, rapat, dan penyelesaian tugas</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-semibold">
              Live Feed
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 pt-4">
            {activityChart.map((day: any, idx: number) => {
              const maxVal = 10;
              const hNotes = (day.notes / maxVal) * 100;
              const hTasks = (day.tasks / maxVal) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex justify-center gap-1.5 items-end h-48">
                    <div
                      style={{ height: `${Math.max(15, hNotes)}%` }}
                      className="w-3 md:w-5 bg-primary rounded-t-lg transition-all group-hover:bg-emerald-700"
                      title={`Catatan: ${day.notes}`}
                    />
                    <div
                      style={{ height: `${Math.max(10, hTasks)}%` }}
                      className="w-3 md:w-5 bg-accent rounded-t-lg transition-all group-hover:bg-green-500"
                      title={`Task: ${day.tasks}`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{day.name}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 pt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary inline-block" /> Catatan
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent inline-block" /> Tasks & Action Items
            </span>
          </div>
        </div>

        {/* Notifications & Quick Info */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
              <Bell className="w-4 h-4 text-accent animate-bounce" /> Notifikasi Real-time
            </h3>
            <span className="text-xs text-accent font-semibold">2 Baru</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-slate-900 dark:text-white">Meeting Baru Terjadwal</p>
                <p className="text-slate-500">Rapat Sinkronisasi Q3 dimulai pukul 09:00 WIB.</p>
                <span className="text-[10px] text-slate-400">10 menit yang lalu</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-slate-900 dark:text-white">Deadline Task Dekat</p>
                <p className="text-slate-500">Task Arsitektur Database jatuh tempo hari ini.</p>
                <span className="text-[10px] text-slate-400">1 jam yang lalu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Today Meetings & Deadline Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today Meetings */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Meeting Hari Ini
            </h3>
            <Link href="/meetings" className="text-xs text-accent hover:underline flex items-center gap-0.5">
              Lihat Semua <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {todayMeetings.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Tidak ada jadwal rapat hari ini</p>
            ) : (
              todayMeetings.map((mtg: any) => (
                <div key={mtg.id} className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{mtg.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{mtg.location} • {mtg.time}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-semibold">
                    {mtg.status || 'Hadir'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today Agenda */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" /> Agenda Hari Ini
            </h3>
            <Link href="/calendar" className="text-xs text-accent hover:underline flex items-center gap-0.5">
              Kalender <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {todayAgenda.map((agd: any) => (
              <div key={agd.id} className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex justify-between items-center">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{agd.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{agd.location}</p>
                </div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{agd.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deadline Tasks */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-500" /> Task Deadline Dekat
            </h3>
            <Link href="/tasks" className="text-xs text-accent hover:underline flex items-center gap-0.5">
              Kanban <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {deadlineTasks.map((tsk: any) => (
              <div key={tsk.id} className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 flex justify-between items-center">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{tsk.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">PIC: {tsk.pic}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold animate-pulse">
                  {tsk.deadline}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
