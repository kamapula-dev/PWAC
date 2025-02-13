import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { Push, PushSchema } from '../../schemas/push.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Push.name, schema: PushSchema }]),
  ],
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
