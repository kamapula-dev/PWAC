import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReadyDomainController } from './ready-domain.controller';
import { ReadyDomainService } from './ready-domain.service';
import {
  ReadyDomain,
  ReadyDomainScheme,
} from '../../schemas/ready-domain.scheme';
import { DomainMappingModule } from '../domain-mapping/domain-mapping.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReadyDomain.name, schema: ReadyDomainScheme },
    ]),
    DomainMappingModule,
    UserModule,
  ],
  controllers: [ReadyDomainController],
  providers: [ReadyDomainService],
})
export class ReadyDomainModule {}
