import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { MissionsModule } from '../modules/missions/missions.module';

@Module({
  imports: [MissionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
