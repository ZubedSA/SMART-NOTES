import { Injectable, NotFoundException } from '@nestjs/common';
import { GoogleBridgeService } from '../google-bridge/google-bridge.service';

@Injectable()
export class TasksService {
  constructor(private readonly bridge: GoogleBridgeService) {}

  async findAll(query: any) {
    const res = await this.bridge.get('Tasks', query);
    return res.data;
  }

  async findOne(id: string) {
    const res = await this.bridge.get('Tasks');
    const item = (res.data?.items || []).find((x: any) => x.id === id);
    if (!item) throw new NotFoundException('Task tidak ditemukan');
    return item;
  }

  async create(data: any) {
    const payload = {
      ...data,
      status: data.status || 'Belum',
      priority: data.priority || 'Medium',
    };
    const res = await this.bridge.post('insert', { sheet: 'Tasks', data: payload });
    return res.data;
  }

  async update(id: string, data: any) {
    const res = await this.bridge.post('update', { sheet: 'Tasks', id, data });
    return res.data;
  }

  async remove(id: string) {
    return this.bridge.post('delete', { sheet: 'Tasks', id });
  }
}
