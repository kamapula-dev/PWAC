import { Module } from '@nestjs/common';
import { DomainManagementController } from './domain-management.controller';
import { DomainManagementService } from './domain-management.service';
import { DomainMappingModule } from '../domain-mapping/domain-mapping.module';

@Module({
  imports: [DomainMappingModule],
  controllers: [DomainManagementController],
  providers: [DomainManagementService],
})
export class DomainManagementModule {}
