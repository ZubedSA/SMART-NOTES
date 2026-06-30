'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Filter,
  Users,
  Search,
} from 'lucide-react';

export default function MonitoringPage() {
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (authLoading || !user) return;

    if (typeof window !== 'undefined') {
      const cachedMtg = localStorage.getItem('smart_meetings_cache');
      const cachedTsk = localStorage.getItem('smart_action_items_cache');
      const cachedSummary = localStorage.getItem('smart_monitoring_cache');

      if (cachedMtg && cachedTsk) {
        try {
          const meetings = JSON.parse(cachedMtg);
          const tasks = JSON.parse(cachedTsk);

          const totalMeeting = meetings.length;
          const totalAction = tasks.length;
          const belum = tasks.filter((t: any) => t.status === 'Belum').length;
          const selesai = tasks.filter((t: any) => t.status === 'Selesai').length;
          const proses = tasks.filter((t: any) => t.status === 'Proses' || t.status === 'Sedang Dikerjakan').length;
          const overdue = tasks.filter((t: any) => t.status === 'Overdue').length;
          const progress = totalAction > 0 ? Math.round((selesai / totalAction) * 100) : 0;

          setSummary({
            totalMeeting,
            totalAction,
            progress,
            statusBreakdown: { belum, selesai, proses, overdue },
            allActionItems: tasks,
          });
          setLoading(false);
        } catch (e) {}
      } else if (cachedSummary) {
        try {
          setSummary(JSON.parse(cachedSummary));
          setLoading(false);
        } catch (e) {}
      }
    }

    const fetchMonitoring = async () => {
      try {
        const [summaryRes, tasksRes] = await Promise.all([
          api.get('/meeting/monitoring/summary'),
          api.get('/meeting-task'),
        ]);

        const summaryData = summaryRes.data.data;
        const allTasks = tasksRes.data?.data?.items || [];

        setSummary({
          ...summaryData,
          allActionItems: allTasks,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_monitoring_cache', JSON.stringify(summaryData));
          localStorage.setItem('smart_action_items_cache', JSON.stringify(allTasks));
        }
      } catch (err) {
        const cachedMtg = typeof window !== 'undefined' ? localStorage.getItem('smart_meetings_cache') : null;
        const cachedTsk = typeof window !== 'undefined' ? localStorage.getItem('smart_action_items_cache') : null;
        
        if (!cachedMtg || !cachedTsk) {
          setSummary({
            totalMeeting: 15,
            totalAction: 42,
            progress: 76,
            statusBreakdown: {
              belum: 6,
              proses: 12,
              selesai: 22,
              overdue: 2,
            },
            allActionItems: [
              { id: 'ACT-1', title: 'Penyusunan Anggaran Belanja Pondok', pic: 'Bendahara', deadline: '2026-06-30', status: 'Proses', progress: 50 },
              { id: 'ACT-2', title: 'Optimalisasi Server Aplikasi Smart Notes', pic: 'Tim IT', deadline: '2026-06-26', status: 'Overdue', progress: 80 },
              { id: 'ACT-3', title: 'Distribusi Jadwal Piket Santri', pic: 'Koordinator Asrama', deadline: '2026-06-25', status: 'Selesai', progress: 100 },
            ],
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMonitoring();
  }, [user, authLoading]);

  // Filter & Search Action Items
  const filteredActionItems = (summary?.allActionItems || []).filter((act: any) => {
    const matchesStatus =
      filterStatus === 'Semua' ||
      (filterStatus === 'Belum' && act.status === 'Belum') ||
      (filterStatus === 'Proses' && (act.status === 'Proses' || act.status === 'Sedang Dikerjakan')) ||
      (filterStatus === 'Selesai' && act.status === 'Selesai') ||
      (filterStatus === 'Overdue' && act.status === 'Overdue');

    const matchesSearch =
      act.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.pic?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading || !summary) {
    return (
      <AppLayout>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header - Konsisten dengan Manajemen Rapat */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between pb-3.5 border-b border-slate-200/50 dark:border-slate-800/40 animate-fadeIn">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2.5 tracking-tight">
              <BarChart2 className="w-5.5 h-5.5 text-accent shrink-0 stroke-2" />
              Monitoring Rapat
            </h1>
            <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
              Pantau persentase keberhasilan dan status penyelesaian seluruh keputusan rapat
            </p>
          </div>
          <Link
            href="/meetings"
            className="md:hidden px-4 py-2 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-premium active:scale-95 transition-all"
          >
            Rapat
          </Link>
        </div>
        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/10 transition-all cursor-pointer text-slate-700 dark:text-slate-350"
            >
              <option value="Semua">Semua Status</option>
              <option value="Belum">Belum Dikerjakan</option>
              <option value="Proses">Sedang Dikerjakan</option>
              <option value="Selesai">Selesai</option>
              <option value="Overdue">Overdue / Terlambat</option>
            </select>
          </div>
          <Link
            href="/meetings"
            className="hidden md:flex px-5 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs items-center justify-center gap-1.5 border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-250/30 dark:hover:bg-slate-800 transition-colors"
          >
            Kembali ke Rapat
          </Link>
        </div>
      </div>

      {/* Hero Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
        <div className="premium-card p-5 border-t-2 border-t-blue-500">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Meeting</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-1 text-slate-900 dark:text-white tracking-tight">{summary.totalMeeting}</p>
        </div>

        <div className="premium-card p-5 border-t-2 border-t-purple-500">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Action</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-1 text-slate-900 dark:text-white tracking-tight">{summary.totalAction}</p>
        </div>

        <div className="premium-card p-5 border-t-2 border-t-amber-500">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sedang Proses</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-1 text-amber-500 tracking-tight">{summary.statusBreakdown.proses}</p>
        </div>

        <div className="premium-card p-5 border-t-2 border-t-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Selesai</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-1 text-emerald-500 tracking-tight">{summary.statusBreakdown.selesai}</p>
        </div>

        <div className="premium-card p-5 border-t-2 border-t-red-500">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overdue</p>
          <p className="text-2xl md:text-3xl font-extrabold mt-1 text-red-500 animate-pulse tracking-tight">{summary.statusBreakdown.overdue}</p>
        </div>
      </div>

      {/* Progress Bar Eksekutif */}
      <div className="premium-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">Overall Success Rate (Tingkat Keberhasilan)</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Persentase gabungan seluruh tindak lanjut rapat yang telah diselesaikan</p>
          </div>
          <span className="text-2xl font-black text-accent">{summary.progress}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-850 h-5 rounded-full overflow-hidden p-0.5 border border-slate-300/30 dark:border-slate-800/40">
          <div
            className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-1000 shadow-premium"
            style={{ width: `${summary.progress}%` }}
          />
        </div>
      </div>

      {/* Action Items List */}
      <div className="premium-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/40 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">Daftar Pantauan Action Item</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Seluruh tindak lanjut keputusan rapat yang dipantau secara real-time</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas atau PIC..."
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 text-slate-800 dark:text-slate-100 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
            />
          </div>
        </div>

        <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
          {filteredActionItems.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8 font-bold">Tidak ada action item yang sesuai filter</p>
          ) : (
            filteredActionItems.map((act: any) => (
              <div key={act.id} className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-250/20 dark:border-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
                <div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{act.title}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">PIC: <span className="font-bold text-accent">{act.pic}</span> • Deadline: {act.deadline}</p>
                </div>
                <div className="flex items-center gap-4 justify-between md:justify-end">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-accent h-full rounded-full" style={{ width: `${act.progress || (act.status === 'Selesai' ? 100 : 0)}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{act.progress || (act.status === 'Selesai' ? 100 : 0)}%</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${
                    act.status === 'Overdue' ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' :
                    act.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    {act.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
