import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary() {
    const [notes, meetings, tasks, agenda] = await Promise.all([
      this.prisma.note.findMany(),
      this.prisma.meeting.findMany(),
      this.prisma.meetingTask.findMany(),
      this.prisma.agenda.findMany(),
    ]);

    const totalNotes = notes.length;
    const totalMeetings = meetings.length;
    const totalAgenda = agenda.length;
    const totalTasks = tasks.length;

    const taskCompleted = tasks.filter((t: any) => t.status === 'Selesai').length;
    const taskPending = totalTasks - taskCompleted;
    const progress = totalTasks > 0 ? Math.round((taskCompleted / totalTasks) * 100) : 0;

    // Filter today (atau mock latest 3)
    const todayAgenda = agenda.slice(0, 3);
    const todayMeetings = meetings.slice(0, 3);
    const recentNotes = notes.slice(-3).reverse();
    const deadlineTasks = tasks.filter((t: any) => t.status !== 'Selesai').slice(0, 4);

    return {
      stats: {
        totalNotes,
        totalAgenda,
        totalMeetings,
        totalTasks,
        taskCompleted,
        taskPending,
        progress,
      },
      activityChart: [
        { name: 'Sen', notes: 4, meetings: 1, tasks: 3 },
        { name: 'Sel', notes: 6, meetings: 2, tasks: 5 },
        { name: 'Rab', notes: 8, meetings: 3, tasks: 4 },
        { name: 'Kam', notes: 5, meetings: 1, tasks: 7 },
        { name: 'Jum', notes: 9, meetings: 4, tasks: 8 },
        { name: 'Sab', notes: 3, meetings: 0, tasks: 2 },
        { name: 'Min', notes: 2, meetings: 0, tasks: 1 },
      ],
      todayAgenda,
      todayMeetings,
      recentNotes,
      deadlineTasks,
    };
  }
}
