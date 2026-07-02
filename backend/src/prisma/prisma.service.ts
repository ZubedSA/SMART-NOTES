import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    await this.seed();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async seed() {
    try {
      this.logger.log('Memulai seeding database...');

      // Seed Admin User
      const adminEmail = 'admin@gmail.com';
      const adminUser = await this.user.findUnique({ where: { email: adminEmail } });
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await this.user.create({
          data: {
            id: 'ID-1782579785206-698', // ID konsisten dengan database spreadsheet legacy
            email: adminEmail,
            name: 'Admin',
            role: 'Admin',
            password: hashedPassword,
            phone: '081234567890',
          },
        });
        this.logger.log('Seeded Admin User: admin@gmail.com / admin123');
      }

      // Seed Kategori Default
      const defaultCategories = [
        { name: 'Catatan Pribadi', color: '#10B981' },
        { name: 'Catatan Meeting', color: '#3B82F6' },
        { name: 'Catatan Agenda', color: '#F59E0B' },
        { name: 'Catatan Organisasi', color: '#8B5CF6' },
        { name: 'Catatan Pondok', color: '#14532D' },
        { name: 'Catatan Hafalan', color: '#EC4899' },
        { name: 'Catatan Project', color: '#06B6D4' },
      ];
      for (const cat of defaultCategories) {
        await this.category.upsert({
          where: { name: cat.name },
          update: {},
          create: { name: cat.name, color: cat.color },
        });
      }

      // Seed Label Default
      const defaultLabels = [
        { name: 'Urgent', color: '#EF4444' },
        { name: 'Penting', color: '#F59E0B' },
        { name: 'Ide', color: '#10B981' },
      ];
      for (const lbl of defaultLabels) {
        await this.label.upsert({
          where: { name: lbl.name },
          update: {},
          create: { name: lbl.name, color: lbl.color },
        });
      }

      // Seed Pengaturan Default
      const defaultSettings = [
        { key: 'app_name', value: 'Smart Notes Management System' },
        { key: 'primary_color', value: '#14532D' },
        { key: 'accent_color', value: '#16A34A' },
      ];
      for (const set of defaultSettings) {
        await this.setting.upsert({
          where: { key: set.key },
          update: {},
          create: { key: set.key, value: set.value },
        });
      }

      this.logger.log('Database seeding selesai dengan sukses!');
    } catch (error) {
      this.logger.error('Error saat seeding database:', error);
    }
  }
}
