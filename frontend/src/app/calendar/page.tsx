'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import api from '@/lib/api';
import {
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  TrendingUp,
  X,
  Edit3,
  Trash2,
  AlertCircle,
  Info,
} from 'lucide-react';

const INITIAL_AGENDA_FORM = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  location: '',
  type: 'agenda', // agenda, meeting, task
  color: '#10b981', // green, blue, amber
};

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [agendaForm, setAgendaForm] = useState(INITIAL_AGENDA_FORM);

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

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      // Ambil data rapat, tugas kanban, dan agenda khusus
      const [mtgRes, tskRes, agdRes] = await Promise.all([
        api.get('/meeting').catch(() => null),
        api.get('/task').catch(() => null),
        api.get('/agenda').catch(() => null),
      ]);

      const meetings = mtgRes?.data?.data?.items || JSON.parse(localStorage.getItem('smart_meetings_cache') || '[]');
      const tasks = tskRes?.data?.data?.items || JSON.parse(localStorage.getItem('smart_kanban_tasks_cache') || '[]');
      const agendas = agdRes?.data?.data || JSON.parse(localStorage.getItem('smart_agenda_cache') || '[]');

      // Satukan ke format kalender terpadu
      const formattedMeetings = meetings.map((m: any) => ({
        id: `meeting-${m.id}`,
        dbId: m.id,
        title: `[Rapat] ${m.title}`,
        date: m.date,
        time: m.time || '09:00',
        location: m.location || 'Zoom / Ruang Rapat',
        type: 'meeting',
        color: '#3b82f6', // Biru
      }));

      const formattedTasks = tasks.map((t: any) => ({
        id: `task-${t.id}`,
        dbId: t.id,
        title: `[Tenggat Task] ${t.title} (PIC: ${t.pic})`,
        date: t.deadline,
        time: '23:59',
        location: 'Papan Kanban',
        type: 'task',
        color: '#f59e0b', // Amber
      }));

      const formattedAgendas = agendas.map((a: any) => ({
        id: `agenda-${a.id}`,
        dbId: a.id,
        title: a.title,
        date: a.date,
        time: a.time || '09:00',
        location: a.location || 'Kantor',
        type: 'agenda',
        color: a.color || '#10b981', // Emerald
      }));

      const unified = [...formattedMeetings, ...formattedTasks, ...formattedAgendas];
      setEvents(unified);
      
      // Simpan agenda khusus ke cache lokal
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_agenda_cache', JSON.stringify(agendas));
      }
    } catch (err) {
      // Fallback lokal jika terjadi error jaringan parah
      const localAgendas = JSON.parse(localStorage.getItem('smart_agenda_cache') || '[]');
      const formattedAgendas = localAgendas.map((a: any) => ({
        id: `agenda-${a.id}`,
        dbId: a.id,
        title: a.title,
        date: a.date,
        time: a.time,
        location: a.location,
        type: 'agenda',
        color: a.color || '#10b981',
      }));
      
      const demoEvents = [
        { id: 'demo-1', title: '[Rapat] Audit Keamanan Sistem Q3', date: '2026-06-28', time: '13:00', type: 'meeting', color: '#3b82f6', location: 'Ruang Server' },
        { id: 'demo-2', title: '[Rapat] Review Anggaran Operasional', date: '2026-06-28', time: '15:30', type: 'meeting', color: '#3b82f6', location: 'Zoom' },
        { id: 'demo-3', title: '[Tenggat Task] Uji Coba PWA Offline Mode', date: '2026-06-30', time: '23:59', type: 'task', color: '#f59e0b', location: 'Papan Kanban' },
      ];
      setEvents([...demoEvents, ...formattedAgendas]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [];
  // Fill previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const month = currentMonth === 0 ? 11 : currentMonth - 1;
    const year = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({ day, dateStr, isCurrentMonth: false });
  }

  // Fill current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({ day: i, dateStr, isCurrentMonth: true });
  }

  // Fill next month leading days to complete grid rows
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    const month = currentMonth === 11 ? 0 : currentMonth + 1;
    const year = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({ day: i, dateStr, isCurrentMonth: false });
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleCellClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setAgendaForm({
      ...INITIAL_AGENDA_FORM,
      date: dateStr,
    });
  };

  const openCreateAgenda = () => {
    setEditingEventId(null);
    setAgendaForm({
      ...INITIAL_AGENDA_FORM,
      date: selectedDate,
    });
    setShowModal(true);
  };

  const openEditAgenda = (event: any) => {
    if (event.type !== 'agenda') {
      alert('Rapat dan Tugas harus diubah dari halaman masing-masing untuk menjaga konsistensi.');
      return;
    }
    setEditingEventId(event.dbId);
    setAgendaForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
      color: event.color,
    });
    setShowModal(true);
  };

  const handleSaveAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    const localAgendas = JSON.parse(localStorage.getItem('smart_agenda_cache') || '[]');
    let updatedAgendas;

    if (editingEventId) {
      updatedAgendas = localAgendas.map((a: any) => a.id === editingEventId ? { ...agendaForm, id: editingEventId } : a);
    } else {
      const newId = `AGD-${Date.now()}`;
      updatedAgendas = [{ ...agendaForm, id: newId }, ...localAgendas];
    }

    // Update local cache immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_agenda_cache', JSON.stringify(updatedAgendas));
    }
    setShowModal(false);

    try {
      if (editingEventId) {
        await api.put(`/agenda/${editingEventId}`, agendaForm);
      } else {
        await api.post('/agenda', agendaForm);
      }
      fetchAllEvents();
    } catch (err) {
      // Backend offline fallback
      fetchAllEvents();
    }
  };

  const handleDeleteAgenda = (event: any) => {
    if (event.type !== 'agenda') {
      alert('Untuk menghapus rapat atau tugas, silakan gunakan halaman modul masing-masing.');
      return;
    }
    setConfirmModal({
      show: true,
      title: 'Hapus Agenda',
      message: 'Apakah Anda yakin ingin menghapus agenda kegiatan ini secara permanen?',
      onConfirm: () => executeDeleteAgenda(event.dbId),
    });
  };

  const executeDeleteAgenda = async (id: string) => {
    const localAgendas = JSON.parse(localStorage.getItem('smart_agenda_cache') || '[]');
    const updatedAgendas = localAgendas.filter((a: any) => a.id !== id);

    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_agenda_cache', JSON.stringify(updatedAgendas));
    }

    try {
      await api.delete(`/agenda/${id}`);
      fetchAllEvents();
    } catch (err) {
      // Fallback
      fetchAllEvents();
    }
  };

  // Get selected day events
  const selectedDayEvents = events.filter(ev => ev.date === selectedDate);

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
              <CalIcon className="w-5.5 h-5.5 text-accent shrink-0 stroke-2" />
              Kalender & Agenda Terpadu
            </h1>
            <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
              Lini masa kegiatan organisasi, jadwal rapat, dan batas tenggat waktu tugas
            </p>
          </div>
          <button
            onClick={openCreateAgenda}
            className="md:hidden px-4 py-2 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-premium active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5px]" /> Agenda
          </button>
        </div>
        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
          <Link
            href="/monitoring"
            className="hidden md:flex text-center px-4 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-355 font-bold rounded-xl text-xs items-center justify-center gap-1.5 border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-accent" /> Dashboard
          </Link>
          <button
            onClick={openCreateAgenda}
            className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-xs items-center justify-center gap-1.5 shadow-premium hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5px]" /> Tambah Agenda Baru
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 bg-slate-200/60 dark:bg-slate-800/60 rounded-3xl animate-pulse mt-6" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
          {/* Calendar Grid Container */}
          <div className="premium-card p-5 lg:col-span-2 space-y-4 flex flex-col justify-between">
            {/* Nav Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4">
              <h2 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                📅 {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1">
              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center font-bold text-[10px] text-slate-400 tracking-wider uppercase mb-2">
                <div>Min</div>
                <div>Sen</div>
                <div>Sel</div>
                <div>Rab</div>
                <div>Kam</div>
                <div>Jum</div>
                <div>Sab</div>
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1 border-t border-slate-100 dark:border-slate-800/40 pt-2">
                {calendarCells.map((cell, idx) => {
                  const cellEvents = events.filter(e => e.date === cell.dateStr);
                  const isSelected = selectedDate === cell.dateStr;
                  const isToday = new Date().toISOString().split('T')[0] === cell.dateStr;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleCellClick(cell.dateStr)}
                      className={`h-16 md:h-20 p-1.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-accent bg-accent/5 dark:bg-emerald-950/15'
                          : isToday
                            ? 'border-primary bg-primary/5 dark:bg-slate-900'
                            : 'border-slate-100/50 dark:border-slate-850 bg-white dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-900'
                      } ${!cell.isCurrentMonth ? 'opacity-40' : ''}`}
                    >
                      <span className={`text-[10px] font-bold ${
                        isSelected ? 'text-accent' : isToday ? 'text-primary' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {cell.day}
                      </span>
                      {/* Dots / Small badges for events */}
                      <div className="space-y-0.5 overflow-hidden max-h-[40px] md:max-h-[50px] no-scrollbar">
                        {cellEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className="hidden md:block text-[8px] font-bold px-1 py-0.5 rounded truncate text-white"
                            style={{ backgroundColor: ev.color }}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {/* Mobile Dot Indicator */}
                        {cellEvents.length > 0 && (
                          <div className="flex md:hidden gap-0.5 flex-wrap justify-end">
                            {cellEvents.slice(0, 3).map((ev) => (
                              <span
                                key={ev.id}
                                className="w-1.5 h-1.5 rounded-full inline-block"
                                style={{ backgroundColor: ev.color }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Agenda Sidebar Panel */}
          <div className="premium-card p-5 space-y-4 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800/40 pb-3 shrink-0">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                📅 Agenda pada {selectedDate}
              </h2>
              <p className="text-[10px] text-slate-450 mt-0.5 font-medium">Jadwal kegiatan spesifik pada tanggal yang dipilih</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 no-scrollbar">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-xs text-slate-400 font-bold">Tidak ada agenda pada tanggal ini</p>
                  <button
                    onClick={openCreateAgenda}
                    className="px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-[10px] font-bold text-slate-500 hover:text-accent hover:border-accent transition-colors"
                  >
                    + Buat Agenda Baru
                  </button>
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/30 relative overflow-hidden group space-y-2.5 transition-transform hover:scale-[1.01]">
                    <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: ev.color }} />
                    <div className="flex justify-between items-start pl-1 gap-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg text-white uppercase tracking-wider" style={{ backgroundColor: ev.color }}>
                        {ev.type}
                      </span>
                      {ev.type === 'agenda' && (
                        <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditAgenda(ev)}
                            className="p-1 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-accent"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgenda(ev)}
                            className="p-1 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-white pl-1 leading-snug tracking-tight">
                      {ev.title}
                    </h3>

                    <div className="flex flex-col gap-1.5 text-[10px] text-slate-500 pl-1 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {ev.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ev.location}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Agenda CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white/95 dark:bg-slate-950/90 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 p-6 shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                {editingEventId ? '✏️ Edit Kegiatan Agenda' : '📋 Tambah Agenda Organisasi'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"><X className="w-5 h-5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200" /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAgenda} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar pb-4">
                <div>
                  <label className={labelClass}>Judul Kegiatan / Nama Agenda *</label>
                  <input
                    type="text"
                    required
                    value={agendaForm.title}
                    onChange={(e) => setAgendaForm({ ...agendaForm, title: e.target.value })}
                    placeholder="Contoh: Audit Eksternal Keuangan Q3"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tanggal Kegiatan</label>
                    <input
                      type="date"
                      required
                      value={agendaForm.date}
                      onChange={(e) => setAgendaForm({ ...agendaForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Waktu Mulai (WIB)</label>
                    <input
                      type="time"
                      required
                      value={agendaForm.time}
                      onChange={(e) => setAgendaForm({ ...agendaForm, time: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Lokasi Pelaksanaan</label>
                  <input
                    type="text"
                    value={agendaForm.location}
                    onChange={(e) => setAgendaForm({ ...agendaForm, location: e.target.value })}
                    placeholder="Contoh: Ruang Utama, Zoom, Aula Gedung C"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Kategori Agenda</label>
                    <select
                      value={agendaForm.type}
                      onChange={(e) => setAgendaForm({ ...agendaForm, type: e.target.value })}
                      className={inputClass}
                    >
                      <option value="agenda">📅 Kegiatan Umum</option>
                      <option value="meeting">💼 Rapat Resmi</option>
                      <option value="task">📝 Penugasan Staf</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Warna Identitas Kegiatan</label>
                    <select
                      value={agendaForm.color}
                      onChange={(e) => setAgendaForm({ ...agendaForm, color: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="#10b981">🟢 Emerald Mint (Umum)</option>
                      <option value="#3b82f6">🔵 Royal Blue (Rapat)</option>
                      <option value="#f59e0b">🟡 Amber Gold (Task)</option>
                      <option value="#ef4444">🔴 Crimson Red (Urgensi)</option>
                      <option value="#8b5cf6">🟣 Velvet Violet</option>
                    </select>
                  </div>
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
