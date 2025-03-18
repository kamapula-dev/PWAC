import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { PushModule } from '../push/push.module';
import { PWAExternalMappingModule } from '../pwa-external-mapping/pwa-external-mapping.module';

@Module({
  imports: [ScheduleModule.forRoot(), PushModule, PWAExternalMappingModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
