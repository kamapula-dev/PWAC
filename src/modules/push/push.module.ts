import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { Push, PushSchema } from '../../schemas/push.schema';
import { FirebaseModule } from '../firebase/firebase.module';
import { PWAEventLogModule } from '../pwa-event-log/pwa-event-log.module';
import { PWAExternalMappingModule } from '../pwa-external-mapping/pwa-external-mapping.module';
import { BullModule } from '@nestjs/bull';
import { PushQueueProcessor } from './push-queue.processor';
import { PWAContentModule } from '../pwa-content/pwa-content.module';
import { ChatGptModule } from '../chat-gpt/chat-gpt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Push.name, schema: PushSchema }]),
    BullModule.registerQueue({ name: 'pushQueue' }),
    FirebaseModule,
    forwardRef(() => PWAEventLogModule),
    PWAExternalMappingModule,
    ChatGptModule,
    forwardRef(() => PWAContentModule),
  ],
  controllers: [PushController],
  providers: [PushService, PushQueueProcessor],
  exports: [MongooseModule, PushService],
})
export class PushModule {}
