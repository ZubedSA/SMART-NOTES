import { Injectable, NotFoundException } from '@nestjs/common';
import { GoogleBridgeService } from '../google-bridge/google-bridge.service';

@Injectable()
export class MeetingsService {
  constructor(private readonly bridge: GoogleBridgeService) {}

  // --- MEETINGS ---
  async findAllMeetings(query: any) {
    const res = await this.bridge.get('Meetings', query);
    return res.data;
  }

  async findOneMeeting(id: string) {
    const res = await this.bridge.get('Meetings');
    const item = (res.data?.items || []).find((x: any) => x.id === id);
    if (!item) throw new NotFoundException('Meeting tidak ditemukan');
    return item;
  }

  async createMeeting(data: any) {
    const payload = { ...data, status: data.status || 'Draft' };
    const res = await this.bridge.post('insert', { sheet: 'Meetings', data: payload });
    return res.data;
  }

  async updateMeeting(id: string, data: any) {
    const res = await this.bridge.post('update', { sheet: 'Meetings', id, data });
    return res.data;
  }

  async removeMeeting(id: string) {
    return this.bridge.post('delete', { sheet: 'Meetings', id });
  }

  // --- MEMBERS ---
  async findMembersByMeeting(meetingId: string) {
    const res = await this.bridge.get('MeetingMembers', { filterKey: 'meeting_id', filterValue: meetingId });
    return res.data;
  }

  async addMember(data: any) {
    const res = await this.bridge.post('insert', { sheet: 'MeetingMembers', data });
    return res.data;
  }

  async updateMember(id: string, data: any) {
    const res = await this.bridge.post('update', { sheet: 'MeetingMembers', id, data });
    return res.data;
  }

  // --- ACTION ITEMS (MEETING TASKS) ---
  async findAllMeetingTasks(query: any) {
    const res = await this.bridge.get('MeetingTasks', query);
    return res.data;
  }

  async createMeetingTask(data: any) {
    const payload = { ...data, status: data.status || 'Belum', progress: data.progress || 0 };
    const res = await this.bridge.post('insert', { sheet: 'MeetingTasks', data: payload });
    return res.data;
  }

  async updateMeetingTask(id: string, data: any) {
    const res = await this.bridge.post('update', { sheet: 'MeetingTasks', id, data });
    return res.data;
  }

  async removeMeetingTask(id: string) {
    return this.bridge.post('delete', { sheet: 'MeetingTasks', id });
  }

  // --- MONITORING RAPAT DASHBOARD ---
  async getMonitoringSummary() {
    const [mtgRes, taskRes] = await Promise.all([
      this.bridge.get('Meetings'),
      this.bridge.get('MeetingTasks'),
    ]);
    const meetings = mtgRes.data?.items || [];
    const tasks = taskRes.data?.items || [];

    const totalMeeting = meetings.length;
    const totalAction = tasks.length;
    const belum = tasks.filter((t: any) => t.status === 'Belum').length;
    const selesai = tasks.filter((t: any) => t.status === 'Selesai').length;
    const proses = tasks.filter((t: any) => t.status === 'Proses' || t.status === 'Sedang Dikerjakan').length;
    const overdue = tasks.filter((t: any) => t.status === 'Overdue').length;
    const persentase = totalAction > 0 ? Math.round((selesai / totalAction) * 100) : 0;

    return {
      totalMeeting,
      totalAction,
      progress: persentase,
      statusBreakdown: { belum, selesai, proses, overdue },
      recentActionItems: tasks.slice(-5).reverse(),
    };
  }
}
