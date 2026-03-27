import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { MissionsService } from './missions.service';
import type { CreateQuestDto, UpdateQuestDto } from './missions.interface';
import { auth } from '../../config/firebase';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  private async resolveUserId(request: Request): Promise<string> {
    const authorization = request.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      const idToken = authorization.slice('Bearer '.length).trim();
      if (idToken) {
        try {
          const decodedToken = await auth.verifyIdToken(idToken);
          return decodedToken.uid;
        } catch (error) {
          console.warn('Invalid Firebase token on missions route:', error);
        }
      }
    }

    const headerUserId = request.headers['x-user-id'];
    if (typeof headerUserId === 'string' && headerUserId.trim()) {
      return headerUserId.trim();
    }

    if (Array.isArray(headerUserId)) {
      const firstUserId = headerUserId.find((value) => value.trim());
      if (firstUserId) {
        return firstUserId.trim();
      }
    }

    return 'guest';
  }

  @Get()
  async findAll(@Query('rotationId') rotationId?: string, @Req() request?: Request) {
    const userId = await this.resolveUserId(request as Request);
    if (rotationId) {
      return this.missionsService.findByRotation(rotationId, userId);
    }
    return this.missionsService.findAll(userId);
  }

  @Get('current')
  async findCurrent(@Req() request: Request) {
    const userId = await this.resolveUserId(request);
    const rotationId = this.missionsService.getCurrentRotationId();
    return {
      rotationId,
      missions: await this.missionsService.findByRotation(rotationId, userId),
    };
  }

  @Get('achievements')
  async getAchievements(@Req() request: Request) {
    const userId = await this.resolveUserId(request);
    return this.missionsService.getAchievements(userId);
  }

  @Post('seed')
  async seedMissions(@Req() request: Request) {
    const userId = await this.resolveUserId(request);
    return this.missionsService.seedAllMissions(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: Request) {
    const userId = await this.resolveUserId(request);
    return this.missionsService.findOne(id, userId);
  }

  @Post()
  async create(@Body() dto: CreateQuestDto, @Req() request: Request) {
    const userId = await this.resolveUserId(request);
    const rotationId = this.missionsService.getCurrentRotationId();
    return this.missionsService.create(dto, rotationId, userId);
  }

  @Post(':id/complete')
  async completeMission(@Param('id') id: string, @Req() request: Request) {
    const userId = await this.resolveUserId(request);
    return this.missionsService.completeMission(id, userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateQuestDto, @Req() request: Request) {
    const userId = await this.resolveUserId(request);
    return this.missionsService.update(id, dto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() request: Request) {
    const userId = await this.resolveUserId(request);
    const success = await this.missionsService.delete(id, userId);
    return { success };
  }
}
