import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotesService } from './notes.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Query() query: any, @Request() req: any) {
    const userId = req.user?.userId;
    const roleName = req.user?.roleName;
    const data = await this.notesService.findAll(query, userId, roleName);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId;
    const roleName = req.user?.roleName;
    const data = await this.notesService.findOne(id, userId, roleName);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager', 'Staff')
  @Post()
  async create(@Body() body: any, @Request() req: any) {
    const userId = req.user?.userId;
    const data = await this.notesService.create(body, userId);
    return { success: true, message: 'Catatan berhasil dibuat', data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager', 'Staff')
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const userId = req.user?.userId;
    const data = await this.notesService.update(id, body, userId);
    return { success: true, message: 'Catatan berhasil diperbarui', data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager', 'Staff')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId;
    await this.notesService.remove(id, userId);
    return { success: true, message: 'Catatan berhasil dihapus' };
  }
}
