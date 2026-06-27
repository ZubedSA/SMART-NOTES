'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import api from '@/lib/api';
import {
  CheckSquare,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  X,
  Edit3,
  Trash2,
  TrendingUp,
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Project UI',
    pic: 'Staff Lapangan',
    deadline: new Date().toISOString().split('T')[0],
    priority: 'High',
    status: 'Belum',
  });

  const statuses = ['Belum', 'Proses', 'Review', 'Menunggu', 'Selesai', 'Batal', 'Overdue'];

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/task');
      setTasks(res?.data?.data?.items || []);
    } catch (err) {
      setTasks([
        { id: 'TSK-1', title: 'Uji Coba PWA Offline Mode', category: 'Testing', pic: 'Staff Lapangan', deadline: '2026-07-01', priority: 'Critical', status: 'Proses' },
        { id: 'TSK-2', title: 'Lengkapi Dokumentasi API GAS', category: 'Backend', pic: 'Admin', deadline: '2026-06-30', priority: 'High', status: 'Review' },
        { id: 'TSK-3', title: 'Desain Logo Smart Notes 512px', category: 'Design', pic: 'Tim Grafis', deadline: '2026-06-25', priority: 'Medium', status: 'Selesai' },
        { id: 'TSK-4', title: 'Review Anggaran Inventaris', category: 'Keuangan', pic: 'Bendahara', deadline: '2026-06-28', priority: 'Low', status: 'Belum' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/task', formData);
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      setTasks([{ ...formData, id: `TSK-${Date.now()}` }, ...tasks]);
      setShowModal(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await api.put(`/task/${id}`, { status: newStatus });
    } catch (err) {}
  };

  return (
    <AppLayout>
      {/* Header - Konsisten dengan Manajemen Rapat */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-accent shrink-0" />
              Manajemen Tugas
            </h1>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Atur alur kerja harian dan kolaborasi tim dari tahap perencanaan hingga selesai
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="md:hidden px-3.5 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" /> Task
          </button>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-accent' : 'text-slate-500'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-accent' : 'text-slate-500'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" /> List
            </button>
          </div>
          <Link
            href="/monitoring"
            className="hidden md:flex text-center px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-accent" /> Dashboard
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Buat Tugas Baru
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar">
          {statuses.slice(0, 5).map((status) => {
            const cols = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="min-w-[280px] w-[280px] shrink-0 glass-card p-4 flex flex-col bg-slate-100/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between font-bold text-xs text-slate-700 dark:text-slate-300 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      status === 'Selesai' ? 'bg-emerald-500' : status === 'Proses' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    {status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">{cols.length}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[60vh]">
                  {cols.map((task) => (
                    <div key={task.id} className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 space-y-2 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-semibold text-slate-600 dark:text-slate-300">
                          {task.category}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          task.priority === 'Critical' ? 'text-red-500' : task.priority === 'High' ? 'text-amber-500' : 'text-blue-500'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{task.title}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        <span>PIC: {task.pic}</span>
                        <span>{task.deadline}</span>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className="w-full text-[10px] p-1 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-medium mt-1"
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 font-semibold uppercase">
              <tr>
                <th className="p-4">Judul Task</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">PIC</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">Prioritas</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{task.title}</td>
                  <td className="p-4">{task.category}</td>
                  <td className="p-4 font-medium">{task.pic}</td>
                  <td className="p-4">{task.deadline}</td>
                  <td className="p-4 font-bold">{task.priority}</td>
                  <td className="p-4">
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-xs"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Task */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="font-bold text-base">Tambah Task Baru</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Judul Task</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Implementasi PWA Offline Cache"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">PIC</label>
                  <input
                    type="text"
                    value={formData.pic}
                    onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl text-xs">Batal</button>
                <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-xl text-xs shadow-md">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
