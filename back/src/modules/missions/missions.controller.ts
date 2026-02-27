import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MissionsService } from './missions.service';
import type { CreateQuestDto, UpdateQuestDto } from './missions.interface';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  async findAll(@Query('rotationId') rotationId?: string) {
    if (rotationId) {
      return this.missionsService.findByRotation(rotationId);
    }
    return this.missionsService.findAll();
  }

  @Get('current')
  async findCurrent() {
    const rotationId = this.missionsService.getCurrentRotationId();
    return {
      rotationId,
      missions: await this.missionsService.findByRotation(rotationId),
    };
  }

  @Get('achievements')
  async getAchievements() {
    return this.missionsService.getAchievements();
  }

  @Post('seed')
  async seedMissions() {
    return this.missionsService.seedAllMissions();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.missionsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateQuestDto) {
    const rotationId = this.missionsService.getCurrentRotationId();
    return this.missionsService.create(dto, rotationId);
  }

  @Post(':id/complete')
  async completeMission(@Param('id') id: string) {
    return this.missionsService.completeMission(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateQuestDto) {
    return this.missionsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const success = await this.missionsService.delete(id);
    return { success };
  }
}
