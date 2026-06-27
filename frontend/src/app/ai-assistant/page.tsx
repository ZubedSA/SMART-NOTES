'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Sparkles, Bot, FileText, CheckSquare, Send, RefreshCw, Copy, Check, TrendingUp } from 'lucide-react';

export default function AIAssistantPage() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleMeetingText = `Rapat Evaluasi Mingguan IT dan Infrastruktur Pondok (27 Juni 2026).
Dihadiri oleh: Ustadz Ahmad, Tim IT (Fauzan), Bendahara (Pak Budi).
Pembahasan:
1. Server aplikasi Smart Notes perlu ditingkatkan kapasitas RAM-nya menjadi 8GB karena santri baru mulai aktif mengakses materi pelajaran.
2. Pengajuan pembelian 20 meja belajar baru untuk asrama putra lantai 2 sudah diverifikasi harga oleh Pak Budi sebesar Rp 4.500.000.
Keputusan:
- Fauzan segera melakukan upgrade spesifikasi VPS paling lambat tanggal 29 Juni 2026.
- Pak Budi mencairkan dana pembelian meja belajar hari Senin tanggal 30 Juni 2026.`;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setSummary('Rapat membahas peningkatan kapasitas server VPS Smart Notes menjadi 8GB untuk menampung santri baru dan persetujuan pencairan dana pembelian 20 meja belajar asrama putra senilai Rp 4,5 juta.');
      setActionItems([
        'Upgrade spesifikasi VPS menjadi 8GB RAM (PIC: Fauzan / Tim IT - Deadline: 29 Juni 2026)',
        'Pencairan dana pembelian 20 meja belajar asrama (PIC: Pak Budi / Bendahara - Deadline: 30 Juni 2026)'
      ]);
      setLoading(false);
    }, 1500);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(`Ringkasan:\n${summary}\n\nAction Items:\n- ${actionItems.join('\n- ')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      {/* Header - Konsisten dengan Manajemen Rapat */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent animate-spin shrink-0" style={{ animationDuration: '4s' }} />
              AI Assistant Smart Notulen
            </h1>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Otomatisasi perangkuman transkrip rapat dan ekstraksi daftar tugas dengan AI
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
          <Link
            href="/monitoring"
            className="hidden md:flex text-center px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-accent" /> Dashboard
          </Link>
          <button
            onClick={() => setInputText(sampleMeetingText)}
            className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Gunakan Teks Contoh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Input */}
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent" />
          <div className="flex justify-between items-center pl-2">
            <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white"><FileText className="w-4 h-4 text-accent"/> Transkrip / Catatan Rapat Mentah</h3>
            <button
              onClick={() => setInputText(sampleMeetingText)}
              className="md:hidden text-xs text-accent hover:underline font-semibold"
            >
              Contoh Teks
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <textarea
              rows={10}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tempel transkrip percakapan rapat, notulen kasar, atau catatan ide panjang di sini..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs outline-none leading-relaxed"
            />

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary via-emerald-700 to-accent text-white font-semibold shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
              <span>{loading ? 'Menganalisis Notulen dengan AI...' : 'Rangkum & Buat Action Items Otomatis'}</span>
            </button>
          </form>
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent" />
          <div className="space-y-6 pl-2">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white"><Bot className="w-5 h-5 text-accent"/> Hasil Analisis AI</h3>
              {summary && (
                <button onClick={copyResult} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200 transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-accent"/> : <Copy className="w-3.5 h-3.5"/>} {copied ? 'Disalin' : 'Salin Hasil'}
                </button>
              )}
            </div>

            {!summary ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Bot className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-700"/>
                <p className="text-xs">Hasil ringkasan eksekutif dan daftar tugas otomatis akan muncul di sini.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-emerald-500/10 px-2.5 py-1 rounded-lg">Executive Summary</span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium mt-2">{summary}</p>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-accent"/> Extracted Action Items ({actionItems.length}):
                  </span>
                  <div className="space-y-2">
                    {actionItems.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-start gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center shrink-0 text-[10px] shadow-sm">{idx+1}</div>
                        <span className="mt-0.5">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
