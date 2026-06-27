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
      setFormData({ ...note });
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

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return;
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

  return (
    <AppLayout>
      {/* Header - Konsisten dengan Manajemen Rapat */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
              <FileText className="w-6 h-6 text-accent shrink-0" />
              Manajemen Catatan
            </h1>
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola ide, riset, dan dokumentasi penting Anda
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="md:hidden px-3.5 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" /> Catatan
          </button>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <Link
            href="/monitoring"
            className="flex-1 md:flex-initial text-center px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-accent" /> Dashboard
          </Link>
          <button
            onClick={() => handleOpenModal()}
            className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Buat Catatan Baru
          </button>
        </div>
      </div>

      {/* Tabs / Filter Kategori - Konsisten dengan Manajemen Rapat */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = cat === 'Semua' ? notes.length : notes.filter(n => n.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'Semua' ? `Daftar Catatan (${count})` : `${cat} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls - Konsisten dengan Rapat */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cari Catatan</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau isi catatan..."
              className="w-full pl-10 pr-8 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs outline-none focus:ring-1 focus:ring-accent transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prioritas</label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs outline-none cursor-pointer"
          >
            <option value="Semua">Semua Prioritas</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
            <option value="Critical">Critical Priority</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs outline-none cursor-pointer"
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
        <div className="space-y-3.5 md:space-y-4 pb-2">
          {filteredNotes.map((note) => {
            const badgeStyle = getCategoryColor(note.category);
            return (
              <div
                key={note.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent" />
                
                {/* Header Catatan */}
                <div className="p-4 md:p-5 pl-5 md:pl-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-snug">{note.title || 'Tanpa Judul'}</h3>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-extrabold uppercase tracking-wide border ${badgeStyle}`}>
                          {note.category || 'General'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300"><Clock className="w-3.5 h-3.5 text-accent" /> {formatDisplayDate(note.date)}</span>
                        <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Prioritas: {note.priority || 'Medium'}</span>
                        {note.location && <span className="flex items-center gap-1 text-slate-400"><MapPin className="w-3.5 h-3.5" /> {note.location}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 pt-1 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => toggleFavorite(note)}
                        className={`p-2 rounded-xl transition-colors ${
                          note.is_favorite === 'true' || note.is_favorite === true
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-400'
                        }`}
                        title="Favorit"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(note)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Konten Catatan */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 p-4 md:p-5 pl-5 md:pl-6 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/50 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                {editingNote ? 'Edit Catatan' : 'Buat Catatan Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Judul Catatan</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Hasil Riset UI/UX Mobile First"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-accent outline-none"
                  >
                    {categories.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Isi Catatan</label>
                <textarea
                  required
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tuliskan ide atau kesimpulan catatan di sini..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-accent outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Jam</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Prioritas</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Visibility</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                  >
                    <option value="Private">Private</option>
                    <option value="Shared">Shared</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Lokasi / Keterangan Tempat</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Ruang Rapat Lt 3 atau Google Meet"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold shadow-lg hover:opacity-95"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
