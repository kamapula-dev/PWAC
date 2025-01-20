import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PWAEventLog,
  PWAEventLogSchema,
} from '../../schemas/pwa-event-log.scheme';
import { PWAEventLogService } from './pwa-event-log.service';
import { PWAEventLogController } from './pwa-event-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PWAEventLog.name, schema: PWAEventLogSchema },
    ]),
  ],
  controllers: [PWAEventLogController],
  providers: [PWAEventLogService],
  exports: [PWAEventLogService],
})
export class PWAEventLogModule {}
