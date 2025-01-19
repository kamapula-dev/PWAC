import { Module } from '@nestjs/common';
import { DomainManagementController } from './domain-management.controller';
import { DomainManagementService } from './domain-management.service';
import { DomainMappingModule } from '../domain-mapping/domain-mapping.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DomainMappingModule, UserModule],
  controllers: [DomainManagementController],
  providers: [DomainManagementService],
  exports: [DomainManagementService],
})
export class DomainManagementModule {}
