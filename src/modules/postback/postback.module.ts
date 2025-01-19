import { Module } from '@nestjs/common';
import { PostbackController } from './postback.controller';
import { PWAExternalMappingModule } from '../pwa-external-mapping/pwa-external-mapping.module';
import { PWAEventLogModule } from '../pwa-event-log/pwa-event-log.module';
import { PWAContentModule } from '../pwa-content/pwa-content.module';
import { FacebookModule } from '../facebook/facebook.module';

@Module({
  imports: [
    PWAExternalMappingModule,
    PWAEventLogModule,
    PWAContentModule,
    FacebookModule,
  ],
  controllers: [PostbackController],
  providers: [],
})
export class PostbackModule {}
