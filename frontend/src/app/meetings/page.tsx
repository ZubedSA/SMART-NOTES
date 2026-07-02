'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  UserCheck,
  FileText,
  TrendingUp,
  X,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Play,
  CheckSquare,
  Target,
  Save,
  BarChart3,
  MessageSquare,
  FileDown,
  Settings,
  Search,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

// ===== Types =====
interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  moderator: string;
  notulen: string;
  agenda: string;
  discussion: string;
  decision: string;
  status: string;
  [key: string]: any;
}

interface ActionItem {
  id: string;
  meeting_id: string;
  title: string;
  description: string;
  pic: string;
  deadline: string;
  priority: string;
  status: string;
  progress: string | number;
  [key: string]: any;
}

const INITIAL_MEETING_FORM = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  location: '',
  moderator: '',
  notulen: '',
  agenda: '',
  discussion: '',
  decision: '',
  status: 'Draft',
};

const INITIAL_TASK_FORM = {
  meeting_id: '',
  title: '',
  description: '',
  pic: '',
  deadline: new Date().toISOString().split('T')[0],
  priority: 'Medium',
  status: 'Belum',
  progress: '0',
};

const STATUS_OPTIONS = ['Draft', 'Terjadwal', 'Berlangsung', 'Selesai'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const TASK_STATUS_OPTIONS = ['Belum', 'Proses', 'Selesai'];

export default function MeetingsPage() {
  const { user, loading: authLoading } = useAuth();
  const isWritable = user && (user.roleName === 'Admin' || user.roleName === 'Manager');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'meetings' | 'actions'>('meetings');
  const [draftNotes, setDraftNotes] = useState<any[]>([]);
  const [showDraftSelectorModal, setShowDraftSelectorModal] = useState(false);
  const [draftSelectorTarget, setDraftSelectorTarget] = useState<'meeting' | 'notulen'>('meeting');

  // Meeting Modal
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [meetingForm, setMeetingForm] = useState(INITIAL_MEETING_FORM);
  const [meetingPoints, setMeetingPoints] = useState<Array<{ discussion: string; decision: string }>>([
    { discussion: '', decision: '' }
  ]);
  const [mobileActionMeeting, setMobileActionMeeting] = useState<Meeting | null>(null);

  // Notulen Modal (Synchronized Point-by-point)
  const [showNotulenModal, setShowNotulenModal] = useState(false);
  const [notulenMeetingId, setNotulenMeetingId] = useState<string | null>(null);
  const [notulenForm, setNotulenForm] = useState<{
    points: Array<{ discussion: string; decision: string }>;
  }>({
    points: [{ discussion: '', decision: '' }]
  });

  // Action Item Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState(INITIAL_TASK_FORM);

  // Expanded card
  const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);

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

  // Saving state
  const [saving, setSaving] = useState(false);

  // Action Item Search & Filters
  const [taskSearch, setTaskSearch] = useState('');
  const [meetingSearch, setMeetingSearch] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('Semua');
  const [taskStatusFilter, setTaskStatusFilter] = useState('Semua');
  const [taskPicFilter, setTaskPicFilter] = useState('Semua');

  // ===== FETCH DATA WITH CACHE =====
  const fetchData = async () => {
    const cachedMtg = typeof window !== 'undefined' ? localStorage.getItem('smart_meetings_cache') : null;
    const cachedTsk = typeof window !== 'undefined' ? localStorage.getItem('smart_action_items_cache') : null;
    if (!cachedMtg || !cachedTsk) setLoading(true);

    try {
      const [mtgRes, tskRes, notesRes] = await Promise.all([
        api.get('/meeting'),
        api.get('/meeting-task'),
        api.get('/notes?meetingDrafts=true').catch(() => null),
      ]);
      const fetchedMeetings = mtgRes?.data?.data?.items || [];
      const fetchedTasks = tskRes?.data?.data?.items || [];
      
      let fetchedNotes = [];
      if (notesRes) {
        fetchedNotes = notesRes.data?.data?.items || [];
      } else {
        const cachedNotes = typeof window !== 'undefined' ? localStorage.getItem('smart_notes_cache') : null;
        if (cachedNotes) fetchedNotes = JSON.parse(cachedNotes);
      }

      console.log('fetchedNotes:', fetchedNotes);
      const filteredDrafts = fetchedNotes.filter((n: any) => {
        return n.is_meeting_draft === true || String(n.is_meeting_draft || '').toLowerCase().trim() === 'true';
      });
      console.log('filteredDrafts:', filteredDrafts);

      setMeetings(fetchedMeetings);
      setActionItems(fetchedTasks);
      setDraftNotes(filteredDrafts);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_meetings_cache', JSON.stringify(fetchedMeetings));
        localStorage.setItem('smart_action_items_cache', JSON.stringify(fetchedTasks));
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      if (!cachedMtg || !cachedTsk) {
        const fallbackMeetings = [
          { id: 'MTG-1', title: 'Rapat Sinkronisasi Project Smart Notes', date: '2026-06-28', time: '09:00', location: 'Ruang Rapat Utama & Zoom', moderator: 'Manager Rapat', notulen: 'Staff Lapangan', status: 'Berlangsung', agenda: 'Review progress minggu ini', discussion: 'Evaluasi desain mobile first', decision: 'Lanjutkan ke tahap pengerjaan fitur AI' },
          { id: 'MTG-2', title: 'Evaluasi Mingguan Tim IT & Pondok', date: '2026-06-25', time: '14:00', location: 'Lantai 2', moderator: 'Ustadz Ahmad', notulen: 'Staff Lapangan', status: 'Selesai', agenda: 'Evaluasi inventaris', discussion: 'Pembahasan inventaris baru', decision: 'Disetujui pembelian alat tulis' },
        ];
        const fallbackTasks = [
          { id: 'MTASK-1', meeting_id: 'MTG-1', title: 'Siapkan Arsitektur Database GAS', description: 'Buat 15 sheet di Google Spreadsheet', pic: 'Staff Lapangan', deadline: '2026-06-30', priority: 'High', status: 'Proses', progress: '60' },
          { id: 'MTASK-2', meeting_id: 'MTG-1', title: 'Review Desain UI Mobile First', description: 'Pastikan bottom navigation nyaman', pic: 'Manager Rapat', deadline: '2026-07-02', priority: 'Medium', status: 'Belum', progress: '0' },
          { id: 'MTASK-3', meeting_id: 'MTG-2', title: 'Belanja Pembelian Meja Belajar', description: 'Pesan ke suplier furniture', pic: 'Tim Logistik', deadline: '2026-06-27', priority: 'Critical', status: 'Selesai', progress: '100' },
        ];
        setMeetings(fallbackMeetings);
        setActionItems(fallbackTasks);
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_meetings_cache', JSON.stringify(fallbackMeetings));
          localStorage.setItem('smart_action_items_cache', JSON.stringify(fallbackTasks));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;

    if (typeof window !== 'undefined') {
      const cachedMtg = localStorage.getItem('smart_meetings_cache');
      const cachedTsk = localStorage.getItem('smart_action_items_cache');
      if (cachedMtg && cachedTsk) {
        try {
          setMeetings(JSON.parse(cachedMtg));
          setActionItems(JSON.parse(cachedTsk));
          setLoading(false);
        } catch (e) {}
      }

      // Auto open modal jika parameter url ?new=true
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('new') === 'true') {
        openCreateMeeting();
        // Bersihkan parameter dari URL agar tidak berulang saat di-refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    fetchData();
  }, [user, authLoading]);

  // ===== MEETING CRUD =====
  const openCreateMeeting = () => {
    setEditingMeetingId(null);
    setMeetingForm(INITIAL_MEETING_FORM);
    setMeetingPoints([{ discussion: '', decision: '' }]);
    setShowMeetingModal(true);
  };

  const openEditMeeting = (mtg: Meeting) => {
    setEditingMeetingId(mtg.id);
    setMeetingForm({
      title: mtg.title || '',
      date: mtg.date || '',
      time: mtg.time || '',
      location: mtg.location || '',
      moderator: mtg.moderator || '',
      notulen: mtg.notulen || '',
      agenda: mtg.agenda || '',
      discussion: mtg.discussion || '',
      decision: mtg.decision || '',
      status: mtg.status || 'Draft',
    });
    const parsedPoints = parseNotulenPoints(mtg.discussion || '', mtg.decision || '');
    setMeetingPoints(parsedPoints);
    setShowMeetingModal(true);
  };

  const addMeetingPoint = () => {
    setMeetingPoints([...meetingPoints, { discussion: '', decision: '' }]);
  };

  const removeMeetingPoint = (index: number) => {
    const newPoints = [...meetingPoints];
    newPoints.splice(index, 1);
    setMeetingPoints(newPoints);
  };

  const updateMeetingPoint = (index: number, field: 'discussion' | 'decision', value: string) => {
    const newPoints = [...meetingPoints];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setMeetingPoints(newPoints);
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const previousMeetings = [...meetings];
    const tempId = editingMeetingId ? editingMeetingId : `MTG-TEMP-${Date.now()}`;
    const serialized = serializeNotulenPoints(meetingPoints);
    const formWithSerialized = {
      ...meetingForm,
      discussion: serialized.discussion,
      decision: serialized.decision,
    };
    const optimisticItem = { ...formWithSerialized, id: tempId };

    let updatedMeetings;
    if (editingMeetingId) {
      updatedMeetings = meetings.map(m => m.id === editingMeetingId ? optimisticItem : m);
    } else {
      updatedMeetings = [optimisticItem, ...meetings];
    }

    setMeetings(updatedMeetings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_meetings_cache', JSON.stringify(updatedMeetings));
    }
    setShowMeetingModal(false);

    try {
      if (editingMeetingId) {
        await api.put(`/meeting/${editingMeetingId}`, formWithSerialized);
      } else {
        const res = await api.post('/meeting', formWithSerialized);
        const serverItem = res.data?.data || { ...formWithSerialized, id: `MTG-${Date.now()}` };
        const finalMeetings = updatedMeetings.map(m => m.id === tempId ? serverItem : m);
        setMeetings(finalMeetings);
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_meetings_cache', JSON.stringify(finalMeetings));
        }
      }
      fetchData();
    } catch (error: any) {
      console.error('Gagal menyimpan rapat:', error);
      const detail = error.response?.data?.message || error.message || '';
      alert(`Gagal menyimpan rapat ke server. Data dikembalikan.\nDetail: ${detail}`);
      setMeetings(previousMeetings);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_meetings_cache', JSON.stringify(previousMeetings));
      }
    }
  };

  const handleDeleteMeeting = (id: string) => {
    setConfirmModal({
      show: true,
      title: 'Hapus Rapat',
      message: 'Apakah Anda yakin ingin menghapus rapat ini beserta seluruh action items-nya secara permanen?',
      onConfirm: () => executeDeleteMeeting(id),
    });
  };

  const executeDeleteMeeting = async (id: string) => {
    const previousMeetings = [...meetings];
    const previousTasks = [...actionItems];

    const updatedMeetings = meetings.filter(m => m.id !== id);
    const updatedTasks = actionItems.filter(a => a.meeting_id !== id);

    setMeetings(updatedMeetings);
    setActionItems(updatedTasks);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_meetings_cache', JSON.stringify(updatedMeetings));
      localStorage.setItem('smart_action_items_cache', JSON.stringify(updatedTasks));
    }

    try {
      await api.delete(`/meeting/${id}`);
      fetchData();
    } catch (error: any) {
      console.error('Gagal menghapus rapat:', error);
      const detail = error.response?.data?.message || error.message || '';
      alert(`Gagal menghapus rapat dari server. Data dikembalikan.\nDetail: ${detail}`);
      setMeetings(previousMeetings);
      setActionItems(previousTasks);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_meetings_cache', JSON.stringify(previousMeetings));
        localStorage.setItem('smart_action_items_cache', JSON.stringify(previousTasks));
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const previousMeetings = [...meetings];
    const updatedMeetings = meetings.map(m => m.id === id ? { ...m, status: newStatus } : m);
    
    setMeetings(updatedMeetings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_meetings_cache', JSON.stringify(updatedMeetings));
    }

    try {
      await api.put(`/meeting/${id}`, { status: newStatus });
      fetchData();
    } catch (error: any) {
      console.error('Gagal memperbarui status rapat:', error);
      setMeetings(previousMeetings);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_meetings_cache', JSON.stringify(previousMeetings));
      }
    }
  };

  // ===== NOTULEN =====
  const parseNotulenPoints = (discussionStr: string, decisionStr: string) => {
    if (!discussionStr && !decisionStr) {
      return [{ discussion: '', decision: '' }];
    }

    const cleanLine = (str: string) => {
      return str.replace(/^\s*(\d+\.|-|\*|•)\s*/, '').trim();
    };

    // Bisa split dengan newline maupun dengan spasi + angka + titik (untuk legacy data / single line)
    const splitRegex = /\r?\n|\s+(?=\d+\.)/;
    const disLines = discussionStr ? discussionStr.split(splitRegex).filter(line => line.trim() !== '') : [];
    const decLines = decisionStr ? decisionStr.split(splitRegex).filter(line => line.trim() !== '') : [];

    const maxLength = Math.max(disLines.length, decLines.length);
    const points = [];

    for (let i = 0; i < maxLength; i++) {
      points.push({
        discussion: disLines[i] ? cleanLine(disLines[i]) : '',
        decision: decLines[i] ? cleanLine(decLines[i]) : '',
      });
    }

    return points.length > 0 ? points : [{ discussion: '', decision: '' }];
  };

  const serializeNotulenPoints = (points: Array<{ discussion: string; decision: string }>) => {
    const activePoints = points.filter(p => p.discussion.trim() !== '' || p.decision.trim() !== '');
    
    if (activePoints.length === 0) {
      return { discussion: '', decision: '' };
    }

    const discussion = activePoints.map((p, i) => `${i + 1}. ${p.discussion.trim()}`).join('\n');
    const decision = activePoints.map((p, i) => `${i + 1}. ${p.decision.trim()}`).join('\n');

    return { discussion, decision };
  };

  const openNotulen = (mtg: Meeting) => {
    setNotulenMeetingId(mtg.id);
    const parsedPoints = parseNotulenPoints(mtg.discussion || '', mtg.decision || '');
    setNotulenForm({ points: parsedPoints });
    setShowNotulenModal(true);
  };

  const handleSaveNotulen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notulenMeetingId) return;
    const previousMeetings = [...meetings];
    const serialized = serializeNotulenPoints(notulenForm.points);
    
    const updatedMeetings = meetings.map(m => m.id === notulenMeetingId ? { ...m, ...serialized, status: 'Berlangsung' } : m);
    setMeetings(updatedMeetings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_meetings_cache', JSON.stringify(updatedMeetings));
    }
    setShowNotulenModal(false);

    try {
      await api.put(`/meeting/${notulenMeetingId}`, { ...serialized, status: 'Berlangsung' });
      fetchData();
    } catch (error: any) {
      console.error('Gagal menyimpan notulen:', error);
      const detail = error.response?.data?.message || error.message || '';
      alert(`Gagal menyimpan notulen ke server. Data dikembalikan.\nDetail: ${detail}`);
      setMeetings(previousMeetings);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_meetings_cache', JSON.stringify(previousMeetings));
      }
    }
  };

  const addPoint = () => {
    setNotulenForm({
      points: [...notulenForm.points, { discussion: '', decision: '' }]
    });
  };

  const removePoint = (index: number) => {
    const newPoints = [...notulenForm.points];
    newPoints.splice(index, 1);
    setNotulenForm({ points: newPoints });
  };

  const updatePoint = (index: number, field: 'discussion' | 'decision', value: string) => {
    const newPoints = [...notulenForm.points];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setNotulenForm({ points: newPoints });
  };

  const shareToWhatsApp = (mtg: Meeting) => {
    const points = parseNotulenPoints(mtg.discussion || '', mtg.decision || '');
    
    let text = `*📄 NOTULEN RAPAT RESMI: ${mtg.title.toUpperCase()}*\n`;
    text += `📅 *Tanggal:* ${formatDate(mtg.date)}\n`;
    text += `⏰ *Waktu:* ${mtg.time || '-'} WIB\n`;
    text += `📍 *Lokasi:* ${mtg.location || '-'}\n`;
    text += `👤 *Moderator:* ${mtg.moderator || '-'}\n`;
    text += `📝 *Notulis:* ${mtg.notulen || '-'}\n\n`;
    
    text += `📌 *Agenda:* ${mtg.agenda || '-'}\n\n`;
    
    if (points.length > 0) {
      text += `📝 *Poin Pembahasan & Keputusan:*\n`;
      points.forEach((pt, idx) => {
        text += `${idx + 1}. *Pembahasan:* ${pt.discussion || '-'}\n`;
        text += `   *Keputusan:* ${pt.decision || '-'}\n\n`;
      });
    } else {
      text += `_(Belum ada pembahasan & keputusan notulen yang diisi)_\n`;
    }
    
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const exportToPDF = (mtg: Meeting, mtgTasks: ActionItem[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Silakan periksa pengaturan pop-up browser Anda.');
      return;
    }

    const formattedDate = formatDate(mtg.date);
    const points = parseNotulenPoints(mtg.discussion || '', mtg.decision || '');

    const htmlContent = `
      <html>
        <head>
          <title>Notulen Rapat - ${mtg.title}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              margin-bottom: 25px;
              border-bottom: 3px double #14532D;
              padding-bottom: 15px;
            }
            .system-title {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #64748b;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .doc-title {
              font-size: 20px;
              font-weight: bold;
              color: #14532D;
              margin: 5px 0;
            }
            .meta-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .meta-table td {
              padding: 6px 12px;
              font-size: 12px;
              border: 1px solid #e2e8f0;
            }
            .meta-label {
              font-weight: bold;
              background-color: #f8fafc;
              width: 20%;
              color: #475569;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              color: #14532D;
              border-bottom: 1.5px solid #14532D;
              padding-bottom: 5px;
              margin-top: 25px;
              margin-bottom: 12px;
              text-transform: uppercase;
            }
            .content-text {
              font-size: 12px;
              white-space: pre-wrap;
              color: #334155;
              margin-bottom: 15px;
            }
            .points-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            .points-table th, .points-table td {
              border: 1px solid #cbd5e1;
              padding: 10px;
              font-size: 11px;
              vertical-align: top;
            }
            .points-table th {
              background-color: #f1f5f9;
              font-weight: bold;
              text-align: left;
              color: #334155;
            }
            .tasks-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .tasks-table th, .tasks-table td {
              border: 1px solid #cbd5e1;
              padding: 8px 10px;
              font-size: 11px;
              text-align: left;
            }
            .tasks-table th {
              background-color: #f1f5f9;
              font-weight: bold;
              color: #334155;
            }
            .badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .badge-success { background-color: #d1fae5; color: #065f46; }
            .badge-warning { background-color: #fef3c7; color: #92400e; }
            .badge-info { background-color: #dbeafe; color: #1e40af; }
            .badge-danger { background-color: #fee2e2; color: #991b1b; }
            .signature-container {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .signature-box {
              width: 40%;
              text-align: center;
              font-size: 12px;
            }
            .signature-line {
              margin-top: 60px;
              border-top: 1px solid #475569;
              font-weight: bold;
              padding-top: 5px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="system-title">Smart Notes Management System</div>
            <div class="doc-title">NOTULEN RAPAT (MINUTES OF MEETING)</div>
          </div>

          <table class="meta-table">
            <tr>
              <td class="meta-label">Nama Rapat</td>
              <td style="font-weight: bold; font-size: 13px; color: #14532D;">${mtg.title}</td>
              <td class="meta-label">Tanggal & Waktu</td>
              <td>${formattedDate} &bull; ${mtg.time} WIB</td>
            </tr>
            <tr>
              <td class="meta-label">Lokasi</td>
              <td>${mtg.location || '-'}</td>
              <td class="meta-label">Status Rapat</td>
              <td><span class="badge badge-info">${mtg.status || 'Draft'}</span></td>
            </tr>
            <tr>
              <td class="meta-label">Moderator / Pimpinan</td>
              <td>🎙️ ${mtg.moderator || '-'}</td>
              <td class="meta-label">Notulis / Pencatat</td>
              <td>📝 ${mtg.notulen || '-'}</td>
            </tr>
          </table>

          <div class="section-title">📋 Agenda Rapat</div>
          <div class="content-text">${mtg.agenda || 'Tidak ada agenda tertulis.'}</div>

          <div class="section-title">📝 Pembahasan & Keputusan Hasil Rapat</div>
          <table class="points-table">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">No</th>
                <th style="width: 47.5%;">Bahasan Rapat / Masalah</th>
                <th style="width: 47.5%;">Keputusan / Tindakan Solusi</th>
              </tr>
            </thead>
            <tbody>
              ${points.map((p, i) => `
                <tr>
                  <td style="text-align: center;">${i + 1}</td>
                  <td>${p.discussion || '-'}</td>
                  <td style="font-weight: 500;">${p.decision || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">🎯 Tindak Lanjut Rapat (Action Items)</div>
          <table class="tasks-table">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">No</th>
                <th style="width: 35%;">Tugas / Action Item</th>
                <th style="width: 20%;">Penanggung Jawab (PIC)</th>
                <th style="width: 15%;">Tenggat (Deadline)</th>
                <th style="width: 10%;">Prioritas</th>
                <th style="width: 15%;">Status (Progress)</th>
              </tr>
            </thead>
            <tbody>
              ${mtgTasks.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; color: #94a3b8; padding: 15px;">Belum ada action item untuk rapat ini.</td>
                </tr>
              ` : mtgTasks.map((t, i) => `
                <tr>
                  <td style="text-align: center;">${i + 1}</td>
                  <td>
                    <strong>${t.title}</strong>
                    ${t.description ? `<br/><span style="font-size: 9px; color: #64748b;">${t.description}</span>` : ''}
                  </td>
                  <td>${t.pic}</td>
                  <td>${formatDate(t.deadline)}</td>
                  <td>
                    <span class="badge ${
                      t.priority === 'Critical' ? 'badge-danger' : 
                      t.priority === 'High' ? 'badge-warning' : 
                      t.priority === 'Medium' ? 'badge-info' : 'badge-success'
                    }">${t.priority}</span>
                  </td>
                  <td>
                    <strong>${t.status}</strong> (${t.progress}%)
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="signature-container">
            <div class="signature-box">
              <div>Pimpinan Rapat / Moderator</div>
              <div class="signature-line">${mtg.moderator || '........................'}</div>
            </div>
            <div class="signature-box">
              <div>Notulis / Pencatat</div>
              <div class="signature-line">${mtg.notulen || '........................'}</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // ===== ACTION ITEMS CRUD =====
  const openCreateTask = (meetingId: string) => {
    setEditingTaskId(null);
    setTaskForm({ ...INITIAL_TASK_FORM, meeting_id: meetingId });
    setShowTaskModal(true);
  };

  const openEditTask = (task: ActionItem) => {
    setEditingTaskId(task.id);
    setTaskForm({
      meeting_id: task.meeting_id || '',
      title: task.title || '',
      description: task.description || '',
      pic: task.pic || '',
      deadline: task.deadline || '',
      priority: task.priority || 'Medium',
      status: task.status || 'Belum',
      progress: String(task.progress || 0),
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const previousTasks = [...actionItems];
    const tempId = editingTaskId ? editingTaskId : `MTASK-TEMP-${Date.now()}`;
    const optimisticItem = { ...taskForm, id: tempId };

    let updatedTasks;
    if (editingTaskId) {
      updatedTasks = actionItems.map(a => a.id === editingTaskId ? optimisticItem : a);
    } else {
      updatedTasks = [optimisticItem, ...actionItems];
    }

    setActionItems(updatedTasks as ActionItem[]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_action_items_cache', JSON.stringify(updatedTasks));
    }
    setShowTaskModal(false);

    try {
      if (editingTaskId) {
        await api.put(`/meeting-task/${editingTaskId}`, taskForm);
      } else {
        const res = await api.post('/meeting-task', taskForm);
        const serverItem = res.data?.data || { ...taskForm, id: `MTASK-${Date.now()}` };
        const finalTasks = updatedTasks.map(a => a.id === tempId ? serverItem : a);
        setActionItems(finalTasks as ActionItem[]);
        if (typeof window !== 'undefined') {
          localStorage.setItem('smart_action_items_cache', JSON.stringify(finalTasks));
        }
      }
      fetchData();
    } catch (error: any) {
      console.error('Gagal menyimpan action item:', error);
      const detail = error.response?.data?.message || error.message || '';
      alert(`Gagal menyimpan action item ke server. Data dikembalikan.\nDetail: ${detail}`);
      setActionItems(previousTasks);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_action_items_cache', JSON.stringify(previousTasks));
      }
    }
  };

  const handleQuickUpdateTask = async (taskId: string, updates: Partial<ActionItem>) => {
    const previousTasks = [...actionItems];
    const updatedTasks = actionItems.map(a => a.id === taskId ? { ...a, ...updates } : a);
    
    setActionItems(updatedTasks as ActionItem[]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_action_items_cache', JSON.stringify(updatedTasks));
    }

    try {
      await api.put(`/meeting-task/${taskId}`, updates);
      fetchData();
    } catch (error: any) {
      console.error('Gagal memperbarui action item cepat:', error);
      setActionItems(previousTasks);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_action_items_cache', JSON.stringify(previousTasks));
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setConfirmModal({
      show: true,
      title: 'Hapus Action Item',
      message: 'Apakah Anda yakin ingin menghapus action item ini secara permanen?',
      onConfirm: () => executeDeleteTask(taskId),
    });
  };

  const executeDeleteTask = async (taskId: string) => {
    const previousTasks = [...actionItems];
    const updatedTasks = actionItems.filter(a => a.id !== taskId);

    setActionItems(updatedTasks);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_action_items_cache', JSON.stringify(updatedTasks));
    }

    try {
      await api.delete(`/meeting-task/${taskId}`);
      fetchData();
    } catch {
      alert('Gagal menghapus action item dari server. Data dikembalikan.');
      setActionItems(previousTasks);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_action_items_cache', JSON.stringify(previousTasks));
      }
    }
  };

  // ===== HELPERS =====
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Terjadwal': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Berlangsung': return 'bg-emerald-50 text-emerald-600 border-emerald-200 animate-pulse';
      case 'Selesai': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'Low': return 'bg-slate-100 text-slate-600';
      case 'Medium': return 'bg-blue-50 text-blue-600';
      case 'High': return 'bg-amber-50 text-amber-600';
      case 'Critical': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getNextStatus = (current: string) => {
    const flow: Record<string, string> = { 'Draft': 'Terjadwal', 'Terjadwal': 'Berlangsung', 'Berlangsung': 'Selesai' };
    return flow[current] || null;
  };

  const getNextStatusLabel = (current: string) => {
    const labels: Record<string, string> = { 'Draft': '📋 Jadwalkan', 'Terjadwal': '▶️ Mulai Rapat', 'Berlangsung': '✅ Selesaikan' };
    return labels[current] || null;
  };

  const meetingTasks = (meetingId: string) => actionItems.filter(a => a.meeting_id === meetingId);

  const filteredMeetings = meetings.filter(m => {
    const query = meetingSearch.toLowerCase();
    const matchTitle = (m.title || '').toLowerCase().includes(query);
    const matchAgenda = (m.agenda || '').toLowerCase().includes(query);
    const matchDiscussion = (m.discussion || '').toLowerCase().includes(query);
    const matchDecision = (m.decision || '').toLowerCase().includes(query);
    const matchModerator = (m.moderator || '').toLowerCase().includes(query);
    const matchNotulen = (m.notulen || '').toLowerCase().includes(query);
    return matchTitle || matchAgenda || matchDiscussion || matchDecision || matchModerator || matchNotulen;
  });

  // ===== INPUT STYLE =====
  const inputClass = "w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 text-slate-800 dark:text-slate-100 transition-all duration-200 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_15px_rgba(16,185,129,0.08)]";
  const labelClass = "block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2 pl-0.5";

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between pb-3.5 border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent flex items-center gap-2.5 tracking-tight">
              <Users className="w-5.5 h-5.5 text-accent shrink-0 stroke-2" />
              Manajemen Rapat
            </h1>
            <p className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
              Rekam notulen, buat action items, dan pantau tindak lanjut
            </p>
          </div>
          {isWritable && (activeTab === 'meetings' ? (
            <button onClick={openCreateMeeting} className="md:hidden px-4 py-2 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-premium active:scale-95 transition-all">
              <Plus className="w-3.5 h-3.5 stroke-[2.5px]" /> Rapat
            </button>
          ) : (
            <button onClick={() => openCreateTask('')} className="md:hidden px-4 py-2 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-premium active:scale-95 transition-all">
              <Plus className="w-3.5 h-3.5 stroke-[2.5px]" /> Action
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
          <Link href="/monitoring" className="flex-1 md:flex-initial text-center px-4 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <TrendingUp className="w-4 h-4 text-accent" /> Dashboard
          </Link>
          {isWritable && (activeTab === 'meetings' ? (
            <button onClick={openCreateMeeting} className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-xs items-center justify-center gap-1.5 shadow-premium hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Plus className="w-4 h-4 stroke-[2.5px]" /> Buat Rapat Baru
            </button>
          ) : (
            <button onClick={() => openCreateTask('')} className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold rounded-xl text-xs items-center justify-center gap-1.5 shadow-premium hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Plus className="w-4 h-4 stroke-[2.5px]" /> Buat Action Item Baru
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-105 dark:bg-slate-900/40 rounded-2xl w-fit border border-slate-200/30 dark:border-slate-850 no-scrollbar">
        <button onClick={() => setActiveTab('meetings')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${activeTab === 'meetings' ? 'bg-white dark:bg-slate-950 text-primary dark:text-accent shadow-sm border border-slate-250/20 dark:border-slate-800/40' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
          Daftar Rapat ({meetingSearch ? `${filteredMeetings.length}/${meetings.length}` : meetings.length})
        </button>
        <button onClick={() => setActiveTab('actions')} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${activeTab === 'actions' ? 'bg-white dark:bg-slate-950 text-primary dark:text-accent shadow-sm border border-slate-250/20 dark:border-slate-800/40' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
          Action Items ({actionItems.length})
        </button>
      </div>

      {/* ===== CONTENT ===== */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>
      ) : activeTab === 'meetings' ? (
        <div className="space-y-4 pb-4 animate-fadeIn">
          {/* Deep Search Meetings Toolbar */}
          <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari rapat, agenda, atau notulen..."
                value={meetingSearch}
                onChange={(e) => setMeetingSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 text-slate-800 dark:text-slate-100 outline-none focus:border-accent transition-all"
              />
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              🔍 Deep Search: Mendeteksi Judul, Agenda & Isi Pembahasan
            </div>
          </div>

          {filteredMeetings.length === 0 && (
            <div className="premium-card p-12 text-center space-y-4 shadow-premium">
              <Users className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto stroke-1" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Tidak menemukan rapat yang cocok</p>
              {meetingSearch && (
                <button onClick={() => setMeetingSearch('')} className="text-xs text-accent font-bold hover:underline transition-all">Bersihkan Pencarian</button>
              )}
            </div>
          )}
          {filteredMeetings.map((mtg) => {
            const expanded = expandedMeetingId === mtg.id;
            const tasks = meetingTasks(mtg.id);
            
            // Calculate task progress and overdue stats
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter((t: any) => t.status === 'Selesai').length;
            const overdueTasks = tasks.filter((t: any) => {
              if (t.status === 'Selesai') return false;
              if (!t.deadline) return false;
              const deadlineDate = new Date(t.deadline);
              const today = new Date();
              today.setHours(0,0,0,0);
              return deadlineDate < today;
            }).length;

            const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            const nextStatus = getNextStatus(mtg.status);
            const nextLabel = getNextStatusLabel(mtg.status);

            return (
              <div key={mtg.id} className="premium-card relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />

                {/* Card Header */}
                <div className="p-5 pl-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight">{mtg.title || 'Tanpa Judul'}</h3>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider border ${getStatusStyle(mtg.status)}`}>
                          {mtg.status || 'Draft'}
                        </span>
                        {overdueTasks > 0 && (
                          <span className="text-[9px] px-2.5 py-0.5 rounded-lg font-extrabold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse flex items-center gap-1 shadow-sm">
                            <AlertCircle className="w-3 h-3 stroke-[2.5px]" /> {overdueTasks} Overdue!
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-medium">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-350"><Calendar className="w-4 h-4 text-accent" /> {formatDate(mtg.date)}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {mtg.time} WIB</span>
                        {mtg.location && <span className="flex items-center gap-1.5 text-slate-400"><MapPin className="w-4 h-4" /> {mtg.location}</span>}
                        {totalTasks > 0 && <span className="flex items-center gap-1.5 text-accent font-bold"><Target className="w-4 h-4" /> {totalTasks} action items</span>}
                      </div>

                      {totalTasks > 0 && (
                        <div className="mt-3.5 space-y-1.5 max-w-xs">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Progress Tindak Lanjut</span>
                            <span className="text-accent">{completionPercent}% ({completedTasks}/{totalTasks} Selesai)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-105 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/20 dark:border-slate-800/30">
                            <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300" style={{ width: `${completionPercent}%` }} />
                          </div>
                        </div>
                      )}
                      </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1 lg:pt-0">
                      {/* Workflow: Next Status Button */}
                      {nextStatus && isWritable && (
                        <button onClick={() => handleUpdateStatus(mtg.id, nextStatus)} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-gradient-to-r from-primary via-primary/95 to-accent text-white shadow-premium hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                          {nextLabel}
                        </button>
                      )}
                      
                      {/* Mobile action trigger */}
                      {isWritable && (
                        <button 
                          onClick={() => setMobileActionMeeting(mtg)} 
                          className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold bg-gradient-to-r from-primary via-primary/95 to-accent text-white shadow-premium active:scale-[0.97] transition-all"
                          title="Pilihan Aksi"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Aksi</span>
                        </button>
                      )}

                      {isWritable && (
                        <button 
                          onClick={() => openNotulen(mtg)} 
                          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-slate-200/60 dark:border-slate-800/60 text-slate-650 hover:text-primary dark:text-slate-400 dark:hover:text-white bg-slate-50/20 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/80 transition-all active:scale-[0.97]"
                          title="Isi Notulen Rapat"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                          <span>Notulen</span>
                        </button>
                      )}

                      <button 
                        onClick={() => exportToPDF(mtg, tasks)} 
                        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-slate-200/60 dark:border-slate-800/60 text-slate-650 hover:text-primary dark:text-slate-400 dark:hover:text-white bg-slate-50/20 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/80 transition-all active:scale-[0.97]"
                        title="Unduh PDF Dokumen Rapat"
                      >
                        <FileDown className="w-3.5 h-3.5 text-emerald-500" />
                        <span>PDF</span>
                      </button>

                      <button 
                        onClick={() => shareToWhatsApp(mtg)} 
                        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-slate-200/60 dark:border-slate-800/60 text-slate-650 hover:text-accent dark:text-slate-400 dark:hover:text-white bg-slate-50/20 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/80 transition-all active:scale-[0.97]"
                        title="Bagikan Notulen ke WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5 text-accent" />
                        <span>Bagikan</span>
                      </button>

                      {isWritable && (
                        <button 
                          onClick={() => openCreateTask(mtg.id)} 
                          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-slate-200/60 dark:border-slate-800/60 text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-white bg-slate-50/20 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/80 transition-all active:scale-[0.97]"
                          title="Tambah Tugas Tindak Lanjut"
                        >
                          <ClipboardList className="w-3.5 h-3.5 text-green-500" />
                          <span>Tugas</span>
                        </button>
                      )}

                      {isWritable && (
                        <button 
                          onClick={() => openEditMeeting(mtg)} 
                          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-slate-200/60 dark:border-slate-800/60 text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-white bg-slate-50/20 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/80 transition-all active:scale-[0.97]"
                          title="Edit Rapat"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                          <span>Edit</span>
                        </button>
                      )}

                      {isWritable && (
                        <button 
                          onClick={() => handleDeleteMeeting(mtg.id)} 
                          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-slate-200/60 dark:border-slate-800/60 text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 bg-slate-50/20 hover:bg-slate-50 dark:bg-slate-900/20 dark:hover:bg-slate-900/80 transition-all active:scale-[0.97]"
                          title="Hapus Rapat"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Hapus</span>
                        </button>
                      )}

                      <button 
                        onClick={() => setExpandedMeetingId(expanded ? null : mtg.id)} 
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 hover:bg-slate-100 dark:text-slate-400 dark:bg-slate-900/30 transition-all active:scale-[0.97]"
                        title="Tampilkan Detail Rapat"
                      >
                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{expanded ? 'Tutup' : 'Detail'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Moderator & Notulen badges */}
                  <div className="flex items-center gap-2 text-[10px] mt-3 font-semibold">
                    {mtg.moderator && <span className="px-3 py-1 rounded-xl bg-slate-50/65 dark:bg-slate-900/30 text-slate-600 dark:text-slate-450 border border-slate-200/50 dark:border-slate-800/40">🎙️ {mtg.moderator}</span>}
                    {mtg.notulen && <span className="px-3 py-1 rounded-xl bg-slate-50/65 dark:bg-slate-900/30 text-slate-600 dark:text-slate-450 border border-slate-200/50 dark:border-slate-800/40">📝 {mtg.notulen}</span>}
                  </div>
                </div>

                {/* Expanded Detail */}
                {expanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800/55 p-5 pl-6 space-y-5 bg-slate-50/30 dark:bg-slate-900/10">
                    {/* Agenda */}
                    {mtg.agenda && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">📋 Agenda</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{mtg.agenda}</p>
                      </div>
                    )}
                    {/* Hasil Pembahasan & Keputusan - Grid Side-by-side */}
                    {(mtg.discussion || mtg.decision) && (
                      <div className="space-y-2.5">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">📝 Hasil Pembahasan & Keputusan</p>
                        <div className="grid grid-cols-1 gap-2.5">
                          {parseNotulenPoints(mtg.discussion || '', mtg.decision || '').map((pt, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
                              {/* Pembahasan */}
                              <div className="space-y-1 pl-1">
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wide flex items-center gap-1">
                                  💬 Pembahasan #{idx + 1}
                                </span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                                  {pt.discussion || '-'}
                                </p>
                              </div>
                              {/* Keputusan */}
                              <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-2.5 md:pt-0 md:pl-4">
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                                  ✓ Keputusan #{idx + 1}
                                </span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                  {pt.decision || '-'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!mtg.discussion && !mtg.decision && (
                      <button onClick={() => openNotulen(mtg)} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 font-semibold hover:border-accent hover:text-accent transition-colors">
                        + Klik untuk mengisi notulen pembahasan & keputusan
                      </button>
                    )}

                    {/* Related Action Items */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">🎯 Action Items ({tasks.length})</p>
                        {isWritable && (
                          <button onClick={() => openCreateTask(mtg.id)} className="text-[11px] text-accent font-bold hover:underline">+ Tambah</button>
                        )}
                      </div>
                      {tasks.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Belum ada action item untuk rapat ini</p>
                      ) : (
                        <div className="space-y-2">
                          {tasks.map(task => (
                            <div key={task.id} className="p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">{task.title}</span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                                  <span>👤 {task.pic}</span>
                                  <span>📅 {formatDate(task.deadline)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Quick Status Toggle */}
                                <select
                                  value={task.status}
                                  disabled={!isWritable}
                                  onChange={(e) => handleQuickUpdateTask(task.id, { status: e.target.value, progress: e.target.value === 'Selesai' ? '100' : task.progress })}
                                  className="text-[10px] font-bold rounded-lg px-2 py-1 border bg-white dark:bg-slate-800 outline-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                  {TASK_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {/* Progress bar */}
                                <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-accent h-full rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 w-8">{task.progress}%</span>
                                {isWritable && (
                                  <button onClick={() => openEditTask(task)} className="p-1 rounded-lg text-slate-400 hover:text-blue-500"><Edit3 className="w-3.5 h-3.5" /></button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ===== ACTION ITEMS TAB ===== */
        <div className="space-y-4">
          {/* Search & Filter Controls */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cari Action Item</label>
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="Cari judul, PIC, deskripsi..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs outline-none focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prioritas</label>
              <select
                value={taskPriorityFilter}
                onChange={(e) => setTaskPriorityFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs outline-none cursor-pointer"
              >
                <option value="Semua">Semua Prioritas</option>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs outline-none cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                {TASK_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">PIC (Penanggung Jawab)</label>
              <select
                value={taskPicFilter}
                onChange={(e) => setTaskPicFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-xs outline-none cursor-pointer"
              >
                <option value="Semua">Semua PIC</option>
                {Array.from(new Set(actionItems.map(a => a.pic).filter(Boolean))).map(pic => (
                  <option key={pic} value={pic}>{pic}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Items List */}
          {(() => {
            const filteredTasks = actionItems.filter(task => {
              const matchesSearch = 
                task.title?.toLowerCase().includes(taskSearch.toLowerCase()) ||
                task.description?.toLowerCase().includes(taskSearch.toLowerCase()) ||
                task.pic?.toLowerCase().includes(taskSearch.toLowerCase());
              
              const matchesPriority = taskPriorityFilter === 'Semua' || task.priority === taskPriorityFilter;
              const matchesStatus = taskStatusFilter === 'Semua' || task.status === taskStatusFilter;
              const matchesPic = taskPicFilter === 'Semua' || task.pic === taskPicFilter;

              return matchesSearch && matchesPriority && matchesStatus && matchesPic;
            });

            if (filteredTasks.length === 0) {
              return (
                <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border text-center space-y-3 shadow-sm">
                  <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-500">Tidak ada action item yang cocok</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {filteredTasks.map(task => {
                  const mtg = meetings.find(m => m.id === task.meeting_id);
                  return (
                    <div key={task.id} className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent" />
                      <div className="pl-2 flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${task.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : task.status === 'Proses' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{task.status}</span>
                          </div>
                          {task.description && <p className="text-[11px] text-slate-500 mt-1">{task.description}</p>}
                          <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
                            <span>👤 {task.pic}</span>
                            <span>📅 {formatDate(task.deadline)}</span>
                            {mtg && <span className="text-accent font-semibold">📌 {mtg.title}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={task.status}
                            disabled={!isWritable}
                            onChange={(e) => handleQuickUpdateTask(task.id, { status: e.target.value, progress: e.target.value === 'Selesai' ? '100' : task.progress })}
                            className="text-[10px] font-bold rounded-lg px-2 py-1.5 border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 outline-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                          >
                            {TASK_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className="bg-accent h-full rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold w-8">{task.progress}%</span>
                          {isWritable && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEditTask(task)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-955/20 transition-colors"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
      {/* ===== MODAL: CREATE/EDIT MEETING ===== */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-white/95 dark:bg-slate-950/90 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 p-6 shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">{editingMeetingId ? '✏️ Edit Rapat' : '📋 Jadwalkan Rapat Baru'}</h2>
              <button onClick={() => setShowMeetingModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"><X className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" /></button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSaveMeeting} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar pb-4">
                <div>
                  <label className={labelClass}>Nama Meeting / Rapat *</label>
                  <input type="text" required value={meetingForm.title} onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})} placeholder="Contoh: Rapat Sinkronisasi Mingguan" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Tanggal</label>
                    <input type="date" value={meetingForm.date} onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Jam</label>
                    <input type="time" value={meetingForm.time} onChange={(e) => setMeetingForm({...meetingForm, time: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select value={meetingForm.status} onChange={(e) => setMeetingForm({...meetingForm, status: e.target.value})} className={inputClass}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Lokasi</label>
                  <input type="text" value={meetingForm.location} onChange={(e) => setMeetingForm({...meetingForm, location: e.target.value})} placeholder="Ruang Rapat Lt 2, Zoom, dll." className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Moderator</label>
                    <input type="text" value={meetingForm.moderator} onChange={(e) => setMeetingForm({...meetingForm, moderator: e.target.value})} placeholder="Nama moderator" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Notulen</label>
                    <input type="text" value={meetingForm.notulen} onChange={(e) => setMeetingForm({...meetingForm, notulen: e.target.value})} placeholder="Nama pencatat" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Agenda Rapat</label>
                  <textarea rows={2} value={meetingForm.agenda} onChange={(e) => setMeetingForm({...meetingForm, agenda: e.target.value})} placeholder="Topik yang akan dibahas..." className={inputClass} />
                </div>
                {/* Editor Pembahasan & Keputusan Poin-per-poin (Sinkron) */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-0.5">
                      Pembahasan & Keputusan Rapat (Sinkron)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setDraftSelectorTarget('meeting');
                        setShowDraftSelectorModal(true);
                      }}
                      className="px-3.5 py-1.5 text-[10px] font-bold rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-500/10 text-amber-600 dark:text-amber-450 hover:bg-amber-500/20 transition-all active:scale-[0.97]"
                    >
                      📥 Ambil Poin dari Draf Catatan
                    </button>
                  </div>
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                    {meetingPoints.map((pt, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-55/40 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 relative group space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-450 px-2.5 py-0.5 rounded bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/20 dark:border-slate-800/30">
                            📌 Poin Rapat #{idx + 1}
                          </span>
                          {meetingPoints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMeetingPoint(idx)}
                              className="px-2.5 py-1 rounded-lg text-[9px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200/40 transition-colors"
                            >
                              Hapus Poin
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">
                              💬 Pembahasan / Masalah
                            </span>
                            <textarea
                              rows={2}
                              value={pt.discussion}
                              onChange={(e) => updateMeetingPoint(idx, 'discussion', e.target.value)}
                              placeholder="Contoh: Kinerja pengurus harian kurang berjalan maksimal"
                              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs outline-none focus:ring-1 focus:ring-accent transition-all resize-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider pl-0.5">
                              ✓ Keputusan / Solusi
                            </span>
                            <textarea
                              rows={2}
                              value={pt.decision}
                              onChange={(e) => updateMeetingPoint(idx, 'decision', e.target.value)}
                              placeholder="Contoh: Restrukturisasi organisasi baru"
                              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-xs outline-none focus:ring-1 focus:ring-accent transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addMeetingPoint}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:text-accent hover:border-accent dark:hover:text-emerald-400 dark:hover:border-emerald-500/60 transition-colors flex items-center justify-center gap-1.5 bg-slate-50/10"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Baris Pembahasan & Keputusan Baru
                  </button>
                </div>
              </div>
              
              {/* Footer - Fixed */}
              <div className="flex justify-end gap-2.5 p-6 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 shrink-0">
                <button type="button" onClick={() => setShowMeetingModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold uppercase tracking-wider transition-all">Batal</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : editingMeetingId ? 'Perbarui Rapat' : 'Simpan Rapat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: ISI NOTULEN ===== */}
      {showNotulenModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📝 Notulen Rapat & Keputusan</span>
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Tulis poin bahasan rapat bersandingan langsung dengan keputusan solusinya</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDraftSelectorTarget('notulen');
                    setShowDraftSelectorModal(true);
                  }}
                  className="px-3.5 py-1.5 text-[10px] font-bold rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-500/10 text-amber-600 dark:text-amber-450 hover:bg-amber-500/20 transition-all active:scale-[0.97]"
                >
                  📥 Ambil Poin dari Draf Catatan
                </button>
                <button type="button" onClick={() => setShowNotulenModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNotulen} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4 no-scrollbar pb-4">
                <div className="space-y-4 pr-1">
                  {notulenForm.points.map((pt, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 relative group space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg bg-slate-200/50 dark:bg-slate-800">
                          📌 Poin Rapat #{idx + 1}
                        </span>
                        {notulenForm.points.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePoint(idx)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200/40 transition-colors"
                          >
                            Hapus Poin
                          </button>
                        )}
                      </div>

                      {/* Synchronized Columns: Pembahasan vs Keputusan */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: Pembahasan */}
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">
                            💬 Pembahasan / Masalah
                          </span>
                          <textarea
                            rows={3}
                            required
                            value={pt.discussion}
                            onChange={(e) => updatePoint(idx, 'discussion', e.target.value)}
                            placeholder="Contoh: Kinerja pengurus harian kurang berjalan maksimal"
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-all resize-none"
                          />
                        </div>

                        {/* Right: Keputusan */}
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider pl-0.5">
                            ✓ Keputusan / Solusi
                          </span>
                          <textarea
                            rows={3}
                            required
                            value={pt.decision}
                            onChange={(e) => updatePoint(idx, 'decision', e.target.value)}
                            placeholder="Contoh: Restrukturisasi organisasi pengurus baru akan dijadwalkan minggu depan"
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Point Action Button */}
                <button
                  type="button"
                  onClick={addPoint}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500 hover:text-accent hover:border-accent dark:hover:text-emerald-400 dark:hover:border-emerald-500/60 transition-colors flex items-center justify-center gap-1.5 bg-slate-50/20"
                >
                  <Plus className="w-4 h-4" /> Tambah Baris Pembahasan & Keputusan Baru
                </button>
              </div>

              {/* Modal Footer - Fixed */}
              <div className="flex justify-end gap-2.5 p-5 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 shrink-0">
                <button type="button" onClick={() => setShowNotulenModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold uppercase tracking-wider transition-all">Batal</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Notulen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: CREATE/EDIT ACTION ITEM ===== */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-white/95 dark:bg-slate-950/90 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] backdrop-blur-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 p-6 shrink-0">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">{editingTaskId ? '✏️ Edit Action Item' : '🎯 Tambah Action Item'}</h2>
              <button onClick={() => setShowTaskModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"><X className="w-5 h-5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200" /></button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSaveTask} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 no-scrollbar pb-4">
                <div>
                  <label className={labelClass}>Pilih Rapat / Meeting *</label>
                  <select
                    required
                    value={taskForm.meeting_id}
                    onChange={(e) => setTaskForm({...taskForm, meeting_id: e.target.value})}
                    className={inputClass}
                  >
                    <option value="">-- Pilih Rapat Terkait --</option>
                    {meetings.map(m => (
                      <option key={m.id} value={m.id}>{m.title} ({formatDate(m.date)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Judul Action Item *</label>
                  <input type="text" required value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} placeholder="Contoh: Siapkan laporan keuangan" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Deskripsi</label>
                  <textarea rows={2} value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} placeholder="Penjelasan tugas secara detail..." className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelClass}>PIC (Penanggung Jawab) *</label>
                    <input type="text" required value={taskForm.pic} onChange={(e) => setTaskForm({...taskForm, pic: e.target.value})} placeholder="Nama penanggung jawab" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Deadline</label>
                    <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3.5">
                  <div>
                    <label className={labelClass}>Prioritas</label>
                    <select value={taskForm.priority} onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})} className={inputClass}>
                      {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select value={taskForm.status} onChange={(e) => setTaskForm({...taskForm, status: e.target.value})} className={inputClass}>
                      {TASK_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Progress (%)</label>
                    <input type="number" min={0} max={100} value={taskForm.progress} onChange={(e) => setTaskForm({...taskForm, progress: e.target.value})} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="flex justify-end gap-2.5 p-6 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10 shrink-0">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold uppercase tracking-wider transition-all">Batal</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : editingTaskId ? 'Perbarui' : 'Simpan Action Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== BOTTOM SHEET: AKSI RAPAT MOBILE ===== */}
      {mobileActionMeeting && (
        <div className="fixed inset-0 z-[100000] flex items-end justify-center bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setMobileActionMeeting(null)} />
          
          <div className="w-full max-w-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-t-[2.5rem] p-6 shadow-luxury border-t border-slate-200/50 dark:border-slate-800/40 z-10 animate-slideUp">
            {/* Header Handle */}
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-4" />
            
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                {mobileActionMeeting.title}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Pilih tindakan yang ingin dilakukan</p>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
              <button
                onClick={() => {
                  const mtg = mobileActionMeeting;
                  setMobileActionMeeting(null);
                  openNotulen(mtg);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-amber-250/20 dark:border-amber-900/10 text-left bg-amber-50/20 dark:bg-amber-950/10 text-slate-800 dark:text-slate-200 hover:scale-[1.01] transition-transform"
              >
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Isi Notulen Rapat</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Tulis poin pembahasan & keputusan secara sinkron</p>
                </div>
              </button>

              <button
                onClick={() => {
                  const mtg = mobileActionMeeting;
                  const mtgTasks = actionItems.filter(t => t.meeting_id === mtg.id);
                  setMobileActionMeeting(null);
                  exportToPDF(mtg, mtgTasks);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-emerald-250/20 dark:border-emerald-900/10 text-left bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-800 dark:text-slate-200 hover:scale-[1.01] transition-transform"
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileDown className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Unduh PDF Notulen</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Ekspor dokumen resmi ke file PDF</p>
                </div>
              </button>

              <button
                onClick={() => {
                  const mtg = mobileActionMeeting;
                  setMobileActionMeeting(null);
                  shareToWhatsApp(mtg);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-accent/20 dark:border-accent/10 text-left bg-accent/5 text-slate-800 dark:text-slate-200 hover:scale-[1.01] transition-transform"
              >
                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                  <Share2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Bagikan ke WhatsApp</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Kirim ringkasan notulen ke grup WA tim</p>
                </div>
              </button>

              <button
                onClick={() => {
                  const mtg = mobileActionMeeting;
                  setMobileActionMeeting(null);
                  openCreateTask(mtg.id);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-green-250/20 dark:border-green-900/10 text-left bg-green-50/20 dark:bg-green-950/10 text-slate-800 dark:text-slate-200 hover:scale-[1.01] transition-transform"
              >
                <div className="p-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
                  <ClipboardList className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Tambah Tugas Tindak Lanjut</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Delegasikan action items rapat ke petugas</p>
                </div>
              </button>

              <button
                onClick={() => {
                  const mtg = mobileActionMeeting;
                  setMobileActionMeeting(null);
                  openEditMeeting(mtg);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-blue-250/20 dark:border-blue-900/10 text-left bg-blue-50/20 dark:bg-blue-950/10 text-slate-800 dark:text-slate-200 hover:scale-[1.01] transition-transform"
              >
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Edit3 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Edit Detail Rapat</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Ubah judul, tanggal, agenda, atau moderator</p>
                </div>
              </button>

              <button
                onClick={() => {
                  const mtg = mobileActionMeeting;
                  setMobileActionMeeting(null);
                  handleDeleteMeeting(mtg.id);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-red-250/20 dark:border-red-900/10 text-left bg-red-50/20 dark:bg-red-950/10 text-slate-800 dark:text-slate-200 hover:scale-[1.01] transition-transform"
              >
                <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <Trash2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">Hapus Rapat</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Hapus permanen rapat beserta tugas-tugasnya</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setMobileActionMeeting(null)}
              className="w-full mt-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/30 dark:border-slate-800/40 transition-colors active:scale-[0.98]"
            >
              Batal / Tutup
            </button>
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

      {/* ===== MODAL: PILIH DRAF CATATAN GLOBAL ===== */}
      {showDraftSelectorModal && (
        <div className="fixed inset-0 z-[110000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] flex flex-col max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 p-6 shrink-0 bg-slate-50/20 dark:bg-slate-900/10">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  📥 Pilih Draf Catatan Rapat Global
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Ambil poin draf catatan dari seluruh anggota tim
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowDraftSelectorModal(false)} 
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3.5 no-scrollbar pb-6 bg-slate-50/5 dark:bg-slate-900/5">
              {draftNotes.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Belum ada draf catatan rapat global</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh]">
                  {draftNotes.map((note) => (
                    <div key={note.id} className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent/40 dark:hover:border-accent/40 transition-colors shadow-sm">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-850 dark:text-white leading-tight">{note.title}</span>
                          <span className="text-[8px] px-2 py-0.5 rounded-md font-bold bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400 border border-primary/20 dark:border-emerald-500/20 uppercase tracking-wide">
                            {note.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-550 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {note.content}
                        </p>
                        <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase pt-0.5">
                          <span className="flex items-center gap-1.5">
                            👤 Pembuat: <strong className="text-slate-650 dark:text-slate-300">{note.created_by_name || 'Tidak Diketahui'}</strong>
                          </span>
                          <span>📅 {note.date ? new Date(note.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newPoint = {
                            discussion: note.title || '',
                            decision: note.content || '',
                          };
                          if (draftSelectorTarget === 'meeting') {
                            const cleanPoints = meetingPoints.filter(p => p.discussion.trim() !== '' || p.decision.trim() !== '');
                            setMeetingPoints([...cleanPoints, newPoint]);
                          } else {
                            const cleanPoints = notulenForm.points.filter(p => p.discussion.trim() !== '' || p.decision.trim() !== '');
                            setNotulenForm({
                              ...notulenForm,
                              points: [...cleanPoints, newPoint]
                            });
                          }
                          setShowDraftSelectorModal(false);
                          alert(`Berhasil mengimpor draf dari catatan "${note.title}"!`);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl text-[10px] uppercase tracking-wider shadow-sm active:scale-95 transition-all text-center sm:self-center self-stretch whitespace-nowrap"
                      >
                        Pilih & Impor
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
