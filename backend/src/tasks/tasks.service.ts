import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const items = await this.prisma.task.findMany();
    return { items, total: items.length };
  }

  async findOne(id: string) {
    const item = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Task tidak ditemukan');
    return item;
  }

  async create(data: any) {
    const payload = {
      title: data.title || '',
      category: data.category || '',
      pic: data.pic || '',
      deadline: data.deadline || '',
      priority: data.priority || 'Medium',
      status: data.status || 'Belum',
    };
    return this.prisma.task.create({
      data: payload,
    });
  }

  async update(id: string, data: any) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.category !== undefined) payload.category = data.category;
    if (data.pic !== undefined) payload.pic = data.pic;
    if (data.deadline !== undefined) payload.deadline = data.deadline;
    if (data.priority !== undefined) payload.priority = data.priority;
    if (data.status !== undefined) payload.status = data.status;

    return this.prisma.task.update({
      where: { id },
      data: payload,
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
