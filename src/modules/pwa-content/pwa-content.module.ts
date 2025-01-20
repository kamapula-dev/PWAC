import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PWAContentService } from './pwa-content.service';
import { PWAContentController } from './pwa-content.controller';
import { PWAContent, PWAContentSchema } from '../../schemas/pwa-content.scheme';
import { MediaModule } from '../media/media.module';
import { BullModule } from '@nestjs/bull';
import { BuildPWAProcessor } from './build-pwa.processor';
import { UserModule } from '../user/user.module';
import { DomainManagementModule } from '../domain-managemant/domain-management.module';
import { DomainMappingModule } from '../domain-mapping/domain-mapping.module';
import { ReadyDomainModule } from '../ready-domain/ready-domain.module';
import { PWAEventLogModule } from '../pwa-event-log/pwa-event-log.module';
import { PWAExternalMappingModule } from '../pwa-external-mapping/pwa-external-mapping.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PWAContent.name, schema: PWAContentSchema },
    ]),
    BullModule.registerQueue({
      name: 'buildPWA',
    }),
    UserModule,
    MediaModule,
    DomainManagementModule,
    DomainMappingModule,
    ReadyDomainModule,
    PWAEventLogModule,
    PWAExternalMappingModule,
  ],
  controllers: [PWAContentController],
  providers: [PWAContentService, BuildPWAProcessor],
  exports: [PWAContentService],
})
export class PWAContentModule {}
