import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('task')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Query() query: any) {
    const data = await this.tasksService.findAll(query);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.tasksService.findOne(id);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Post()
  async create(@Body() body: any) {
    const data = await this.tasksService.create(body);
    return { success: true, message: 'Task berhasil dibuat', data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.tasksService.update(id, body);
    return { success: true, message: 'Task diperbarui', data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tasksService.remove(id);
    return { success: true, message: 'Task dihapus' };
  }
}
