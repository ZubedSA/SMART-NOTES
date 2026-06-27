'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import api from '@/lib/api';
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
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Semua');

  useEffect(() => {
    const fetchMonitoring = async () => {
      try {
        const res = await api.get('/meeting/monitoring/summary');
        setSummary(res.data.data);
      } catch (err) {
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
          recentActionItems: [
            { id: 'ACT-1', title: 'Penyusunan Anggaran Belanja Pondok', pic: 'Bendahara', deadline: '2026-06-30', status: 'Proses', progress: 50 },
            { id: 'ACT-2', title: 'Optimalisasi Server Aplikasi Smart Notes', pic: 'Tim IT', deadline: '2026-06-26', status: 'Overdue', progress: 80 },
            { id: 'ACT-3', title: 'Distribusi Jadwal Piket Santri', pic: 'Koordinator Asrama', deadline: '2026-06-25', status: 'Selesai', progress: 100 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMonitoring();
  }, []);

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
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-accent shrink-0" />
              Monitoring Rapat
            </h1>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau persentase keberhasilan dan status penyelesaian seluruh keputusan rapat
            </p>
          </div>
          <Link
            href="/meetings"
            className="md:hidden px-3.5 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            Rapat
          </Link>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all cursor-pointer"
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
            className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all"
          >
            Kembali ke Rapat
          </Link>
        </div>
      </div>

      {/* Hero Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-5 border-t-4 border-t-blue-500">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Meeting</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{summary.totalMeeting}</p>
        </div>

        <div className="glass-card p-5 border-t-4 border-t-purple-500">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Action</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{summary.totalAction}</p>
        </div>

        <div className="glass-card p-5 border-t-4 border-t-amber-500">
          <p className="text-xs font-medium text-slate-500 uppercase">Sedang Proses</p>
          <p className="text-2xl font-bold mt-1 text-amber-500">{summary.statusBreakdown.proses}</p>
        </div>

        <div className="glass-card p-5 border-t-4 border-t-emerald-500">
          <p className="text-xs font-medium text-slate-500 uppercase">Selesai</p>
          <p className="text-2xl font-bold mt-1 text-emerald-500">{summary.statusBreakdown.selesai}</p>
        </div>

        <div className="glass-card p-5 border-t-4 border-t-red-500">
          <p className="text-xs font-medium text-slate-500 uppercase">Overdue</p>
          <p className="text-2xl font-bold mt-1 text-red-500 animate-pulse">{summary.statusBreakdown.overdue}</p>
        </div>
      </div>

      {/* Progress Bar Eksekutif */}
      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Overall Success Rate (Tingkat Keberhasilan)</h3>
            <p className="text-xs text-slate-500">Persentase gabungan seluruh tindak lanjut rapat yang telah diselesaikan</p>
          </div>
          <span className="text-2xl font-black text-accent">{summary.progress}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-1000 shadow-md"
            style={{ width: `${summary.progress}%` }}
          />
        </div>
      </div>

      {/* Action Items List */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Daftar Pantauan Action Item Terbaru</h3>
        <div className="space-y-3">
          {summary.recentActionItems.map((act: any) => (
            <div key={act.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{act.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">PIC: <span className="font-semibold text-accent">{act.pic}</span> • Deadline: {act.deadline}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-accent h-full rounded-full" style={{ width: `${act.progress}%` }} />
                  </div>
                  <span className="text-xs font-bold">{act.progress}%</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  act.status === 'Overdue' ? 'bg-red-500/10 text-red-500 animate-pulse' :
                  act.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {act.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
