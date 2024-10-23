import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PWAContentService } from './pwa-content.service';
import { PWAContentController } from './pwa-content.controller';
import { PWAContent, PWAContentSchema } from '../../schemas/pwa-content.scheme';
import { MediaModule } from '../media/media.module';
import { UserModule } from '../user/user.module';
import { BullModule } from '@nestjs/bull';
import { BuildPWAProcessor } from './build-pwa.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PWAContent.name, schema: PWAContentSchema },
    ]),
    BullModule.registerQueue({
      name: 'buildPWA',
    }),
    MediaModule,
    UserModule,
  ],
  controllers: [PWAContentController],
  providers: [PWAContentService, BuildPWAProcessor],
})
export class PWAContentModule {}
