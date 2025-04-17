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
import {
  DomainMapping,
  DomainMappingSchema,
} from '../../schemas/domain-mapping.scheme';
import { PWAContent, PWAContentSchema } from '../../schemas/pwa-content.scheme';
import { User, UserSchema } from '../../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReadyDomain.name, schema: ReadyDomainScheme },
      { name: User.name, schema: UserSchema },
      { name: PWAContent.name, schema: PWAContentSchema },
      { name: DomainMapping.name, schema: DomainMappingSchema },
    ]),
    DomainMappingModule,
    UserModule,
  ],
  controllers: [ReadyDomainController],
  providers: [ReadyDomainService],
  exports: [ReadyDomainService],
})
export class ReadyDomainModule {}
