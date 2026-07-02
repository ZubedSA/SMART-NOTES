import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  // --- MEETINGS ---
  @Get('meeting')
  async getMeetings(@Query() query: any) {
    const data = await this.meetingsService.findAllMeetings(query);
    return { success: true, data };
  }

  @Get('meeting/:id')
  async getMeeting(@Param('id') id: string) {
    const data = await this.meetingsService.findOneMeeting(id);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Post('meeting')
  async createMeeting(@Body() body: any) {
    const data = await this.meetingsService.createMeeting(body);
    return { success: true, message: 'Meeting berhasil dibuat', data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Put('meeting/:id')
  async updateMeeting(@Param('id') id: string, @Body() body: any) {
    const data = await this.meetingsService.updateMeeting(id, body);
    return { success: true, message: 'Meeting berhasil diperbarui', data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Delete('meeting/:id')
  async deleteMeeting(@Param('id') id: string) {
    await this.meetingsService.removeMeeting(id);
    return { success: true, message: 'Meeting berhasil dihapus' };
  }

  // --- MEMBERS ---
  @Get('meeting-members')
  async getMembers(@Query('meeting_id') meetingId: string) {
    const data = await this.meetingsService.findMembersByMeeting(meetingId);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Post('meeting-members')
  async addMember(@Body() body: any) {
    const data = await this.meetingsService.addMember(body);
    return { success: true, message: 'Peserta berhasil ditambahkan', data };
  }

  // --- ACTION ITEMS / TASKS ---
  @Get('meeting-task')
  async getMeetingTasks(@Query() query: any) {
    const data = await this.meetingsService.findAllMeetingTasks(query);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Post('meeting-task')
  async createMeetingTask(@Body() body: any) {
    const data = await this.meetingsService.createMeetingTask(body);
    return { success: true, message: 'Action item berhasil dibuat', data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Put('meeting-task/:id')
  async updateMeetingTask(@Param('id') id: string, @Body() body: any) {
    const data = await this.meetingsService.updateMeetingTask(id, body);
    return { success: true, message: 'Action item diperbarui', data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Delete('meeting-task/:id')
  async deleteMeetingTask(@Param('id') id: string) {
    await this.meetingsService.removeMeetingTask(id);
    return { success: true, message: 'Action item berhasil dihapus' };
  }

  // --- MONITORING ---
  @Get('meeting/monitoring/summary')
  async getMonitoring() {
    const data = await this.meetingsService.getMonitoringSummary();
    return { success: true, data };
  }
}
