import { Injectable, NotFoundException } from '@nestjs/common';
import { GoogleBridgeService } from '../google-bridge/google-bridge.service';

@Injectable()
export class NotesService {
  constructor(private readonly bridge: GoogleBridgeService) {}

  async findAll(query: any) {
    const res = await this.bridge.get('Notes', query);
    return res.data;
  }

  async findOne(id: string) {
    const res = await this.bridge.get('Notes');
    const items = res.data?.items || [];
    const item = items.find((x: any) => x.id === id);
    if (!item) throw new NotFoundException('Catatan tidak ditemukan');
    return item;
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

  async update(id: string, data: any) {
    const res = await this.bridge.post('update', { sheet: 'Notes', id, data });
    return res.data;
  }

  async remove(id: string) {
    const res = await this.bridge.post('delete', { sheet: 'Notes', id });
    return res.data;
  }
}
