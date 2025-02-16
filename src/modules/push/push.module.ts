import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { Push, PushSchema } from '../../schemas/push.schema';
import { FirebaseModule } from '../firebase/firebase.module';
import { PWAEventLogModule } from '../pwa-event-log/pwa-event-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Push.name, schema: PushSchema }]),
    FirebaseModule,
  ],
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
