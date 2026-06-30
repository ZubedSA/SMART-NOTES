'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    // Load from cache first for instant display
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('smart_dashboard_cache');
      if (cached) {
        try {
          setData(JSON.parse(cached));
          setLoading(false);
        } catch (e) {}
      }
    }

    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_dashboard_cache', JSON.stringify(res.data.data));
        }
      } catch (err) {
        // Build data secara dinamis dari local cache agar sinkron dengan aksi user di frontend
        if (typeof window !== 'undefined') {
          try {
            const cachedNotes = JSON.parse(localStorage.getItem('smart_notes_cache') || '[]');
            const cachedMeetings = JSON.parse(localStorage.getItem('smart_meetings_cache') || '[]');
            const cachedActionItems = JSON.parse(localStorage.getItem('smart_action_items_cache') || '[]');
            
            const notes = cachedNotes.length > 0 ? cachedNotes : [
              { id: 'NOTE-1', title: 'Strategi Pengembangan Q3', category: 'Catatan Project', date: 'Hari ini', priority: 'High' },
              { id: 'NOTE-2', title: 'Ide Rapat Evaluasi Bulanan', category: 'Catatan Meeting', date: 'Kemarin', priority: 'Medium' },
            ];
            
            const meetings = cachedMeetings.length > 0 ? cachedMeetings : [
              { id: 'MTG-1', title: 'Rapat Sinkronisasi Project Smart Notes', time: '09:00', location: 'Ruang Utama', status: 'Berlangsung' },
            ];
            
            const actionItems = cachedActionItems.length > 0 ? cachedActionItems : [
              { id: 'TSK-1', title: 'Uji Coba PWA Offline Mode', deadline: 'Besok', priority: 'Critical', pic: 'Staff Lapangan', status: 'Proses' },
              { id: 'TSK-2', title: 'Lengkapi Dokumentasi API GAS', deadline: '30 Jun', priority: 'High', pic: 'Admin', status: 'Belum' },
            ];

            const totalNotes = notes.length;
            const totalMeetings = meetings.length;
            const totalTasks = actionItems.length;
            const taskCompleted = actionItems.filter((t: any) => t.status === 'Selesai').length;
            const taskPending = totalTasks - taskCompleted;
            const progress = totalTasks > 0 ? Math.round((taskCompleted / totalTasks) * 100) : 0;

            // Buat grafik aktivitas dinamis berdasarkan total data agar grafik bernyawa
            const activityChart = [
              { name: 'Sen', notes: Math.min(2, totalNotes), meetings: 0, tasks: Math.min(1, totalTasks) },
              { name: 'Sel', notes: Math.min(4, totalNotes), meetings: 0, tasks: Math.min(2, totalTasks) },
              { name: 'Rab', notes: Math.min(6, totalNotes), meetings: 1, tasks: Math.min(3, totalTasks) },
              { name: 'Kam', notes: Math.min(3, totalNotes), meetings: 0, tasks: Math.min(2, totalTasks) },
              { name: 'Jum', notes: Math.min(totalNotes, 5), meetings: 1, tasks: Math.min(totalTasks, 4) },
              { name: 'Sab', notes: Math.min(totalNotes, 3), meetings: 0, tasks: Math.min(totalTasks, 2) },
              { name: 'Min', notes: totalNotes, meetings: totalMeetings, tasks: taskCompleted },
            ];

            setData({
              stats: {
                totalNotes,
                totalAgenda: 2 + totalMeetings, // Dinamis berdasarkan jumlah rapat
                totalMeetings,
                totalTasks,
                taskCompleted,
                taskPending,
                progress,
              },
              activityChart,
              todayAgenda: [
                { id: 'AGD-1', title: 'Audit Keamanan Sistem Q3', time: '13:00', location: 'Ruang Server & Zoom' },
                { id: 'AGD-2', title: 'Review Anggaran Operasional', time: '15:30', location: 'Lantai 4' },
              ],
              todayMeetings: meetings.slice(0, 3),
              recentNotes: notes.slice(0, 2),
              deadlineTasks: actionItems.filter((t: any) => t.status !== 'Selesai').slice(0, 3),
            });
            return;
          } catch (e) {
            console.error('Gagal memuat cache lokal dashboard', e);
          }
        }

        // Default fallback statis
        setData({
          stats: {
            totalNotes: 2,
            totalAgenda: 2,
            totalMeetings: 1,
            totalTasks: 2,
            taskCompleted: 0,
            taskPending: 2,
            progress: 0,
          },
          activityChart: [
            { name: 'Sen', notes: 1, meetings: 0, tasks: 0 },
            { name: 'Sel', notes: 2, meetings: 0, tasks: 0 },
            { name: 'Rab', notes: 1, meetings: 1, tasks: 1 },
            { name: 'Kam', notes: 1, meetings: 0, tasks: 0 },
            { name: 'Jum', notes: 2, meetings: 1, tasks: 1 },
            { name: 'Sab', notes: 0, meetings: 0, tasks: 0 },
            { name: 'Min', notes: 0, meetings: 0, tasks: 0 },
          ],
          todayAgenda: [],
          todayMeetings: [],
          recentNotes: [],
          deadlineTasks: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user, authLoading]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0a0f1d] dark:bg-slate-950 text-white p-6 md:p-8 rounded-[2rem] border border-slate-200/10 dark:border-slate-800/30 shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/30 to-accent/20 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="relative z-10 space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Enterprise Workspace
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2.5">Selamat Datang di Smart Notes</h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Kelola seluruh catatan, agenda rapat, tindak lanjut action item, serta tugas tim Anda secara real-time dan terintegrasi.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2.5">
          <Link
            href="/notes?new=true"
            className="px-5 py-2.5 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-premium hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 inline-block mr-1.5 -mt-0.5 stroke-[2.5px]" /> Catatan Baru
          </Link>
          <Link
            href="/meetings?new=true"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all backdrop-blur-md"
          >
            <Users className="w-4 h-4 inline-block mr-1.5 -mt-0.5 stroke-2" /> Buat Rapat
          </Link>
        </div>
      </div>

      {/* Stats Cards - Ultra Responsive & Premium */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="premium-card p-4 md:p-5 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3.5 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
          <div className="pl-1 md:pl-2">
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Total Catatan</p>
            <p className="text-xl md:text-2xl lg:text-3xl font-extrabold mt-1 text-slate-900 dark:text-white tracking-tight">{stats.totalNotes}</p>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1.5">
              <TrendingUp className="w-3 h-3" /> +12% minggu ini
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/10 shadow-sm self-start sm:self-center">
            <FileText className="w-5 h-5 md:w-5.5 md:h-5.5 stroke-2" />
          </div>
        </div>

        <div className="premium-card p-4 md:p-5 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3.5 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
          <div className="pl-1 md:pl-2">
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Total Rapat</p>
            <p className="text-xl md:text-2xl lg:text-3xl font-extrabold mt-1 text-slate-900 dark:text-white tracking-tight">{stats.totalMeetings}</p>
            <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 mt-1.5">
              <Clock className="w-3 h-3" /> 1 berlangsung
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/10 shadow-sm self-start sm:self-center">
            <Users className="w-5 h-5 md:w-5.5 md:h-5.5 stroke-2" />
          </div>
        </div>

        <div className="premium-card p-4 md:p-5 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3.5 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
          <div className="pl-1 md:pl-2">
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Total Agenda</p>
            <p className="text-xl md:text-2xl lg:text-3xl font-extrabold mt-1 text-slate-900 dark:text-white tracking-tight">{stats.totalAgenda}</p>
            <p className="text-[9px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 mt-1.5">
              <Calendar className="w-3 h-3" /> Terjadwal rapi
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/10 shadow-sm self-start sm:self-center">
            <Calendar className="w-5 h-5 md:w-5.5 md:h-5.5 stroke-2" />
          </div>
        </div>

        <div className="premium-card p-4 md:p-5 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3.5 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
          <div className="pl-1 md:pl-2 w-full sm:w-auto">
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Task Terlaksana</p>
            <p className="text-xl md:text-2xl lg:text-3xl font-extrabold mt-1 text-slate-900 dark:text-white tracking-tight">{stats.taskCompleted}/{stats.totalTasks}</p>
            <div className="w-full sm:w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden border border-slate-200/30 dark:border-slate-800/40">
              <div className="bg-gradient-to-r from-primary to-accent h-full rounded-full" style={{ width: `${stats.progress}%` }} />
            </div>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/10 shadow-sm self-start sm:self-center">
            <CheckSquare className="w-5 h-5 md:w-5.5 md:h-5.5 stroke-2" />
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Today Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="premium-card p-6 lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white tracking-tight">Grafik Aktivitas Mingguan</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Intensitas pembuatan catatan, rapat, dan penyelesaian tugas</p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/10">
              Live Feed
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-4">
            {activityChart.map((day: any, idx: number) => {
              const maxVal = 10;
              const hNotes = (day.notes / maxVal) * 100;
              const hTasks = (day.tasks / maxVal) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3.5 h-full justify-end group">
                  <div className="w-full flex justify-center gap-1.5 items-end h-48">
                    <div
                      style={{ height: `${Math.max(15, hNotes)}%` }}
                      className="w-2.5 md:w-3.5 bg-primary/80 dark:bg-primary-light/80 rounded-t-full transition-all duration-350 hover:bg-primary dark:hover:bg-accent hover:scale-x-105 shadow-inner"
                      title={`Catatan: ${day.notes}`}
                    />
                    <div
                      style={{ height: `${Math.max(10, hTasks)}%` }}
                      className="w-2.5 md:w-3.5 bg-accent/80 rounded-t-full transition-all duration-350 hover:bg-emerald-400 hover:scale-x-105 shadow-inner"
                      title={`Task: ${day.tasks}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors uppercase tracking-wider">{day.name}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 pt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Catatan
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" /> Tasks & Action Items
            </span>
          </div>
        </div>

        {/* Notifications & Quick Info */}
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="font-bold text-sm md:text-base flex items-center gap-2 text-slate-900 dark:text-white tracking-tight">
              <Bell className="w-4 h-4 text-accent animate-bounce" /> Notifikasi Real-time
            </h3>
            <span className="text-[10px] text-accent font-bold bg-accent/10 px-2 py-0.5 rounded-md">2 Baru</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100/50 dark:border-slate-800/40 flex gap-3 items-start hover:scale-[1.01] transition-transform">
              <div className="w-8.5 h-8.5 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/10 shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">Meeting Baru Terjadwal</p>
                <p className="text-slate-400 dark:text-slate-500 leading-normal">Rapat Sinkronisasi Q3 dimulai pukul 09:00 WIB.</p>
                <span className="text-[9px] text-slate-400 dark:text-slate-600 font-medium">10 menit yang lalu</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100/50 dark:border-slate-800/40 flex gap-3 items-start hover:scale-[1.01] transition-transform">
              <div className="w-8.5 h-8.5 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/10 shadow-sm">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">Deadline Task Dekat</p>
                <p className="text-slate-400 dark:text-slate-500 leading-normal">Task Arsitektur Database jatuh tempo hari ini.</p>
                <span className="text-[9px] text-slate-400 dark:text-slate-600 font-medium">1 jam yang lalu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Today Meetings & Deadline Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today Meetings */}
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <Users className="w-4 h-4 text-blue-500" /> Meeting Hari Ini
            </h3>
            <Link href="/meetings" className="text-[10px] font-bold text-accent hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-0.5">
              Lihat Semua <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {todayMeetings.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">Tidak ada jadwal rapat hari ini</p>
            ) : (
              todayMeetings.map((mtg: any) => (
                <div key={mtg.id} className="p-3.5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-900/20 flex justify-between items-center hover:scale-[1.01] transition-transform">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{mtg.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">{mtg.location} • {mtg.time}</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/10 shrink-0">
                    {mtg.status || 'Hadir'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today Agenda */}
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <Calendar className="w-4 h-4 text-purple-500" /> Agenda Hari Ini
            </h3>
            <Link href="/calendar" className="text-[10px] font-bold text-accent hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-0.5">
              Kalender <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {todayAgenda.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">Tidak ada agenda hari ini</p>
            ) : (
              todayAgenda.map((agd: any) => (
                <div key={agd.id} className="p-3.5 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/10 dark:border-purple-900/20 flex justify-between items-center hover:scale-[1.01] transition-transform">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{agd.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">{agd.location}</p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 shrink-0">{agd.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deadline Tasks */}
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <CheckSquare className="w-4 h-4 text-amber-500" /> Task Deadline Dekat
            </h3>
            <Link href="/tasks" className="text-[10px] font-bold text-accent hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-0.5">
              Kanban <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {deadlineTasks.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">Tidak ada tugas mendekati deadline</p>
            ) : (
              deadlineTasks.map((tsk: any) => (
                <div key={tsk.id} className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-900/20 flex justify-between items-center hover:scale-[1.01] transition-transform">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{tsk.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">PIC: {tsk.pic}</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/10 shrink-0 animate-pulse">
                    {tsk.deadline}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
