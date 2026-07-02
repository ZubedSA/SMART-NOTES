import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  // --- AGENDA ---
  @Get('agenda')
  async getAgenda(@Query() query: any) {
    const data = await this.agendaService.findAllAgenda(query);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Post('agenda')
  async createAgenda(@Body() body: any) {
    const data = await this.agendaService.createAgenda(body);
    return { success: true, message: 'Agenda dibuat', data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Put('agenda/:id')
  async updateAgenda(@Param('id') id: string, @Body() body: any) {
    const data = await this.agendaService.updateAgenda(id, body);
    return { success: true, message: 'Agenda diperbarui', data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Delete('agenda/:id')
  async deleteAgenda(@Param('id') id: string) {
    await this.agendaService.removeAgenda(id);
    return { success: true, message: 'Agenda dihapus' };
  }

  // --- CALENDAR ---
  @Get('calendar')
  async getCalendar(@Query('month') month: string, @Query('year') year: string) {
    const data = await this.agendaService.getCalendarEvents(month, year);
    return { success: true, data };
  }
}
