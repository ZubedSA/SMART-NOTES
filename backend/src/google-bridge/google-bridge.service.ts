import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import fs = require('fs');
import path = require('path');

@Injectable()
export class GoogleBridgeService {
  private readonly logger = new Logger(GoogleBridgeService.name);
  private readonly gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL || '';

  constructor() {
    if (!this.gasUrl) {
      this.logger.warn('GOOGLE_APPS_SCRIPT_URL belum diset di .env. Menggunakan mock data/in-memory bridge.');
    }
  }

  private logToFile(message: string) {
    try {
      const logPath = path.join(process.cwd(), 'backend-errors.log');
      const timestamp = new Date().toISOString();
      fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    } catch (e) {
      // ignore
    }
  }

  private readonly cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // Cache valid selama 30 detik

  private getCacheKey(sheet: string, params: Record<string, any>): string {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '';
    return `${spreadsheetId}:${sheet}:${JSON.stringify(params)}`;
  }

  private invalidateCache(sheet: string) {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '';
    const prefix = `${spreadsheetId}:${sheet}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
    this.logger.log(`Cache invalidated untuk sheet: ${sheet}`);
  }

  /**
   * Helper GET request ke Google Apps Script (dengan Caching)
   */
  async get(sheet: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.gasUrl || this.gasUrl.includes('MOCK_GAS_URL')) {
      return this.mockGetData(sheet, params);
    }

    const cacheKey = this.getCacheKey(sheet, params);
    const cachedEntry = this.cache.get(cacheKey);
    const now = Date.now();

    // Jika cache ditemukan dan belum kedaluwarsa (TTL 30s)
    if (cachedEntry && (now - cachedEntry.timestamp < this.CACHE_TTL)) {
      this.logger.log(`[Cache HIT] Mengambil data sheet ${sheet} secara instan dari cache.`);
      return cachedEntry.data;
    }

    try {
      const response = await axios.get(this.gasUrl, {
        params: { 
          sheet, 
          action: 'read', 
          spreadsheet_id: process.env.GOOGLE_SPREADSHEET_ID || '',
          ...params 
        },
        timeout: 15000, // Timeout 15 detik untuk cold start GAS
      });

      // Jika response sukses bernilai false (misal error hak akses/spreadsheet tidak ditemukan)
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Error internal dari Google Apps Script');
      }

      // Simpan hasil ke cache jika respon sukses
      if (response.data && response.data.success) {
        this.cache.set(cacheKey, { data: response.data, timestamp: now });
        this.logger.log(`[Cache MISS] Mengambil data sheet ${sheet} dari Google Sheets dan menyimpannya ke cache.`);
      }

      return response.data;
    } catch (error: any) {
      const errMsg = `Error GET sheet ${sheet}: ${error.message}${error.response ? ' | Details: ' + JSON.stringify(error.response.data) : ''}.`;
      this.logToFile(errMsg);
      this.logger.error(errMsg);

      // Offline Resilience: Jika koneksi gagal tetapi ada cache kedaluwarsa, kembalikan cache tersebut
      if (cachedEntry) {
        this.logger.warn(`[Cache STALE] Menggunakan data cache usang untuk sheet ${sheet} karena kendala koneksi.`);
        return cachedEntry.data;
      }

      return this.mockGetData(sheet, params);
    }
  }

  /**
   * Helper POST request ke Google Apps Script (insert, update, delete, upload)
   */
  async post(action: string, payload: Record<string, any>): Promise<any> {
    if (!this.gasUrl || this.gasUrl.includes('MOCK_GAS_URL')) {
      const result = await this.mockPostData(action, payload);
      if (payload.sheet) this.invalidateCache(payload.sheet);
      return result;
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
      const response = await axios.get(this.gasUrl, { 
        params,
        timeout: 15000, // Timeout 15 detik untuk cold start GAS
      });

      // Jika response sukses bernilai false
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Error internal dari Google Apps Script');
      }

      // Invalidasi cache untuk sheet terkait setelah berhasil menulis/memperbarui data baru
      if (payload.sheet) {
        this.invalidateCache(payload.sheet);
      }

      return response.data;
    } catch (error: any) {
      const errMsg = `Error POST action ${action}: ${error.message}${error.response ? ' | Details: ' + JSON.stringify(error.response.data) : ''}.`;
      this.logToFile(errMsg);
      this.logger.error(errMsg);

      // Invalidasi cache agar pada request get berikutnya memaksa mengambil ulang ke server GAS
      if (payload.sheet) {
        this.invalidateCache(payload.sheet);
      }

      return this.mockPostData(action, payload);
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
      { id: 'NOTE-1', title: 'Strategi Pengembangan Q3', category: 'Catatan Project', content: 'Fokus utama pada mobile UI dan integrasi Google Drive.', date: '2026-06-27', time: '10:00', priority: 'High', status: 'Published', is_favorite: 'true', created_by: 'USR-2' },
      { id: 'NOTE-2', title: 'Ide Rapat Evaluasi Bulanan', category: 'Catatan Meeting', content: 'Diskusikan action item overdue dari divisi IT.', date: '2026-06-26', time: '14:30', priority: 'Medium', status: 'Published', is_favorite: 'false', created_by: 'USR-3' },
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
