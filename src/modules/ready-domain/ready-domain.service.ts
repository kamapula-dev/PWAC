import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProcessDomainDto,
  ReadyDomain,
} from '../../schemas/ready-domain.scheme';
import { DomainMappingService } from '../domain-mapping/domain-mapping.service';
import { UserService } from '../user/user.service';
import { User } from '../../schemas/user.schema';
import { PWAContent } from '../../schemas/pwa-content.scheme';
import { DomainMapping } from '../../schemas/domain-mapping.scheme';

@Injectable()
export class ReadyDomainService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(PWAContent.name)
    private pwaContentModel: Model<PWAContent>,
    @InjectModel(ReadyDomain.name)
    private readyDomainModel: Model<ReadyDomain>,
    @InjectModel(DomainMapping.name)
    private domainMappingModel: Model<DomainMapping>,
    private readonly domainMappingService: DomainMappingService,
    private readonly userService: UserService,
  ) {}

  async getAllAvailableDomains(userId: string) {
    return this.readyDomainModel
      .find(
        {
          userId,
          $or: [{ pwaId: { $exists: false } }, { pwaId: null }],
        },
        '-email -gApiKey -zoneId',
      )
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

    await this.userService.setUserPwaReadyDomain(
      userId,
      pwaId,
      domain.id,
      domain.domain,
    );

    return domain.save();
  }

  async detachFromPwa(userId: string, pwaId: string, id: string) {
    const domain = await this.readyDomainModel.findById(id);

    if (!domain) {
      throw new NotFoundException(`Domain with ID ${id} not found`);
    }

    await this.domainMappingService.removeDomainMapping(
      domain.domain,
      pwaId,
      userId,
    );

    domain.pwaId = null;

    return domain.save();
  }

  async processDomain(
    cloudflare: ProcessDomainDto['cloudflare'],
    domain: string,
    userEmail: string,
  ) {
    const executionInfo = {
      userPwa: 'Deleted',
      pwaContent: 'Deleted',
      domainMapping: 'Deleted',
    };
    const userWithPwa = await this.userModel
      .findOne({ 'pwas.domainName': domain })
      .exec();

    if (!userWithPwa) {
      executionInfo.userPwa = 'User with this domain not found';
    }

    const pwaEntry = userWithPwa?.pwas?.find((p) => p.domainName === domain);
    if (!pwaEntry) {
      executionInfo.pwaContent = 'PWA entry not found';
    }

    await this.userModel
      .updateOne(
        { _id: userWithPwa._id },
        { $pull: { pwas: { domainName: domain } } },
      )
      .exec();

    if (pwaEntry.pwaContentId) {
      await this.pwaContentModel
        .findByIdAndDelete(pwaEntry.pwaContentId)
        .exec();
    }

    const domainMapping =
      await this.domainMappingService.getMappingByDomain(domain);
    if (!domainMapping) {
      executionInfo.domainMapping = 'Domain mapping not found';
    }
    const zoneId = domainMapping.zoneId;
    await this.domainMappingModel.deleteOne({ domainName: domain }).exec();

    const user = await this.userModel.findOne({ email: userEmail }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const readyDomain = new this.readyDomainModel({
      domain,
      email: cloudflare.email,
      gApiKey: cloudflare.gApiKey,
      zoneId,
      userId: user._id,
    });
    await readyDomain.save();

    return { readyDomain, executionInfo };
  }
}
