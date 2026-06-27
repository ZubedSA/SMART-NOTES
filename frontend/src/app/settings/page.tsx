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

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SetIcon className="w-7 h-7 text-primary dark:text-accent" /> Konfigurasi & Pengaturan Sistem
          </h1>
          <p className="text-xs text-slate-500 mt-1">Atur tautan Google Apps Script Bridge, Google Drive Storage, dan identitas aplikasi.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 space-y-6 max-w-3xl">
        <h3 className="font-bold text-base border-b pb-3">Integrasi Google Workspace Bridge API</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5"><Cloud className="w-4 h-4 text-accent"/> Google Apps Script Web App URL</label>
            <input
              type="text"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs outline-none font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">URL akhiran /exec yang didapat setelah deploy skrip Code.gs sebagai Web App.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5"><Database className="w-4 h-4 text-blue-500"/> Google Spreadsheet ID</label>
              <input
                type="text"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5"><Cloud className="w-4 h-4 text-amber-500"/> Google Drive Folder ID</label>
              <input
                type="text"
                value={driveFolderId}
                onChange={(e) => setDriveFolderId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <h3 className="font-bold text-base border-b pb-3 pt-4">General Preferences</h3>
        <div>
          <label className="block text-xs font-semibold mb-1">Nama Aplikasi</label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs outline-none"
          />
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button type="submit" disabled={saving} className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg hover:opacity-95">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Simpan Konfigurasi
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
