import { Injectable } from '@nestjs/common';
import { GoogleBridgeService } from '../google-bridge/google-bridge.service';

@Injectable()
export class CommonFeaturesService {
  constructor(private readonly bridge: GoogleBridgeService) {}

  // --- CATEGORIES & LABELS ---
  async getCategories() {
    const res = await this.bridge.get('Categories');
    const items = res.data?.items || [];
    if (items.length === 0) {
      return [
        { id: 'CAT-1', name: 'Catatan Pribadi', color: '#10B981' },
        { id: 'CAT-2', name: 'Catatan Meeting', color: '#3B82F6' },
        { id: 'CAT-3', name: 'Catatan Agenda', color: '#F59E0B' },
        { id: 'CAT-4', name: 'Catatan Organisasi', color: '#8B5CF6' },
        { id: 'CAT-5', name: 'Catatan Pondok', color: '#14532D' },
        { id: 'CAT-6', name: 'Catatan Hafalan', color: '#EC4899' },
        { id: 'CAT-7', name: 'Catatan Project', color: '#06B6D4' },
      ];
    }
    return items;
  }

  async createCategory(data: any) {
    const res = await this.bridge.post('insert', { sheet: 'Categories', data });
    return res.data;
  }

  async updateCategory(id: string, data: any) {
    const res = await this.bridge.post('update', { sheet: 'Categories', id, data });
    return res.data;
  }

  async deleteCategory(id: string) {
    const res = await this.bridge.post('delete', { sheet: 'Categories', id });
    return res;
  }

  async getLabels() {
    const res = await this.bridge.get('Labels');
    return res.data?.items || [
      { id: 'LBL-1', name: 'Urgent', color: '#EF4444' },
      { id: 'LBL-2', name: 'Penting', color: '#F59E0B' },
      { id: 'LBL-3', name: 'Ide', color: '#10B981' },
    ];
  }

  // --- USERS ---
  async getUsers() {
    const res = await this.bridge.get('Users');
    return res.data?.items || [];
  }

  async createUser(data: any) {
    const res = await this.bridge.post('insert', { sheet: 'Users', data });
    return res.data;
  }

  async updateUser(id: string, data: any) {
    const res = await this.bridge.post('update', { sheet: 'Users', id, data });
    return res.data;
  }

  async deleteUser(id: string) {
    const res = await this.bridge.post('delete', { sheet: 'Users', id });
    return res;
  }

  // --- REALTIME SEARCH ---
  async globalSearch(query: string) {
    if (!query) return { notes: [], meetings: [], tasks: [], agenda: [] };
    const q = query.toLowerCase();

    const [notesRes, mtgRes, taskRes, agdRes] = await Promise.all([
      this.bridge.get('Notes'),
      this.bridge.get('Meetings'),
      this.bridge.get('Tasks'),
      this.bridge.get('Agenda'),
    ]);

    const notes = (notesRes.data?.items || []).filter((x: any) =>
      String(x.title || '').toLowerCase().includes(q) || String(x.content || '').toLowerCase().includes(q)
    );
    const meetings = (mtgRes.data?.items || []).filter((x: any) =>
      String(x.title || '').toLowerCase().includes(q) || String(x.discussion || '').toLowerCase().includes(q)
    );
    const tasks = (taskRes.data?.items || []).filter((x: any) =>
      String(x.title || '').toLowerCase().includes(q) || String(x.pic || '').toLowerCase().includes(q)
    );
    const agenda = (agdRes.data?.items || []).filter((x: any) =>
      String(x.title || '').toLowerCase().includes(q) || String(x.description || '').toLowerCase().includes(q)
    );

    return { notes, meetings, tasks, agenda };
  }

  // --- UPLOAD TO DRIVE VIA GAS ---
  async uploadFile(base64Data: string, fileName: string, mimeType: string) {
    const res = await this.bridge.post('upload', { base64Data, fileName, mimeType });
    return res.data || { url: 'https://drive.google.com/mock-file-url', fileName };
  }

  // --- REPORTS ---
  async getReportsSummary() {
    const [notesRes, mtgRes, taskRes] = await Promise.all([
      this.bridge.get('Notes'),
      this.bridge.get('Meetings'),
      this.bridge.get('Tasks'),
    ]);

    return {
      notesCount: (notesRes.data?.items || []).length,
      meetingsCount: (mtgRes.data?.items || []).length,
      tasksCount: (taskRes.data?.items || []).length,
      generatedAt: new Date().toISOString(),
    };
  }

  // --- LOGS ---
  async getLogs() {
    const res = await this.bridge.get('Logs');
    return res.data?.items || [
      { id: 'LOG-1', user_id: 'USR-1', action: 'Login ke sistem', timestamp: new Date().toISOString(), ip: '127.0.0.1', device: 'Desktop Chrome' },
    ];
  }

  // --- SETTINGS ---
  async getSettings() {
    const res = await this.bridge.get('Settings');
    return res.data?.items || [
      { key: 'app_name', value: 'Smart Notes Management System' },
      { key: 'primary_color', value: '#14532D' },
      { key: 'accent_color', value: '#16A34A' },
    ];
  }
}
