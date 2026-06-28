'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import api from '@/lib/api';
import {
  Database,
  Tag,
  Users,
  Plus,
  TrendingUp,
  Edit3,
  Trash2,
  X,
  Save,
  Palette,
  Mail,
  Phone,
  AlertCircle,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
}

const PRESET_COLORS = [
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Pondok Green', hex: '#14532D' },
];

export default function MasterDataPage() {
  const { user: currentUser, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !hasRole(['Admin'])) {
      router.push('/');
    }
  }, [currentUser, authLoading, router]);

  const [activeTab, setActiveTab] = useState<'categories' | 'users'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', color: '#10B981' });

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Staff', phone: '', password: '' });

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

  // Fetch data with cache revalidation
  const fetchData = async () => {
    const cachedCat = typeof window !== 'undefined' ? localStorage.getItem('smart_categories_cache') : null;
    const cachedUsr = typeof window !== 'undefined' ? localStorage.getItem('smart_users_cache') : null;
    
    if (activeTab === 'categories' && !cachedCat) setLoading(true);
    if (activeTab === 'users' && !cachedUsr) setLoading(true);

    try {
      if (activeTab === 'categories') {
        const res = await api.get('/categories');
        const items = res?.data?.data || [];
        setCategories(items);
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_categories_cache', JSON.stringify(items));
        }
      } else {
        const res = await api.get('/users');
        const items = res?.data?.data || [];
        setUsers(items);
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_users_cache', JSON.stringify(items));
        }
      }
    } catch (err) {
      // Fallback mocks if fetch fails and no cache exists
      if (activeTab === 'categories' && !cachedCat) {
        const fallback = [
          { id: 'CAT-1', name: 'Catatan Pribadi', color: '#10B981' },
          { id: 'CAT-2', name: 'Catatan Meeting', color: '#3B82F6' },
          { id: 'CAT-3', name: 'Catatan Agenda', color: '#F59E0B' },
          { id: 'CAT-4', name: 'Catatan Organisasi', color: '#8B5CF6' },
          { id: 'CAT-5', name: 'Catatan Pondok', color: '#14532D' },
          { id: 'CAT-6', name: 'Catatan Hafalan', color: '#EC4899' },
          { id: 'CAT-7', name: 'Catatan Project', color: '#06B6D4' },
        ];
        setCategories(fallback);
      } else if (activeTab === 'users' && !cachedUsr) {
        const fallback = [
          { id: 'USR-1', name: 'Administrator', email: 'admin@smart.id', role: 'Admin', phone: '081234567890' },
          { id: 'USR-2', name: 'Manager Rapat', email: 'manager@smart.id', role: 'Manager', phone: '081298765432' },
          { id: 'USR-3', name: 'Staff Lapangan', email: 'staff@smart.id', role: 'Staff', phone: '081311223344' },
        ];
        setUsers(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedCat = localStorage.getItem('smart_categories_cache');
      const cachedUsr = localStorage.getItem('smart_users_cache');
      if (cachedCat) setCategories(JSON.parse(cachedCat));
      if (cachedUsr) setUsers(JSON.parse(cachedUsr));
    }
    fetchData();
  }, [activeTab]);

  // CATEGORY OPERATIONS
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', color: '#10B981' });
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, color: cat.color });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const previous = [...categories];
    const tempId = editingCategory ? editingCategory.id : `CAT-TEMP-${Date.now()}`;
    const optimistic = { ...categoryForm, id: tempId };

    let updated;
    if (editingCategory) {
      updated = categories.map(c => c.id === editingCategory.id ? optimistic : c);
    } else {
      updated = [...categories, optimistic];
    }
    setCategories(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_categories_cache', JSON.stringify(updated));
    }
    setShowCategoryModal(false);

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryForm);
      } else {
        await api.post('/categories', categoryForm);
      }
      fetchData();
    } catch {
      alert('Gagal menyimpan kategori ke server. Kondisi dikembalikan.');
      setCategories(previous);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_categories_cache', JSON.stringify(previous));
      }
    }
  };

  const handleDeleteCategory = (id: string) => {
    setConfirmModal({
      show: true,
      title: 'Hapus Kategori',
      message: 'Apakah Anda yakin ingin menghapus kategori catatan ini secara permanen?',
      onConfirm: () => executeDeleteCategory(id),
    });
  };

  const executeDeleteCategory = async (id: string) => {
    const previous = [...categories];
    const updated = categories.filter(c => c.id !== id);

    setCategories(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_categories_cache', JSON.stringify(updated));
    }

    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch {
      alert('Gagal menghapus kategori dari server. Kondisi dikembalikan.');
      setCategories(previous);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_categories_cache', JSON.stringify(previous));
      }
    }
  };

  // USER OPERATIONS
  const openCreateUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', role: 'Staff', phone: '', password: '' });
    setShowUserModal(true);
  };

  const openEditUser = (usr: UserItem) => {
    setEditingUser(usr);
    setUserForm({ name: usr.name, email: usr.email, role: usr.role || 'Staff', phone: usr.phone || '', password: '' });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const previous = [...users];
    
    // Siapkan payload penulisan
    const payload = { ...userForm };
    if (editingUser && !payload.password) {
      delete payload.password; // Jangan timpa password lama jika dikosongkan saat edit
    }

    const tempId = editingUser ? editingUser.id : `USR-TEMP-${Date.now()}`;
    const optimistic = { ...payload, id: tempId };

    let updated;
    if (editingUser) {
      updated = users.map(u => u.id === editingUser.id ? optimistic : u);
    } else {
      updated = [...users, optimistic];
    }
    setUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_users_cache', JSON.stringify(updated));
    }
    setShowUserModal(false);

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      fetchData();
    } catch {
      alert('Gagal menyimpan user ke server. Kondisi dikembalikan.');
      setUsers(previous);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_users_cache', JSON.stringify(previous));
      }
    }
  };

  const handleDeleteUser = (id: string) => {
    setConfirmModal({
      show: true,
      title: 'Hapus Pengguna',
      message: 'Apakah Anda yakin ingin menghapus pengguna ini secara permanen?',
      onConfirm: () => executeDeleteUser(id),
    });
  };

  const executeDeleteUser = async (id: string) => {
    const previous = [...users];
    const updated = users.filter(u => u.id !== id);

    setUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_users_cache', JSON.stringify(updated));
    }

    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch {
      alert('Gagal menghapus user dari server. Kondisi dikembalikan.');
      setUsers(previous);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_users_cache', JSON.stringify(previous));
      }
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
              <Database className="w-5.5 h-5.5 text-accent shrink-0 stroke-2" />
              Master Data Sistem
            </h1>
            <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
              Kelola Kategori Catatan, Tim Pengurus Rapat, dan Struktur Role Hak Akses
            </p>
          </div>
          <button
            onClick={activeTab === 'categories' ? openCreateCategory : openCreateUser}
            className="md:hidden px-4 py-2 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-premium active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5px]" /> Baru
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
            onClick={activeTab === 'categories' ? openCreateCategory : openCreateUser}
            className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-xs items-center justify-center gap-1.5 shadow-premium hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5px]" /> {activeTab === 'categories' ? 'Kategori Baru' : 'Pengguna Baru'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-105 dark:bg-slate-900/40 rounded-2xl w-fit border border-slate-200/30 dark:border-slate-850 overflow-x-auto no-scrollbar max-w-full my-2.5">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-white dark:bg-slate-950 text-primary dark:text-accent shadow-sm border border-slate-250/20 dark:border-slate-800/35'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          📁 Kategori Catatan ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-950 text-primary dark:text-accent shadow-sm border border-slate-250/20 dark:border-slate-800/35'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          👥 Manajemen User & Role ({users.length})
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'categories' ? (
        <div className="premium-card p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">Daftar Kategori Catatan</h3>
            <button
              onClick={openCreateCategory}
              className="px-4 py-2 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-premium hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2px]"/> Tambah Kategori
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="premium-card p-4 relative overflow-hidden flex justify-between items-center shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: c.color }} />
                <div className="flex items-center gap-2.5 pl-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-extrabold text-xs md:text-sm text-slate-800 dark:text-white">{c.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditCategory(c)}
                    className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:text-blue-500 transition-all active:scale-[0.97]"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all active:scale-[0.97]"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="premium-card p-0 overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 p-6 pb-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">Daftar Pengguna Sistem</h3>
            <button
              onClick={openCreateUser}
              className="px-4 py-2 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-premium hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2px]"/> Tambah Pengguna
            </button>
          </div>
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs min-w-[600px] border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="p-4 pl-6 text-[10px] tracking-wider">Nama Pengguna</th>
                  <th className="p-4 text-[10px] tracking-wider">Email Address</th>
                  <th className="p-4 text-[10px] tracking-wider">Role Permission</th>
                  <th className="p-4 text-[10px] tracking-wider">Nomor HP</th>
                  <th className="p-4 pr-6 text-center text-[10px] tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="p-4 text-slate-650 dark:text-slate-350 font-medium"><Mail className="w-4 h-4 text-slate-400 inline mr-1" /> {u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                        u.role === 'Admin' 
                          ? 'bg-red-500/10 text-red-600 border-red-500/20' 
                          : u.role === 'Manager' 
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-350 font-medium"><Phone className="w-4 h-4 text-slate-400 inline mr-1" /> {u.phone || '-'}</td>
                    <td className="p-4 pr-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditUser(u)}
                          className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:text-blue-500 transition-all active:scale-[0.97]"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all active:scale-[0.97]"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY CRUD */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white/95 dark:bg-slate-950/90 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 p-6 shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                <Tag className="w-4 h-4 text-accent" />
                {editingCategory ? 'Edit Kategori Catatan' : 'Buat Kategori Baru'}
              </h2>
              <button onClick={() => setShowCategoryModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"><X className="w-4 h-4 text-slate-400 hover:text-slate-650" /></button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSaveCategory} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar pb-4">
                <div>
                  <label className={labelClass}>Nama Kategori *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Contoh: Catatan Kurikulum"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Warna Identitas Kategori</label>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-slate-450" />
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className="w-10 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-500 font-bold">{categoryForm.color}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setCategoryForm({ ...categoryForm, color: c.hex })}
                        className="w-5 h-5 rounded-full border border-white dark:border-slate-900 shadow-sm relative"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {categoryForm.color === c.hex && (
                          <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="flex justify-end gap-2.5 p-6 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 shrink-0">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold uppercase tracking-wider transition-all">Batal</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: USER CRUD */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white/95 dark:bg-slate-950/90 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 p-6 shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                <Users className="w-4 h-4 text-accent" />
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h2>
              <button onClick={() => setShowUserModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"><X className="w-4 h-4 text-slate-400 hover:text-slate-650" /></button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSaveUser} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar pb-4">
                <div>
                  <label className={labelClass}>Nama Pengguna *</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Contoh: Muhammad Zubair"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="Contoh: zubair@smart.id"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Role Permission / Hak Akses</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Admin">🛡️ Admin (Akses Penuh)</option>
                    <option value="Manager">💼 Manager (Kelola Data)</option>
                    <option value="Staff">📝 Staff (Mengisi/Membaca)</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Nomor HP / WhatsApp</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="Contoh: 0812XXXXXXXX"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    {editingUser ? 'Password Baru (Kosongkan jika tetap)' : 'Password Akun *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder={editingUser ? '••••••••' : 'Sandi masuk unik'}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="flex justify-end gap-2.5 p-6 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 shrink-0">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold uppercase tracking-wider transition-all">Batal</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ===== CUSTOM CONFIRMATION MODAL ===== */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white/95 dark:bg-slate-950/90 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] p-6 text-center space-y-4 animate-scaleIn">
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
