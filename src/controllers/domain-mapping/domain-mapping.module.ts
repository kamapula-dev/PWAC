import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomainMappingService } from './domain-mapping.service';
import { DomainMappingController } from './domain-mapping.controller';
import {
  DomainMapping,
  DomainMappingSchema,
} from 'src/schemas/domain-mapping.scheme';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DomainMapping.name, schema: DomainMappingSchema },
    ]),
  ],
  providers: [DomainMappingService],
  controllers: [DomainMappingController],
  exports: [DomainMappingService],
})
export class DomainMappingModule {}
