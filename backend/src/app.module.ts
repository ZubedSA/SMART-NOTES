import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotesModule } from './notes/notes.module';
import { MeetingsModule } from './meetings/meetings.module';
import { TasksModule } from './tasks/tasks.module';
import { AgendaModule } from './agenda/agenda.module';
import { CommonFeaturesModule } from './common-features/common-features.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    NotesModule,
    MeetingsModule,
    TasksModule,
    AgendaModule,
    CommonFeaturesModule,
  ],
})
export class AppModule {}
