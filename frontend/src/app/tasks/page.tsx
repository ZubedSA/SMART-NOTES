'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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
  Search,
  Filter,
} from 'lucide-react';

const INITIAL_FORM = {
  title: '',
  category: '',
  pic: '',
  deadline: new Date().toISOString().split('T')[0],
  priority: 'Medium',
  status: 'Belum',
};

function TasksContent() {
  const { user, loading: authLoading } = useAuth();
  const isWritable = user && (user.roleName === 'Admin' || user.roleName === 'Manager');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedPriority, setSelectedPriority] = useState('Semua');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const searchParams = useSearchParams();
  const statuses = ['Belum', 'Proses', 'Review', 'Menunggu', 'Selesai'];

  // Listen to searchParams to convert Note to Task
  useEffect(() => {
    if (authLoading || !user) return;
    if (searchParams && searchParams.get('new') === 'true') {
      const title = searchParams.get('title') || '';
      const category = searchParams.get('category') || '';
      setFormData({
        ...INITIAL_FORM,
        title,
        category,
      });
      setShowModal(true);

      // Clean query parameters from URL quietly
      if (typeof window !== 'undefined') {
        const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }
    }
  }, [searchParams, user, authLoading]);

  const fetchTasks = async () => {
    const cachedTasks = typeof window !== 'undefined' ? localStorage.getItem('smart_kanban_tasks_cache') : null;
    const cachedMeetings = typeof window !== 'undefined' ? localStorage.getItem('smart_meetings_cache') : null;
    const cachedMeetingTasks = typeof window !== 'undefined' ? localStorage.getItem('smart_action_items_cache') : null;

    if (!cachedTasks) setLoading(true);

    try {
      const [tskRes, mtgRes, mtgTskRes] = await Promise.all([
        api.get('/task').catch(() => null),
        api.get('/meeting').catch(() => null),
        api.get('/meeting-task').catch(() => null),
      ]);

      const generalTasks = tskRes?.data?.data?.items || [];
      const meetings = mtgRes?.data?.data?.items || JSON.parse(cachedMeetings || '[]');
      const meetingTasks = mtgTskRes?.data?.data?.items || JSON.parse(cachedMeetingTasks || '[]');

      // Cache raw responses
      if (typeof window !== 'undefined') {
        if (tskRes) localStorage.setItem('smart_kanban_tasks_cache', JSON.stringify(generalTasks));
        if (mtgRes) localStorage.setItem('smart_meetings_cache', JSON.stringify(meetings));
        if (mtgTskRes) localStorage.setItem('smart_action_items_cache', JSON.stringify(meetingTasks));
      }

      // Map meeting tasks to have a meeting title, type='meeting-task', and a unified ID
      const mappedMeetingTasks = meetingTasks.map((mt: any) => {
        const mtg = meetings.find((m: any) => m.id === mt.meeting_id);
        return {
          ...mt,
          id: `meeting-${mt.id}`, // prefix to identify meeting tasks
          dbId: mt.id,           // store the real DB ID
          meetingTitle: mtg ? mtg.title : 'Rapat Resmi',
          type: 'meeting-task',
        };
      });

      const mappedGeneralTasks = generalTasks.map((t: any) => ({
        ...t,
        type: 'general',
      }));

      const combined = [...mappedGeneralTasks, ...mappedMeetingTasks];
      setTasks(combined);
    } catch (err) {
      // Offline fallback: load from local storage
      const generalTasks = JSON.parse(cachedTasks || '[]');
      const meetings = JSON.parse(cachedMeetings || '[]');
      const meetingTasks = JSON.parse(cachedMeetingTasks || '[]');

      const mappedMeetingTasks = meetingTasks.map((mt: any) => {
        const mtg = meetings.find((m: any) => m.id === mt.meeting_id);
        return {
          ...mt,
          id: `meeting-${mt.id}`,
          dbId: mt.id,
          meetingTitle: mtg ? mtg.title : 'Rapat Resmi',
          type: 'meeting-task',
        };
      });

      const mappedGeneralTasks = generalTasks.map((t: any) => ({
        ...t,
        type: 'general',
      }));

      setTasks([...mappedGeneralTasks, ...mappedMeetingTasks]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchTasks();
  }, [user, authLoading]);

  const openCreateTask = () => {
    setEditingTaskId(null);
    setFormData(INITIAL_FORM);
    setShowModal(true);
  };

  const openEditTask = (task: any) => {
    if (task.type === 'meeting-task') return;
    setEditingTaskId(task.id);
    setFormData({
      title: task.title || '',
      category: task.category || 'Project UI',
      pic: task.pic || '',
      deadline: task.deadline || new Date().toISOString().split('T')[0],
      priority: task.priority || 'Medium',
      status: task.status || 'Belum',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const previousTasks = [...tasks];
    const tempId = editingTaskId || `TSK-TEMP-${Date.now()}`;
    const optimisticItem = { ...formData, id: tempId, type: 'general' };

    let updatedTasks;
    if (editingTaskId) {
      updatedTasks = tasks.map(t => t.id === editingTaskId ? optimisticItem : t);
    } else {
      updatedTasks = [optimisticItem, ...tasks];
    }

    setTasks(updatedTasks);
    
    // Save only general tasks to local cache
    const generalTasksOnly = updatedTasks.filter(t => t.type === 'general');
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_kanban_tasks_cache', JSON.stringify(generalTasksOnly));
    }
    setShowModal(false);

    try {
      if (editingTaskId) {
        await api.put(`/task/${editingTaskId}`, formData);
      } else {
        const res = await api.post('/task', formData);
        const serverItem = res.data?.data || { ...formData, id: `TSK-${Date.now()}` };
        const finalTasks = updatedTasks.map(t => t.id === tempId ? { ...serverItem, type: 'general' } : t);
        setTasks(finalTasks);
        
        const finalGeneralTasks = finalTasks.filter(t => t.type === 'general');
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_kanban_tasks_cache', JSON.stringify(finalGeneralTasks));
        }
      }
      fetchTasks();
    } catch (err) {
      alert('Gagal menyimpan tugas ke server. Data dikembalikan ke cache lokal.');
      setTasks(previousTasks);
      const prevGeneral = previousTasks.filter(t => t.type === 'general');
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_kanban_tasks_cache', JSON.stringify(prevGeneral));
      }
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const previousTasks = [...tasks];
    const targetTask = tasks.find(t => t.id === id);
    if (!targetTask) return;

    const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);

    const generalTasksOnly = updatedTasks.filter(t => t.type === 'general');
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_kanban_tasks_cache', JSON.stringify(generalTasksOnly));
    }

    try {
      if (targetTask.type === 'meeting-task') {
        await api.put(`/meeting-task/${targetTask.dbId}`, { status: newStatus });
      } else {
        await api.put(`/task/${id}`, { status: newStatus });
      }
      fetchTasks();
    } catch (err) {
      // Offline fallback: keep in local state
    }
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      show: true,
      title: 'Hapus Tugas',
      message: 'Apakah Anda yakin ingin menghapus tugas operasional ini secara permanen?',
      onConfirm: () => executeDelete(id),
    });
  };

  const executeDelete = async (id: string) => {
    const previousTasks = [...tasks];
    const updatedTasks = tasks.filter(t => t.id !== id);

    setTasks(updatedTasks);
    const generalTasksOnly = updatedTasks.filter(t => t.type === 'general');
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_kanban_tasks_cache', JSON.stringify(generalTasksOnly));
    }

    try {
      await api.delete(`/task/${id}`);
      fetchTasks();
    } catch (err) {
      alert('Gagal menghapus tugas dari server. Data dikembalikan.');
      setTasks(previousTasks);
      const prevGeneral = previousTasks.filter(t => t.type === 'general');
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_kanban_tasks_cache', JSON.stringify(prevGeneral));
      }
    }
  };

  // Filter Tasks
  const categories = ['Semua', ...Array.from(new Set(tasks.map(t => t.category || 'Lainnya')))];
  const priorities = ['Semua', 'Critical', 'High', 'Medium', 'Low'];

  const filteredTasks = tasks.filter(t => {
    const matchSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (t.pic || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'Semua' || t.category === selectedCategory;
    const matchPriority = selectedPriority === 'Semua' || t.priority === selectedPriority;
    return matchSearch && matchCategory && matchPriority;
  });

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-200/50';
      case 'High': return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-250/50';
      case 'Medium': return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200/50';
      default: return 'bg-slate-50 text-slate-650 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200/50';
    }
  };

  // ===== INPUT STYLE =====
  const inputClass = "w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 text-slate-800 dark:text-slate-100 transition-all duration-200 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_15px_rgba(16,185,129,0.08)]";
  const labelClass = "block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2 pl-0.5";

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between pb-3.5 border-b border-slate-200/50 dark:border-slate-800/40 animate-fadeIn">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2.5 tracking-tight">
              <CheckSquare className="w-5.5 h-5.5 text-accent shrink-0 stroke-2" />
              Manajemen Tugas
            </h1>
            <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
              Atur alur kerja harian dan kolaborasi tim dari tahap perencanaan hingga selesai
            </p>
          </div>
          {isWritable && (
            <button
              onClick={openCreateTask}
              className="md:hidden px-4 py-2 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-premium active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5px]" /> Task
            </button>
          )}
        </div>
        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
          <div className="bg-slate-105 dark:bg-slate-900/60 p-1 rounded-2xl flex items-center gap-1.5 border border-slate-200/40 dark:border-slate-800/40">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-white dark:bg-slate-950 shadow-sm text-primary dark:text-accent border border-slate-250/20 dark:border-slate-800/35' : 'text-slate-500 dark:text-slate-450'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-950 shadow-sm text-primary dark:text-accent border border-slate-250/20 dark:border-slate-800/35' : 'text-slate-500 dark:text-slate-450'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" /> List
            </button>
          </div>
          <Link
            href="/monitoring"
            className="hidden md:flex text-center px-4 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs items-center justify-center gap-1.5 border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-accent" /> Dashboard
          </Link>
          {isWritable && (
            <button
              onClick={openCreateTask}
              className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-xs items-center justify-center gap-1.5 shadow-premium hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5px]" /> Buat Tugas Baru
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between my-4">
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tugas atau PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 text-slate-800 dark:text-slate-100 outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Filters */}
        <div className="w-full md:w-auto flex flex-wrap gap-3 items-center justify-end">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-350 outline-none cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-355 outline-none cursor-pointer"
            >
              {priorities.map(p => <option key={p} value={p}>{p === 'Semua' ? 'Semua Prioritas' : p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-200/60 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2.5 no-scrollbar">
          {statuses.map((status) => {
            const cols = filteredTasks.filter(t => t.status === status);
            return (
              <div key={status} className="min-w-[300px] w-[300px] shrink-0 premium-card p-4 flex flex-col bg-slate-50/40 dark:bg-slate-900/10">
                <div className="flex items-center justify-between font-extrabold text-xs text-slate-900 dark:text-white mb-4 pb-2.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      status === 'Selesai' ? 'bg-emerald-500' : status === 'Proses' ? 'bg-blue-500' : status === 'Review' ? 'bg-indigo-500' : status === 'Menunggu' ? 'bg-purple-500' : 'bg-slate-400'
                    }`} />
                    {status}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/40 text-[10px] text-slate-500 dark:text-slate-400 font-bold">{cols.length}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[60vh] pr-0.5 no-scrollbar">
                  {cols.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 font-bold text-[10px]">Belum ada tugas</div>
                  ) : (
                    cols.map((task) => (
                      <div key={task.id} className="p-4 rounded-2xl bg-white dark:bg-slate-950 shadow-sm border border-slate-250/20 dark:border-slate-800/35 space-y-2.5 hover:shadow-md hover:scale-[1.01] transition-all duration-200">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/40 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {task.category || 'General'}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-lg border font-bold ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Meeting origin indicator */}
                        {task.type === 'meeting-task' && (
                          <div className="text-[8px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-accent bg-blue-500/5 dark:bg-accent/15 border border-blue-500/20 dark:border-accent/25 px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                            💼 Rapat: {task.meetingTitle}
                          </div>
                        )}

                        <p className="font-bold text-xs text-slate-900 dark:text-white leading-snug">{task.title}</p>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60 font-medium">
                          <span>👤 {task.pic}</span>
                          <span>📅 {task.deadline}</span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-2">
                          <select
                            value={task.status}
                            disabled={!isWritable}
                            onChange={(e) => updateStatus(task.id, e.target.value)}
                            className="flex-1 text-[10px] p-1.5 rounded-lg bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-355 font-bold outline-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                          >
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>

                          {task.type === 'meeting-task' ? (
                            <span
                              className="text-[8px] font-bold text-slate-400 dark:text-slate-500 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-slate-800/30 cursor-help"
                              title="Tugas Rapat Resmi. Ubah melalui halaman Rapat untuk menjaga integritas dokumen."
                            >
                              🔒 Rapat
                            </span>
                          ) : (
                            isWritable && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditTask(task)}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(task.id)}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="premium-card p-0 overflow-hidden my-2.5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="p-4 pl-6 text-[10px] tracking-wider">Judul Task</th>
                  <th className="p-4 text-[10px] tracking-wider">Kategori</th>
                  <th className="p-4 text-[10px] tracking-wider">PIC</th>
                  <th className="p-4 text-[10px] tracking-wider">Deadline</th>
                  <th className="p-4 text-[10px] tracking-wider">Prioritas</th>
                  <th className="p-4 text-[10px] tracking-wider">Status</th>
                  <th className="p-4 pr-6 text-[10px] tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-bold">Tidak ada data tugas</td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">
                        <div className="space-y-1">
                          <p>{task.title}</p>
                          {task.type === 'meeting-task' && (
                            <span className="text-[8px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-accent bg-blue-500/5 dark:bg-accent/15 border border-blue-500/20 dark:border-accent/25 px-2 py-0.5 rounded-md inline-block max-w-xs truncate">
                              💼 Rapat: {task.meetingTitle}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">{task.category || 'General'}</td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">👤 {task.pic}</td>
                      <td className="p-4 font-medium text-slate-500">📅 {task.deadline}</td>
                      <td className="p-4">
                        <span className={`text-[9px] px-2 py-0.5 rounded-lg border font-bold ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={task.status}
                          disabled={!isWritable}
                          onChange={(e) => updateStatus(task.id, e.target.value)}
                          className="p-1.5 rounded-xl bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-xs cursor-pointer outline-none text-slate-700 dark:text-slate-350 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          {task.type === 'meeting-task' ? (
                            <span
                              className="text-[9px] font-bold text-slate-400 dark:text-slate-500 px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-slate-800/30 cursor-help"
                              title="Tugas Rapat Resmi. Ubah melalui halaman Rapat untuk menjaga integritas dokumen."
                            >
                              🔒 Rapat
                            </span>
                          ) : (
                            isWritable && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditTask(task)}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-accent hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(task.id)}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Task */}
      {showModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white/95 dark:bg-slate-950/90 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 p-6 shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                {editingTaskId ? '✏️ Edit Tugas Operasional' : '📋 Tambah Tugas Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"><X className="w-5 h-5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200" /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar pb-4">
                <div>
                  <label className={labelClass}>Judul Tugas</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Implementasi PWA Offline Cache"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Kategori / Divisi</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Contoh: Testing, UI, Keuangan"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Penanggung Jawab (PIC)</label>
                    <input
                      type="text"
                      required
                      value={formData.pic}
                      onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                      placeholder="Nama Staf"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tenggat Waktu (Deadline)</label>
                    <input
                      type="date"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Tingkat Prioritas</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Critical">🔴 Critical</option>
                      <option value="High">🟠 High</option>
                      <option value="Medium">🔵 Medium</option>
                      <option value="Low">⚪ Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Status Alur Kerja</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={inputClass}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="flex justify-end gap-2.5 p-6 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold uppercase tracking-wider transition-all">Batal</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-1.5">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CUSTOM CONFIRMATION MODAL ===== */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] p-6 text-center space-y-4 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">{confirmModal.title}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-450 font-semibold leading-relaxed px-2">{confirmModal.message}</p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900 text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, show: false });
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-premium hover:shadow-red-500/20 active:scale-[0.98] transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-200/60 dark:bg-slate-800/60 rounded-3xl animate-pulse m-6" />}>
      <TasksContent />
    </Suspense>
  );
}
