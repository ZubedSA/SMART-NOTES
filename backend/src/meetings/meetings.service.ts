import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- MEETINGS ---
  async findAllMeetings(query: any) {
    const items = await this.prisma.meeting.findMany();
    return { items, total: items.length };
  }

  async findOneMeeting(id: string) {
    const item = await this.prisma.meeting.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Meeting tidak ditemukan');
    return item;
  }

  async createMeeting(data: any) {
    const payload = {
      title: data.title || '',
      date: data.date || '',
      time: data.time || '',
      location: data.location || '',
      moderator: data.moderator || '',
      notulen: data.notulen || '',
      status: data.status || 'Draft',
      discussion: data.discussion || '',
      decision: data.decision || '',
    };
    return this.prisma.meeting.create({
      data: payload,
    });
  }

  async updateMeeting(id: string, data: any) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.date !== undefined) payload.date = data.date;
    if (data.time !== undefined) payload.time = data.time;
    if (data.location !== undefined) payload.location = data.location;
    if (data.moderator !== undefined) payload.moderator = data.moderator;
    if (data.notulen !== undefined) payload.notulen = data.notulen;
    if (data.status !== undefined) payload.status = data.status;
    if (data.discussion !== undefined) payload.discussion = data.discussion;
    if (data.decision !== undefined) payload.decision = data.decision;

    return this.prisma.meeting.update({
      where: { id },
      data: payload,
    });
  }

  async removeMeeting(id: string) {
    // Hapus tugas tindak lanjut terkait terlebih dahulu
    await this.prisma.meetingTask.deleteMany({
      where: { meeting_id: id },
    });

    return this.prisma.meeting.delete({
      where: { id },
    });
  }

  // --- MEMBERS ---
  async findMembersByMeeting(meetingId: string) {
    const items = await this.prisma.meetingMember.findMany({
      where: { meeting_id: meetingId },
    });
    return { items, total: items.length };
  }

  async addMember(data: any) {
    return this.prisma.meetingMember.create({
      data: {
        meeting_id: data.meeting_id,
        user_id: data.user_id,
        role: data.role || 'Member',
        status: data.status || 'Hadir',
      },
    });
  }

  async updateMember(id: string, data: any) {
    const payload: any = {};
    if (data.role !== undefined) payload.role = data.role;
    if (data.status !== undefined) payload.status = data.status;

    return this.prisma.meetingMember.update({
      where: { id },
      data: payload,
    });
  }

  // --- ACTION ITEMS (MEETING TASKS) ---
  async findAllMeetingTasks(query: any) {
    const where: any = {};
    if (query?.meeting_id) {
      where.meeting_id = query.meeting_id;
    }
    const items = await this.prisma.meetingTask.findMany({ where });
    return { items, total: items.length };
  }

  async createMeetingTask(data: any) {
    const progressVal = data.progress !== undefined ? parseInt(data.progress.toString(), 10) : 0;
    const payload = {
      meeting_id: data.meeting_id,
      title: data.title || '',
      description: data.description || '',
      pic: data.pic || '',
      deadline: data.deadline || '',
      priority: data.priority || 'Medium',
      status: data.status || 'Belum',
      progress: isNaN(progressVal) ? 0 : progressVal,
    };
    return this.prisma.meetingTask.create({
      data: payload,
    });
  }

  async updateMeetingTask(id: string, data: any) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.pic !== undefined) payload.pic = data.pic;
    if (data.deadline !== undefined) payload.deadline = data.deadline;
    if (data.priority !== undefined) payload.priority = data.priority;
    if (data.status !== undefined) payload.status = data.status;
    if (data.progress !== undefined) {
      const progressVal = parseInt(data.progress.toString(), 10);
      payload.progress = isNaN(progressVal) ? 0 : progressVal;
    }

    return this.prisma.meetingTask.update({
      where: { id },
      data: payload,
    });
  }

  async removeMeetingTask(id: string) {
    return this.prisma.meetingTask.delete({
      where: { id },
    });
  }

  // --- MONITORING RAPAT DASHBOARD ---
  async getMonitoringSummary() {
    const [meetings, tasks] = await Promise.all([
      this.prisma.meeting.findMany(),
      this.prisma.meetingTask.findMany(),
    ]);

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
