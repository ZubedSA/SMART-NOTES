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
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
              <FileText className="w-6 h-6 text-accent shrink-0" />
              Pusat Laporan Eksekutif
            </h1>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unduh laporan formal untuk kebutuhan manajemen dan audit internal
            </p>
          </div>
          <Link
            href="/monitoring"
            className="md:hidden px-3.5 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <Link
            href="/monitoring"
            className="hidden md:flex text-center px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-accent" /> Dashboard
          </Link>
          <button
            onClick={() => window.print()}
            className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Semua Laporan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {reports.map((rep, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent" />
            <div className="pl-2">
              <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white">{rep.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{rep.desc}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 pl-2">
              <button
                onClick={() => handleExport('PDF')}
                disabled={!!downloading}
                className="px-3 py-1.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => handleExport('Excel')}
                disabled={!!downloading}
                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button
                onClick={() => handleExport('CSV')}
                disabled={!!downloading}
                className="px-3 py-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-500/10 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ml-auto"
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
