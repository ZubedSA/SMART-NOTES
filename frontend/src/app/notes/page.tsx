'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import api from '@/lib/api';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Star,
  Archive,
  Share2,
  Lock,
  Clock,
  MapPin,
  Tag,
  Paperclip,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedPriority, setSelectedPriority] = useState('Semua');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Catatan Pribadi',
    content: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    label: 'Ide',
    status: 'Published',
    priority: 'Medium',
    visibility: 'Private',
    is_favorite: 'false',
    is_meeting_draft: 'false',
  });

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

  const categories = [
    'Semua',
    'Catatan Pribadi',
    'Catatan Meeting',
    'Catatan Agenda',
    'Catatan Organisasi',
    'Catatan Pondok',
    'Catatan Hafalan',
    'Catatan Pembelajaran',
    'Catatan Ide',
    'Catatan Project',
    'Catatan Keuangan',
    'Catatan Harian',
  ];

  const fetchNotes = async () => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('smart_notes_cache') : null;
    if (!cached) setLoading(true);
    try {
      const res = await api.get('/notes');
      const fetchedItems = res?.data?.data?.items || [];
      setNotes(fetchedItems);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_notes_cache', JSON.stringify(fetchedItems));
      }
    } catch (err) {
      if (!cached) {
        const fallbacks = [
          { id: 'NOTE-1', title: 'Strategi Pengembangan Q3', category: 'Catatan Project', content: 'Fokus utama pada mobile UI dan integrasi Google Drive.', date: '2026-06-27', time: '10:00', priority: 'High', status: 'Published', visibility: 'Private', is_favorite: 'true', location: 'Kantor Pusat' },
          { id: 'NOTE-2', title: 'Hafalan Surat Al-Kahfi Ayat 1-10', category: 'Catatan Hafalan', content: 'Diulang setelah sholat Shubuh dan Maghrib bersama ustadz.', date: '2026-06-26', time: '05:30', priority: 'High', status: 'Published', visibility: 'Private', is_favorite: 'true', location: 'Masjid Pondok' },
          { id: 'NOTE-3', title: 'Ide Rapat Evaluasi Bulanan', category: 'Catatan Meeting', content: 'Diskusikan action item overdue dari divisi IT.', date: '2026-06-25', time: '14:30', priority: 'Medium', status: 'Draft', visibility: 'Shared', is_favorite: 'false', location: 'Ruang Rapat' },
          { id: 'NOTE-4', title: 'Anggaran Belanja Inventaris Pondok', category: 'Catatan Keuangan', content: 'Pembelian 20 meja belajar baru untuk asrama putra.', date: '2026-06-24', time: '11:00', priority: 'Critical', status: 'Published', visibility: 'Shared', is_favorite: 'false', location: 'Gudang' },
        ];
        setNotes(fallbacks);
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_notes_cache', JSON.stringify(fallbacks));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('smart_notes_cache');
      if (cached) {
        try {
          setNotes(JSON.parse(cached));
          setLoading(false);
        } catch (e) {}
      }
      
      // Auto open modal jika parameter url ?new=true
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('new') === 'true') {
        handleOpenModal();
        // Bersihkan parameter dari URL agar tidak berulang saat di-refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    fetchNotes();
  }, []);

  const handleOpenModal = (note?: any) => {
    if (note) {
      setEditingNote(note);
      const isDraft = note.is_meeting_draft === true || String(note.is_meeting_draft).toLowerCase().trim() === 'true';
      setFormData({
        ...note,
        is_meeting_draft: isDraft ? 'true' : 'false',
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        category: 'Catatan Pribadi',
        content: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        location: '',
        label: 'Ide',
        status: 'Published',
        priority: 'Medium',
        visibility: 'Private',
        is_favorite: 'false',
        is_meeting_draft: 'false',
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const previousNotes = [...notes];
    
    // Optimistic item creation
    const tempId = editingNote ? editingNote.id : `NOTE-TEMP-${Date.now()}`;
    const optimisticItem = { ...formData, id: tempId };
    
    let updatedNotes;
    if (editingNote) {
      updatedNotes = notes.map(n => n.id === editingNote.id ? optimisticItem : n);
    } else {
      updatedNotes = [optimisticItem, ...notes];
    }
    
    setNotes(updatedNotes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_notes_cache', JSON.stringify(updatedNotes));
    }
    setShowModal(false);

    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, formData);
      } else {
        const res = await api.post('/notes', formData);
        const serverItem = res.data?.data || { ...formData, id: `NOTE-${Date.now()}` };
        const finalNotes = updatedNotes.map(n => n.id === tempId ? serverItem : n);
        setNotes(finalNotes);
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_notes_cache', JSON.stringify(finalNotes));
        }
      }
      fetchNotes();
    } catch (err) {
      alert('Gagal menyimpan perubahan ke server. Data dikembalikan.');
      setNotes(previousNotes);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_notes_cache', JSON.stringify(previousNotes));
      }
    }
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      show: true,
      title: 'Hapus Catatan',
      message: 'Apakah Anda yakin ingin menghapus catatan ini secara permanen?',
      onConfirm: () => executeDelete(id),
    });
  };

  const executeDelete = async (id: string) => {
    const previousNotes = [...notes];
    const updatedNotes = notes.filter(n => n.id !== id);
    
    setNotes(updatedNotes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_notes_cache', JSON.stringify(updatedNotes));
    }

    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch (err) {
      alert('Gagal menghapus catatan dari server. Data dikembalikan.');
      setNotes(previousNotes);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_notes_cache', JSON.stringify(previousNotes));
      }
    }
  };

  const toggleFavorite = async (note: any) => {
    const previousNotes = [...notes];
    const isFav = note.is_favorite === 'true' || note.is_favorite === true;
    const updatedItem = { ...note, is_favorite: isFav ? 'false' : 'true' };
    
    const updatedNotes = notes.map(n => n.id === note.id ? updatedItem : n);
    setNotes(updatedNotes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_notes_cache', JSON.stringify(updatedNotes));
    }

    try {
      await api.put(`/notes/${note.id}`, { is_favorite: updatedItem.is_favorite });
      fetchNotes();
    } catch (err) {
      setNotes(previousNotes);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_notes_cache', JSON.stringify(previousNotes));
      }
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Catatan Project':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/80 dark:border-purple-800/50';
      case 'Catatan Hafalan':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/50';
      case 'Catatan Meeting':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/50';
      case 'Catatan Keuangan':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/50';
      case 'Catatan Ide':
        return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200/80 dark:border-pink-800/50';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/50';
    }
  };

  // Filtered notes
  const filteredNotes = notes.filter((n) => {
    const matchCat = selectedCategory === 'Semua' || n.category === selectedCategory;
    const matchPrio = selectedPriority === 'Semua' || n.priority === selectedPriority;
    const matchSearch =
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchPrio && matchSearch;
  });

  // ===== INPUT STYLE =====
  const inputClass = "w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 text-slate-800 dark:text-slate-100 transition-all duration-200 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_15px_rgba(16,185,129,0.08)]";
  const labelClass = "block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2 pl-0.5";

  return (
    <AppLayout>
      {/* Header - Konsisten dengan Manajemen Rapat */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between pb-3.5 border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2.5 tracking-tight">
              <FileText className="w-5.5 h-5.5 text-accent shrink-0 stroke-2" />
              Manajemen Catatan
            </h1>
            <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
              Kelola ide, riset, dan dokumentasi penting Anda
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="md:hidden px-4 py-2 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-premium active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5px]" /> Catatan
          </button>
        </div>
        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
          <Link
            href="/monitoring"
            className="flex-1 md:flex-initial text-center px-4 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-accent" /> Dashboard
          </Link>
          <button
            onClick={() => handleOpenModal()}
            className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-xs items-center justify-center gap-1.5 shadow-premium hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5px]" /> Buat Catatan Baru
          </button>
        </div>
      </div>

      {/* Tabs / Filter Kategori - Konsisten dengan Manajemen Rapat */}
      <div className="flex p-1 bg-slate-100/80 dark:bg-slate-900/40 rounded-2xl w-fit border border-slate-200/30 dark:border-slate-850 overflow-x-auto no-scrollbar max-w-full">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = cat === 'Semua' ? notes.length : notes.filter(n => n.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                isSelected
                  ? 'bg-white dark:bg-slate-950 text-primary dark:text-accent shadow-sm border border-slate-250/20 dark:border-slate-800/40'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {cat === 'Semua' ? `Daftar Catatan (${count})` : `${cat} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls - Konsisten dengan Rapat */}
      <div className="premium-card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Cari Catatan</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau isi catatan..."
              className="w-full pl-10 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 text-slate-800 dark:text-slate-100 transition-all duration-200 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div>
          <label className={labelClass}>Prioritas</label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className={inputClass}
          >
            <option value="Semua">Semua Prioritas</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
            <option value="Critical">Critical Priority</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Kategori</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={inputClass}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'Semua' ? 'Semua Kategori' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid - Konsisten dengan Kartu Rapat */}
      {loading ? (
        <div className="space-y-3.5 md:space-y-4 pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200/60 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3 shadow-sm my-4">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto stroke-1" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Tidak ada catatan yang sesuai</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-xs text-accent font-bold hover:underline"
          >
            + Buat Catatan Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {filteredNotes.map((note) => {
            const badgeStyle = getCategoryColor(note.category);
            const isFav = note.is_favorite === 'true' || note.is_favorite === true;
            return (
              <div
                key={note.id}
                className="premium-card p-0 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
                
                {/* Header Catatan */}
                <div className="p-5 pl-6 pb-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight">{note.title || 'Tanpa Judul'}</h3>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider border ${badgeStyle}`}>
                          {note.category || 'General'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-medium">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-350"><Clock className="w-4 h-4 text-accent" /> {formatDisplayDate(note.date)}</span>
                        <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> Prioritas: {note.priority || 'Medium'}</span>
                        {note.location && <span className="flex items-center gap-1.5 text-slate-400"><MapPin className="w-4 h-4" /> {note.location}</span>}
                      </div>
                    </div>
 
                    <div className="flex items-center gap-1.5 pt-1 md:pt-0">
                      <button
                        onClick={() => toggleFavorite(note)}
                        className={`p-2 rounded-xl border transition-all active:scale-[0.97] ${
                          isFav
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 border-amber-200/50 dark:border-amber-900/30'
                            : 'border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:text-amber-500'
                        }`}
                        title="Favorit"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                      <Link
                        href={`/tasks?new=true&title=${encodeURIComponent(note.title || '')}&category=${encodeURIComponent(note.category || '')}`}
                        className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:text-accent transition-all active:scale-[0.97]"
                        title="Jadikan Tugas"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenModal(note)}
                        className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:text-blue-500 transition-all active:scale-[0.97]"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all active:scale-[0.97]"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
 
                {/* Konten Catatan */}
                <div className="border-t border-slate-100 dark:border-slate-850 p-5 pl-6 bg-slate-50/20 dark:bg-slate-900/10">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-250/20 dark:border-slate-800/40 text-xs md:text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                    <p className="whitespace-pre-wrap">{note.content || 'Tidak ada konten catatan.'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-white/95 dark:bg-slate-950/90 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 p-6 shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                <FileText className="w-5 h-5 text-accent stroke-[2.5px]" />
                {editingNote ? 'Edit Catatan' : 'Buat Catatan Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                <X className="w-5 h-5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200" />
              </button>
            </div>
 
            {/* Form */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Judul Catatan</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Contoh: Hasil Riset UI/UX Mobile First"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Kategori</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={inputClass}
                    >
                      {categories.filter(c => c !== 'Semua').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
 
                <div>
                  <label className={labelClass}>Isi Catatan</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Tuliskan ide atau kesimpulan catatan di sini..."
                    className="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs text-slate-800 dark:text-slate-100 outline-none leading-relaxed focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all duration-200 resize-none font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-650"
                  />
                </div>
 
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>Tanggal</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Jam</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Prioritas</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Visibility</label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Private">Private</option>
                      <option value="Shared">Shared</option>
                    </select>
                  </div>
                </div>
 
                <div>
                  <label className={labelClass}>Lokasi / Keterangan Tempat</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Ruang Rapat Lt 3 atau Google Meet"
                    className={inputClass}
                  />
                </div>

                {/* Checkbox Jadikan Draf Poin Rapat */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-slate-200 font-bold text-xs">
                    <input
                      type="checkbox"
                      checked={formData.is_meeting_draft === 'true'}
                      onChange={(e) => setFormData({ ...formData, is_meeting_draft: e.target.checked ? 'true' : 'false' })}
                      className="w-4 h-4 rounded text-accent focus:ring-accent border-slate-350 dark:border-slate-800 dark:bg-slate-950"
                    />
                    <span>Jadikan sebagai Draf Poin Rapat</span>
                  </label>
                  {formData.is_meeting_draft === 'true' && (
                    <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      💡 <strong>Bahasan Rapat</strong> akan otomatis mengambil <strong>Judul Catatan</strong> ini, dan <strong>Keputusan/Solusi</strong> akan mengambil seluruh isi <strong>Catatan</strong> ini saat diimpor di halaman Rapat.
                    </div>
                  )}
                </div>
              </div>
 
              {/* Footer - Fixed */}
              <div className="flex justify-end gap-2.5 p-6 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ===== CUSTOM CONFIRMATION MODAL ===== */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
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
