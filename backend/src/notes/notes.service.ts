import { Injectable, NotFoundException } from '@nestjs/common';
import { GoogleBridgeService } from '../google-bridge/google-bridge.service';
import fs = require('fs');
import path = require('path');

@Injectable()
export class NotesService {
  constructor(private readonly bridge: GoogleBridgeService) {}

  async findAll(query: any, userId?: string, roleName?: string) {
    const res = await this.bridge.get('Notes', query);
    let notes = res.data?.items || [];

    // Filter catatan: Setiap pengguna hanya bisa melihat catatan miliknya sendiri
    // KECUALI jika untuk kebutuhan mengambil draf catatan rapat (query.meetingDrafts === 'true')
    if (query?.meetingDrafts === 'true') {
      notes = notes.filter((note: any) => note.is_meeting_draft === 'true' || note.is_meeting_draft === true);
    } else if (userId) {
      notes = notes.filter((note: any) => note.created_by === userId);
    }

    let users: any[] = [];
    try {
      const usersRes = await this.bridge.get('Users');
      users = usersRes.data?.items || [];
    } catch (e) {
      // ignore
    }
    const notesWithUser = notes.map((note: any) => {
      const creator = users.find((u: any) => u.id === note.created_by);
      return {
        ...note,
        created_by_name: creator ? creator.name : (note.created_by === 'USR-3' ? 'Staff Lapangan' : (note.created_by === 'USR-2' ? 'Manager Rapat' : 'Administrator')),
      };
    });
    return { ...res.data, items: notesWithUser };
  }

  async findOne(id: string, userId?: string, roleName?: string) {
    const res = await this.bridge.get('Notes');
    const items = res.data?.items || [];
    const item = items.find((x: any) => x.id === id);
    if (!item) throw new NotFoundException('Catatan tidak ditemukan');
    
    // Cegah akses jika bukan pemilik (berlaku untuk semua pengguna)
    if (userId && item.created_by !== userId) {
      throw new NotFoundException('Catatan tidak ditemukan');
    }

    let users: any[] = [];
    try {
      const usersRes = await this.bridge.get('Users');
      users = usersRes.data?.items || [];
    } catch (e) {
      // ignore
    }
    const creator = users.find((u: any) => u.id === item.created_by);
    return {
      ...item,
      created_by_name: creator ? creator.name : (item.created_by === 'USR-3' ? 'Staff Lapangan' : (item.created_by === 'USR-2' ? 'Manager Rapat' : 'Administrator')),
    };
  }

  async create(data: any, userId: string) {
    const payload = {
      ...data,
      status: data.status || 'Published',
      priority: data.priority || 'Medium',
      visibility: data.visibility || 'Private',
      is_favorite: data.is_favorite || 'false',
      is_archived: data.is_archived || 'false',
      created_by: userId || 'USR-1',
    };
    const res = await this.bridge.post('insert', { sheet: 'Notes', data: payload });
    return res.data;
  }

  async update(id: string, data: any, userId: string) {
    // Verifikasi kepemilikan terlebih dahulu
    await this.findOne(id, userId);
    const res = await this.bridge.post('update', { sheet: 'Notes', id, data });
    return res.data;
  }

  async remove(id: string, userId: string) {
    // Verifikasi kepemilikan terlebih dahulu
    await this.findOne(id, userId);
    const res = await this.bridge.post('delete', { sheet: 'Notes', id });
    return res.data;
  }
}
