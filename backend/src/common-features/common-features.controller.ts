import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { CommonFeaturesService } from './common-features.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class CommonFeaturesController {
  constructor(private readonly service: CommonFeaturesService) {}

  @Get('categories')
  async getCategories() {
    const data = await this.service.getCategories();
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('categories')
  async createCategory(@Body() body: any) {
    const data = await this.service.createCategory(body);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const data = await this.service.updateCategory(id, body);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    const data = await this.service.deleteCategory(id);
    return { success: true, data };
  }

  @Get('labels')
  async getLabels() {
    const data = await this.service.getLabels();
    return { success: true, data };
  }

  @Get('users')
  async getUsers() {
    const data = await this.service.getUsers();
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('users')
  async createUser(@Body() body: any) {
    const data = await this.service.createUser(body);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    const data = await this.service.updateUser(id, body);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    const data = await this.service.deleteUser(id);
    return { success: true, data };
  }

  @Get('search')
  async search(@Query('q') query: string) {
    const data = await this.service.globalSearch(query);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  async upload(@Body() body: { base64Data: string; fileName: string; mimeType: string }) {
    const data = await this.service.uploadFile(body.base64Data, body.fileName, body.mimeType);
    return { success: true, message: 'File diupload', data };
  }

  @Get('report')
  async getReport() {
    const data = await this.service.getReportsSummary();
    return { success: true, data };
  }

  @Get('logs')
  async getLogs() {
    const data = await this.service.getLogs();
    return { success: true, data };
  }

  @Get('settings')
  async getSettings() {
    const data = await this.service.getSettings();
    return { success: true, data };
  }
}
