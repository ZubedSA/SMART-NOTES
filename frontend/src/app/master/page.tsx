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

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
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

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
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

  const inputClass = "w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-1 focus:ring-accent outline-none";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1";

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
            <Database className="w-6 h-6 text-accent shrink-0" />
            Master Data Sistem
          </h1>
          <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola Kategori Catatan, Tim Pengurus Rapat, dan Struktur Role Hak Akses
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <Link
            href="/monitoring"
            className="flex text-center px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-accent" /> Dashboard
          </Link>
          <button
            onClick={activeTab === 'categories' ? openCreateCategory : openCreateUser}
            className="flex px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl text-xs items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" /> {activeTab === 'categories' ? 'Kategori Baru' : 'Pengguna Baru'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'categories'
              ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          📁 Kategori Catatan ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          👥 Manajemen User & Role ({users.length})
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'categories' ? (
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white">Daftar Kategori Catatan</h3>
            <button
              onClick={openCreateCategory}
              className="px-3.5 py-1.5 bg-gradient-to-r from-primary to-accent text-white text-xs rounded-xl font-semibold flex items-center gap-1 shadow-sm hover:opacity-95"
            >
              <Plus className="w-4 h-4"/> Tambah Kategori
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1.5" style={{ backgroundColor: c.color }} />
                <div className="flex items-center gap-2 pl-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-bold text-xs md:text-sm text-slate-800 dark:text-white">{c.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditCategory(c)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden p-4 md:p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white">Daftar Pengguna Sistem</h3>
            <button
              onClick={openCreateUser}
              className="px-3.5 py-1.5 bg-gradient-to-r from-primary to-accent text-white text-xs rounded-xl font-semibold flex items-center gap-1 shadow-sm hover:opacity-95"
            >
              <Plus className="w-4 h-4"/> Tambah Pengguna
            </button>
          </div>
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 rounded-l-2xl">Nama Pengguna</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Role Permission</th>
                  <th className="p-4">Nomor HP</th>
                  <th className="p-4 text-center rounded-r-2xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800 dark:text-white">{u.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${
                        u.role === 'Admin' 
                          ? 'bg-red-500/10 text-red-600 border-red-200/50' 
                          : u.role === 'Manager' 
                          ? 'bg-amber-500/10 text-amber-600 border-amber-200/50' 
                          : 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {u.phone || '-'}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditUser(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-accent" />
                {editingCategory ? 'Edit Kategori Catatan' : 'Buat Kategori Baru'}
              </h2>
              <button onClick={() => setShowCategoryModal(false)}><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
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
                  <Palette className="w-4 h-4 text-slate-400" />
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-10 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-500">{categoryForm.color}</span>
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

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 rounded-xl border text-xs hover:bg-slate-100 dark:hover:bg-slate-800">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-xs shadow-md hover:opacity-95 flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: USER CRUD */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-accent" />
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h2>
              <button onClick={() => setShowUserModal(false)}><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-4">
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

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 rounded-xl border text-xs hover:bg-slate-100 dark:hover:bg-slate-800">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-xs shadow-md hover:opacity-95 flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
