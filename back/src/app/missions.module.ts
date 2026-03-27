import { Module } from '@nestjs/common';
import { MissionsController } from '../controllers/missions.controller';
import { MissionsService } from '../services/missions.service';

@Module({
  controllers: [MissionsController],
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}
