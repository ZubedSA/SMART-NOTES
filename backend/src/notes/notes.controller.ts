import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotesService } from './notes.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  async findAll(@Query() query: any) {
    const data = await this.notesService.findAll(query);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.notesService.findOne(id);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() body: any, @Request() req: any) {
    const userId = req.user?.userId;
    const data = await this.notesService.create(body, userId);
    return { success: true, message: 'Catatan berhasil dibuat', data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.notesService.update(id, body);
    return { success: true, message: 'Catatan berhasil diperbarui', data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.notesService.remove(id);
    return { success: true, message: 'Catatan berhasil dihapus' };
  }
}
