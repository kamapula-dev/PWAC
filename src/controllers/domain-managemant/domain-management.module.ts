import { Module } from '@nestjs/common';
import { DomainManagementController } from './domain-management.controller';
import { DomainManagementService } from './domain-management.service';

@Module({
    controllers: [DomainManagementController],
    providers: [DomainManagementService],
})
export class DomainManagementModule {}
