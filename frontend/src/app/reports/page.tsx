'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { FileText, Download, Printer, FileSpreadsheet, CheckCircle2, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = (type: string) => {
    setDownloading(type);
    setTimeout(() => {
      setDownloading(null);
      alert(`Laporan berhasil diunduh dalam format ${type}!`);
    }, 1500);
  };

  const reports = [
    { title: 'Laporan Eksekutif Rapat (Meeting)', desc: 'Rekapitulasi kehadiran, notulen, dan keputusan rapat mingguan/bulanan.' },
    { title: 'Laporan Tindak Lanjut & Action Items', desc: 'Daftar progress penyelesaian tugas hasil rapat berdasarkan PIC.' },
    { title: 'Laporan Produktivitas Catatan', desc: 'Statistik pembuatan catatan organisasi dan aktivitas personal.' },
    { title: 'Laporan Audit Log & Akses Pengguna', desc: 'Daftar riwayat login dan perubahan data oleh seluruh anggota tim.' },
  ];

  return (
    <AppLayout>
      {/* Header - Konsisten dengan Manajemen Rapat */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between pb-3.5 border-b border-slate-200/50 dark:border-slate-800/40 animate-fadeIn">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2.5 tracking-tight">
              <FileText className="w-5.5 h-5.5 text-accent shrink-0 stroke-2" />
              Pusat Laporan Eksekutif
            </h1>
            <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
              Unduh laporan formal untuk kebutuhan manajemen dan audit internal
            </p>
          </div>
          <Link
            href="/monitoring"
            className="md:hidden px-4 py-2 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-premium active:scale-95 transition-all"
          >
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
          <Link
            href="/monitoring"
            className="hidden md:flex text-center px-4 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs items-center justify-center gap-1.5 border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-accent" /> Dashboard
          </Link>
          <button
            onClick={() => window.print()}
            className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-xs items-center justify-center gap-1.5 shadow-premium hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Printer className="w-4 h-4 stroke-[2px]" /> Cetak Semua Laporan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 pt-4">
        {reports.map((rep, idx) => (
          <div key={idx} className="premium-card p-5 relative overflow-hidden flex flex-col justify-between gap-4 hover:shadow-md hover:scale-[1.01] transition-all duration-200">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
            <div className="pl-2">
              <h3 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white tracking-tight">{rep.title}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed font-semibold">{rep.desc}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-850 pl-2">
              <button
                onClick={() => handleExport('PDF')}
                disabled={!!downloading}
                className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-red-500/10"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => handleExport('Excel')}
                disabled={!!downloading}
                className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-650 dark:text-emerald-450 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-500/10"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button
                onClick={() => handleExport('CSV')}
                disabled={!!downloading}
                className="px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-650 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-blue-500/10"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-500/10 hover:bg-slate-500/20 text-slate-650 dark:text-slate-350 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-500/10 ml-auto"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
