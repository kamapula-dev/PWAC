import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomainMapping, DomainMappingSchema } from './domain-mapping.schema';
import { DomainMappingService } from './domain-mapping.service';
import { DomainMappingController } from './domain-mapping.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: DomainMapping.name, schema: DomainMappingSchema }])],
    providers: [DomainMappingService],
    controllers: [DomainMappingController],
    exports: [DomainMappingService],
})
export class DomainMappingModule {}
