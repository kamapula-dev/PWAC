import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PWAExternalMapping } from '../../schemas/pwa-external-mapping.scheme';

@Injectable()
export class PWAExternalMappingService {
  constructor(
    @InjectModel(PWAExternalMapping.name)
    private readonly mappingModel: Model<PWAExternalMapping>,
  ) {}

  async saveMapping(externalId: string, pwaId: string) {
    let mapping = await this.mappingModel.findOne({ externalId }).exec();

    if (mapping) {
      return mapping;
    }

    mapping = new this.mappingModel({
      externalId,
      pwa: pwaId,
    });

    return mapping.save();
  }

  async findPwaByExternalId(externalId: string): Promise<string | null> {
    const mapping = await this.mappingModel.findOne({ externalId }).exec();
    return mapping ? mapping.pwa.toString() : null;
  }
}
