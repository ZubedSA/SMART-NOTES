'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Settings as SetIcon, Save, RefreshCw, Cloud, Database } from 'lucide-react';

export default function SettingsPage() {
  const [appName, setAppName] = useState('Smart Notes Management System');
  const [gasUrl, setGasUrl] = useState('https://script.google.com/macros/s/.../exec');
  const [driveFolderId, setDriveFolderId] = useState('1A2b3C4d5E6f7G8h9I0j');
  const [sheetId, setSheetId] = useState('1xYz9A8b7C6d5E4f3G2h1I0j');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Konfigurasi sistem berhasil disimpan!');
    }, 1000);
  };

  const inputClass = "w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 text-slate-800 dark:text-slate-100 transition-all duration-200 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_15px_rgba(16,185,129,0.08)]";
  const labelClass = "block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2 pl-0.5";

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between pb-3.5 border-b border-slate-200/50 dark:border-slate-800/40 animate-fadeIn">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2.5 tracking-tight">
            <SetIcon className="w-5.5 h-5.5 text-accent shrink-0 stroke-2" /> Konfigurasi & Pengaturan Sistem
          </h1>
          <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
            Atur tautan Google Apps Script Bridge, Google Drive Storage, dan identitas aplikasi.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="premium-card p-6 space-y-6 max-w-3xl mt-5">
        <h3 className="font-extrabold text-sm md:text-base border-b border-slate-100 dark:border-slate-850 pb-3 tracking-tight text-slate-900 dark:text-white">Integrasi Google Workspace Bridge API</h3>
        
        <div className="space-y-4">
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><Cloud className="w-4 h-4 text-accent"/> Google Apps Script Web App URL</span>
            </label>
            <input
              type="text"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              className={`${inputClass} font-mono`}
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-semibold">URL akhiran /exec yang didapat setelah deploy skrip Code.gs sebagai Web App.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-blue-500"/> Google Spreadsheet ID</span>
              </label>
              <input
                type="text"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><Cloud className="w-4 h-4 text-amber-500"/> Google Drive Folder ID</span>
              </label>
              <input
                type="text"
                value={driveFolderId}
                onChange={(e) => setDriveFolderId(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
        </div>

        <h3 className="font-extrabold text-sm md:text-base border-b border-slate-100 dark:border-slate-850 pb-3 pt-2 tracking-tight text-slate-900 dark:text-white">General Preferences</h3>
        <div>
          <label className={labelClass}>Nama Aplikasi</label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
          <button type="submit" disabled={saving} className="px-6 py-3 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-1.5">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Simpan Konfigurasi
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
