import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { CommonFeaturesService } from './common-features.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class CommonFeaturesController {
  constructor(private readonly service: CommonFeaturesService) {}

  @Get('categories')
  async getCategories() {
    const data = await this.service.getCategories();
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Post('categories')
  async createCategory(@Body() body: any) {
    const data = await this.service.createCategory(body);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const data = await this.service.updateCategory(id, body);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Post('users')
  async createUser(@Body() body: any) {
    try {
      const data = await this.service.createUser(body);
      return { success: true, data };
    } catch (error: any) {
      this.logControllerError('POST /users', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    try {
      const data = await this.service.updateUser(id, body);
      return { success: true, data };
    } catch (error: any) {
      this.logControllerError(`PUT /users/${id}`, error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    try {
      const data = await this.service.deleteUser(id);
      return { success: true, data };
    } catch (error: any) {
      this.logControllerError(`DELETE /users/${id}`, error);
      throw error;
    }
  }

  private logControllerError(endpoint: string, error: any) {
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(process.cwd(), 'backend-errors.log');
      const timestamp = new Date().toISOString();
      const message = `[${timestamp}] Controller ${endpoint} Error: ${error.message} | Status: ${error.status || 500} | Stack: ${error.stack}\n`;
      fs.appendFileSync(logPath, message);
    } catch (e) {
      // ignore
    }
  }

  @Get('search')
  async search(@Query('q') query: string) {
    const data = await this.service.globalSearch(query);
    return { success: true, data };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Manager')
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
