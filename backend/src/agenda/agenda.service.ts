import { Injectable } from '@nestjs/common';
import { GoogleBridgeService } from '../google-bridge/google-bridge.service';

@Injectable()
export class AgendaService {
  constructor(private readonly bridge: GoogleBridgeService) {}

  async findAllAgenda(query: any) {
    const res = await this.bridge.get('Agenda', query);
    return res.data;
  }

  async createAgenda(data: any) {
    const res = await this.bridge.post('insert', { sheet: 'Agenda', data });
    return res.data;
  }

  async updateAgenda(id: string, data: any) {
    const res = await this.bridge.post('update', { sheet: 'Agenda', id, data });
    return res.data;
  }

  async removeAgenda(id: string) {
    return this.bridge.post('delete', { sheet: 'Agenda', id });
  }

  /**
   * Calendar aggregation endpoint
   */
  async getCalendarEvents(month?: string, year?: string) {
    const [agdRes, mtgRes, tskRes] = await Promise.all([
      this.bridge.get('Agenda'),
      this.bridge.get('Meetings'),
      this.bridge.get('Tasks'),
    ]);

    const agenda = (agdRes.data?.items || []).map((x: any) => ({
      id: x.id,
      title: x.title,
      date: x.date,
      time: x.time,
      type: 'agenda',
      color: '#16A34A', // Green
      location: x.location,
    }));

    const meetings = (mtgRes.data?.items || []).map((x: any) => ({
      id: x.id,
      title: `[Meeting] ${x.title}`,
      date: x.date,
      time: x.time,
      type: 'meeting',
      color: '#3B82F6', // Blue
      location: x.location,
    }));

    const tasks = (tskRes.data?.items || []).map((x: any) => ({
      id: x.id,
      title: `[Task] ${x.title}`,
      date: x.deadline,
      time: '23:59',
      type: 'task',
      color: '#F59E0B', // Orange/Amber
      priority: x.priority,
    }));

    const allEvents = [...agenda, ...meetings, ...tasks];
    return allEvents;
  }
}
