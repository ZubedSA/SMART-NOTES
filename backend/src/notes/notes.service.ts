import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  private parseBool(val: any): boolean {
    if (val === undefined || val === null) return false;
    return val === true || val === 'true';
  }

  async findAll(query: any, userId?: string, roleName?: string) {
    let notes: any[] = [];

    // Filter catatan: Setiap pengguna hanya bisa melihat catatan miliknya sendiri
    // KECUALI jika untuk kebutuhan mengambil draf catatan rapat (query.meetingDrafts === 'true')
    if (query?.meetingDrafts === 'true') {
      notes = await this.prisma.note.findMany({
        where: {
          is_meeting_draft: true,
        },
      });
    } else if (userId) {
      notes = await this.prisma.note.findMany({
        where: {
          created_by: userId,
        },
      });
    } else {
      notes = await this.prisma.note.findMany();
    }

    const users = await this.prisma.user.findMany({
      select: { id: true, name: true },
    });

    const notesWithUser = notes.map((note) => {
      const creator = users.find((u) => u.id === note.created_by);
      return {
        ...note,
        created_by_name: creator ? creator.name : 'Administrator',
      };
    });

    return { items: notesWithUser, total: notesWithUser.length };
  }

  async findOne(id: string, userId?: string, roleName?: string) {
    const item = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!item) throw new NotFoundException('Catatan tidak ditemukan');

    // Cegah akses jika bukan pemilik (berlaku untuk semua pengguna)
    if (userId && item.created_by !== userId) {
      throw new NotFoundException('Catatan tidak ditemukan');
    }

    const creator = await this.prisma.user.findUnique({
      where: { id: item.created_by },
      select: { name: true },
    });

    return {
      ...item,
      created_by_name: creator ? creator.name : 'Administrator',
    };
  }

  async create(data: any, userId: string) {
    const payload = {
      title: data.title || '',
      category: data.category || 'Catatan Pribadi',
      content: data.content || '',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      priority: data.priority || 'Medium',
      status: data.status || 'Published',
      is_favorite: this.parseBool(data.is_favorite),
      is_archived: this.parseBool(data.is_archived),
      is_meeting_draft: this.parseBool(data.is_meeting_draft),
      created_by: userId || 'USR-1',
    };

    return this.prisma.note.create({
      data: payload,
    });
  }

  async update(id: string, data: any, userId: string) {
    // Verifikasi kepemilikan terlebih dahulu
    await this.findOne(id, userId);

    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.category !== undefined) payload.category = data.category;
    if (data.content !== undefined) payload.content = data.content;
    if (data.date !== undefined) payload.date = data.date;
    if (data.time !== undefined) payload.time = data.time;
    if (data.priority !== undefined) payload.priority = data.priority;
    if (data.status !== undefined) payload.status = data.status;
    if (data.is_favorite !== undefined) payload.is_favorite = this.parseBool(data.is_favorite);
    if (data.is_archived !== undefined) payload.is_archived = this.parseBool(data.is_archived);
    if (data.is_meeting_draft !== undefined) payload.is_meeting_draft = this.parseBool(data.is_meeting_draft);

    return this.prisma.note.update({
      where: { id },
      data: payload,
    });
  }

  async remove(id: string, userId: string) {
    // Verifikasi kepemilikan terlebih dahulu
    await this.findOne(id, userId);

    return this.prisma.note.delete({
      where: { id },
    });
  }
}
