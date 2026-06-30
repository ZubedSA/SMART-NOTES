import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoogleBridgeService {
  private readonly logger = new Logger(GoogleBridgeService.name);
  private readonly gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL || '';

  constructor() {
    if (!this.gasUrl) {
      this.logger.warn('GOOGLE_APPS_SCRIPT_URL belum diset di .env. Menggunakan mock data/in-memory bridge.');
    }
  }

  /**
   * Helper GET request ke Google Apps Script
   */
  async get(sheet: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.gasUrl || this.gasUrl.includes('MOCK_GAS_URL')) {
      return this.mockGetData(sheet, params);
    }
    try {
      const response = await axios.get(this.gasUrl, {
        params: { 
          sheet, 
          action: 'read', 
          spreadsheet_id: process.env.GOOGLE_SPREADSHEET_ID || '',
          ...params 
        },
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error GET sheet ${sheet}: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response details: ${JSON.stringify(error.response.data)}`);
      }
      throw new InternalServerErrorException(`Gagal mengambil data dari sheet ${sheet}: ${error.message}`);
    }
  }

  /**
   * Helper POST request ke Google Apps Script (insert, update, delete, upload)
   */
  async post(action: string, payload: Record<string, any>): Promise<any> {
    if (!this.gasUrl || this.gasUrl.includes('MOCK_GAS_URL')) {
      return this.mockPostData(action, payload);
    }
    try {
      // Kita kirim via GET parameter agar terhindar dari isu 302 Redirect / 405 Method Not Allowed pada server Google Apps Script
      const params: any = { 
        action, 
        spreadsheet_id: process.env.GOOGLE_SPREADSHEET_ID || '',
        ...payload 
      };
      if (payload.data && typeof payload.data === 'object') {
        params.data = JSON.stringify(payload.data);
      }
      const response = await axios.get(this.gasUrl, { params });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error POST action ${action}: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response details: ${JSON.stringify(error.response.data)}`);
      }
      throw new InternalServerErrorException(`Gagal mengeksekusi aksi ${action} pada Google Sheet: ${error.message}`);
    }
  }

  // --- MOCK FALLBACK (Berguna saat development & sebelum GAS URL dimasukkan) ---
  private mockDb: Record<string, any[]> = {
    Users: [
      { id: 'USR-1', email: 'admin@smart.id', name: 'Administrator', role_id: 'ROLE-1', phone: '081234567890' },
      { id: 'USR-2', email: 'manager@smart.id', name: 'Manager Rapat', role_id: 'ROLE-2', phone: '081298765432' },
      { id: 'USR-3', email: 'staff@smart.id', name: 'Staff Lapangan', role_id: 'ROLE-3', phone: '081311223344' },
    ],
    Notes: [
      { id: 'NOTE-1', title: 'Strategi Pengembangan Q3', category: 'Catatan Project', content: 'Fokus utama pada mobile UI dan integrasi Google Drive.', date: '2026-06-27', time: '10:00', priority: 'High', status: 'Published', is_favorite: 'true' },
      { id: 'NOTE-2', title: 'Ide Rapat Evaluasi Bulanan', category: 'Catatan Meeting', content: 'Diskusikan action item overdue dari divisi IT.', date: '2026-06-26', time: '14:30', priority: 'Medium', status: 'Published', is_favorite: 'false' },
    ],
    Meetings: [
      { id: 'MTG-1', title: 'Rapat Sinkronisasi Project Smart Notes', date: '2026-06-28', time: '09:00', location: 'Ruang Rapat Utama & Zoom', moderator: 'Manager Rapat', notulen: 'Staff Lapangan', status: 'Berlangsung' },
    ],
    MeetingTasks: [
      { id: 'MTASK-1', meeting_id: 'MTG-1', title: 'Siapkan Arsitektur Database', description: 'Buat 15 sheet di Google Spreadsheet', pic: 'Staff Lapangan', deadline: '2026-06-30', priority: 'High', status: 'Proses', progress: '60' },
      { id: 'MTASK-2', meeting_id: 'MTG-1', title: 'Review Desain UI Mobile First', description: 'Pastikan bottom navigation nyaman digunakan', pic: 'Manager Rapat', deadline: '2026-07-02', priority: 'Medium', status: 'Belum', progress: '0' },
    ],
    Tasks: [
      { id: 'TSK-1', title: 'Uji Coba PWA Offline Mode', category: 'Testing', pic: 'Staff Lapangan', deadline: '2026-07-01', priority: 'Critical', status: 'Proses' },
    ],
    Agenda: [
      { id: 'AGD-1', title: 'Audit Keamanan Sistem Bulanan', date: '2026-07-05', time: '13:00', location: 'Ruang Server', category: 'Internal', status: 'Terjadwal' },
    ],
  };

  private async mockGetData(sheet: string, params: Record<string, any>) {
    const items = this.mockDb[sheet] || [];
    return { success: true, data: { items, total: items.length, page: 1, limit: 100 } };
  }

  private async mockPostData(action: string, payload: Record<string, any>) {
    const sheet = payload.sheet;
    if (action === 'insert') {
      const newItem = { id: `ID-${Date.now()}`, ...payload.data };
      if (!this.mockDb[sheet]) this.mockDb[sheet] = [];
      this.mockDb[sheet].push(newItem);
      return { success: true, data: newItem };
    }
    if (action === 'update') {
      if (this.mockDb[sheet]) {
        const index = this.mockDb[sheet].findIndex(x => x.id === payload.id);
        if (index !== -1) {
          this.mockDb[sheet][index] = { ...this.mockDb[sheet][index], ...payload.data };
          return { success: true, data: this.mockDb[sheet][index] };
        }
      }
      return { success: true, data: payload.data };
    }
    if (action === 'delete') {
      if (this.mockDb[sheet]) {
        this.mockDb[sheet] = this.mockDb[sheet].filter(x => x.id !== payload.id);
      }
      return { success: true };
    }
    return { success: true, data: payload.data };
  }
}
