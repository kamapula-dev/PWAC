import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReadyDomain } from '../../schemas/ready-domain.scheme';
import { DomainMappingService } from '../domain-mapping/domain-mapping.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ReadyDomainService {
  constructor(
    @InjectModel(ReadyDomain.name)
    private readonly readyDomainModel: Model<ReadyDomain>,
    private readonly domainMappingService: DomainMappingService,
    private readonly userService: UserService,
  ) {}

  async getAllAvailableDomains() {
    return this.readyDomainModel
      .find({ pwaId: { $exists: false } }, '-email -gApiKey -zoneId')
      .exec();
  }

  async attachToPwa(id: string, pwaId: string, userId: string) {
    const domain = await this.readyDomainModel.findById(id);

    if (!domain) {
      throw new NotFoundException(`Domain with ID ${id} not found`);
    }

    await this.domainMappingService.addDomainMapping(
      domain.domain,
      pwaId,
      userId,
      domain.zoneId,
    );

    domain.pwaId = pwaId;
    domain.userId = userId;

    await this.userService.updateUserPwaReadyDomain(userId, pwaId, domain.id);

    return domain.save();
  }

  async detachFromPwa(userId: string, pwaId: string, id: string) {
    const domain = await this.readyDomainModel.findById(id);

    if (!domain) {
      throw new NotFoundException(`Domain with ID ${id} not found`);
    }

    domain.pwaId = null;
    domain.userId = null;

    await this.userService.updateUserPwaReadyDomain(userId, pwaId, null);

    return domain.save();
  }
}
