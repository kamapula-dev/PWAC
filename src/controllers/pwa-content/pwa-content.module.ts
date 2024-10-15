import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PWAContentService } from './pwa-content.service';
import { PWAContentController } from './pwa-content.controller';
import { PWAContent, PWAContentSchema } from '../../schemas/pwa-content.scheme';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PWAContent.name, schema: PWAContentSchema },
    ]),
  ],
  controllers: [PWAContentController],
  providers: [PWAContentService],
})
export class PWAContentModule {}
