import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DomainMapping,
  DomainMappingDocument,
} from '../../schemas/domain-mapping.scheme';

@Injectable()
export class DomainMappingService {
  constructor(
    @InjectModel(DomainMapping.name)
    private readonly domainMappingModel: Model<DomainMappingDocument>,
  ) {}

  async addDomainMapping(
    domainName: string,
    pwaId: string,
    userId: string,
    zoneId: string,
  ): Promise<DomainMapping> {
    try {
      const mapping = new this.domainMappingModel({
        domainName,
        pwaId,
        userId,
        zoneId,
      });

      return mapping.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Domain name is already mapped.');
      }

      throw error;
    }
  }

  async updateDomainMappingPwaId(
    userId: string,
    domainName: string,
    newPwaId: string | null,
  ): Promise<void> {
    const result = await this.domainMappingModel.updateOne(
      { domainName, userId },
      { $set: { pwaId: newPwaId } },
    );

    if (result.matchedCount === 0) {
      throw new Error(
        `Domain mapping with domain name ${domainName} not found for user with ID ${userId}`,
      );
    }
  }

  async removeDomainMapping(
    domainName: string,
    pwaId: string,
    userId: string,
  ): Promise<void> {
    const result = await this.domainMappingModel
      .deleteOne({ domainName, pwaId, userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Domain ${domainName} not found.`);
    }
  }

  async getMappingByDomain(domainName: string): Promise<DomainMapping> {
    const mapping = await this.domainMappingModel
      .findOne({ domainName })
      .exec();

    if (!mapping) {
      throw new NotFoundException(
        `Mapping for domain ${domainName} not found.`,
      );
    }

    return mapping;
  }
}
