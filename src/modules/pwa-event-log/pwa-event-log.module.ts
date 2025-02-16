import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PWAEventLog,
  PWAEventLogSchema,
} from '../../schemas/pwa-event-log.scheme';
import { PWAEventLogService } from './pwa-event-log.service';
import { PWAEventLogController } from './pwa-event-log.controller';
import { PushModule } from '../push/push.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PWAEventLog.name, schema: PWAEventLogSchema },
    ]),
    forwardRef(() => PushModule),
  ],
  controllers: [PWAEventLogController],
  providers: [PWAEventLogService],
  exports: [MongooseModule, PWAEventLogService],
})
export class PWAEventLogModule {}
