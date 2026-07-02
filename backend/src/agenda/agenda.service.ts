import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllAgenda(query: any) {
    const items = await this.prisma.agenda.findMany();
    return { items, total: items.length };
  }

  async createAgenda(data: any) {
    const payload = {
      title: data.title || '',
      date: data.date || '',
      time: data.time || '',
      location: data.location || '',
      category: data.category || 'Internal',
      status: data.status || 'Terjadwal',
    };
    return this.prisma.agenda.create({
      data: payload,
    });
  }

  async updateAgenda(id: string, data: any) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.date !== undefined) payload.date = data.date;
    if (data.time !== undefined) payload.time = data.time;
    if (data.location !== undefined) payload.location = data.location;
    if (data.category !== undefined) payload.category = data.category;
    if (data.status !== undefined) payload.status = data.status;

    return this.prisma.agenda.update({
      where: { id },
      data: payload,
    });
  }

  async removeAgenda(id: string) {
    return this.prisma.agenda.delete({
      where: { id },
    });
  }

  /**
   * Calendar aggregation endpoint
   */
  async getCalendarEvents(month?: string, year?: string) {
    const [agdItems, mtgItems, taskItems] = await Promise.all([
      this.prisma.agenda.findMany(),
      this.prisma.meeting.findMany(),
      this.prisma.task.findMany(),
    ]);

    const agenda = agdItems.map((x: any) => ({
      id: x.id,
      title: x.title,
      date: x.date,
      time: x.time,
      type: 'agenda',
      color: '#16A34A', // Green
      location: x.location,
    }));

    const meetings = mtgItems.map((x: any) => ({
      id: x.id,
      title: `[Meeting] ${x.title}`,
      date: x.date,
      time: x.time,
      type: 'meeting',
      color: '#3B82F6', // Blue
      location: x.location,
    }));

    const tasks = taskItems.map((x: any) => ({
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
