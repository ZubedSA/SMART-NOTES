import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CommonFeaturesService {
  private readonly logger = new Logger(CommonFeaturesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --- CATEGORIES ---
  async getCategories() {
    return this.prisma.category.findMany();
  }

  async createCategory(data: any) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
      },
    });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
      },
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  // --- LABELS ---
  async getLabels() {
    return this.prisma.label.findMany();
  }

  // --- USERS ---
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  async createUser(data: any) {
    // Hash password default atau password input menggunakan bcrypt
    const rawPassword = data.password || 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role || 'Viewer',
        phone: data.phone || '',
        password: hashedPassword,
      },
    });
  }

  async updateUser(id: string, data: any) {
    const payload: any = { ...data };
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }
    if (payload.email) {
      payload.email = payload.email.toLowerCase();
    }
    return this.prisma.user.update({
      where: { id },
      data: payload,
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // --- REALTIME SEARCH ---
  async globalSearch(query: string) {
    if (!query) return { notes: [], meetings: [], tasks: [], agenda: [] };
    const q = query.toLowerCase();

    const [notes, meetings, tasks, agenda] = await Promise.all([
      this.prisma.note.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
      this.prisma.meeting.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { discussion: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
      this.prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { pic: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
      this.prisma.agenda.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return { notes, meetings, tasks, agenda };
  }

  // --- UPLOAD TO LOCAL STORAGE ---
  async uploadFile(base64Data: string, fileName: string, mimeType: string) {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const base64Clean = base64Data.replace(/^data:.*;base64,/, '');
      const buffer = Buffer.from(base64Clean, 'base64');
      const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);

      const port = process.env.PORT || 3001;
      return {
        url: `http://localhost:${port}/uploads/${uniqueFileName}`,
        fileName: uniqueFileName,
      };
    } catch (e: any) {
      this.logger.error(`Gagal upload file secara lokal: ${e.message}`);
      return { url: 'https://drive.google.com/mock-file-url', fileName };
    }
  }

  // --- REPORTS ---
  async getReportsSummary() {
    const [notesCount, meetingsCount, tasksCount] = await Promise.all([
      this.prisma.note.count(),
      this.prisma.meeting.count(),
      this.prisma.task.count(),
    ]);

    return {
      notesCount,
      meetingsCount,
      tasksCount,
      generatedAt: new Date().toISOString(),
    };
  }

  // --- LOGS ---
  async getLogs() {
    return this.prisma.log.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  // --- SETTINGS ---
  async getSettings() {
    return this.prisma.setting.findMany();
  }
}
