import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PWAExternalMapping,
  PWAExternalMappingSchema,
} from '../../schemas/pwa-external-mapping.scheme';
import { PWAExternalMappingService } from './pwa-external-mapping.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PWAExternalMapping.name, schema: PWAExternalMappingSchema },
    ]),
  ],
  providers: [PWAExternalMappingService],
  exports: [PWAExternalMappingService],
})
export class PWAExternalMappingModule {}
