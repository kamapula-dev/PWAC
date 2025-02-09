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

  async saveMapping(
    externalId: string,
    pwaContentId: string,
    domain: string,
    userAgent: string,
    ip?: string,
    country?: string,
    language?: string,
    dob?: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
    email?: string,
  ) {
    let mapping = await this.mappingModel.findOne({ externalId }).exec();

    if (mapping) {
      return mapping;
    }

    mapping = new this.mappingModel({
      externalId,
      pwaContentId,
      domain,
      ip,
      userAgent,
      country,
      language,
      dob,
      firstName,
      lastName,
      phone,
      email,
    });

    return mapping.save();
  }

  async findByExternalId(externalId: string): Promise<PWAExternalMapping> {
    return this.mappingModel.findOne({ externalId }).exec();
  }

  async deleteAllByPwaContentId(pwaContentId: string): Promise<number> {
    const result = await this.mappingModel.deleteMany({ pwaContentId }).exec();
    return result.deletedCount || 0;
  }

  async removePwaContentIdByDomain(domain: string): Promise<number> {
    const result = await this.mappingModel
      .updateMany({ domain }, { $unset: { pwaContentId: 1 } })
      .exec();
    return result.modifiedCount || 0;
  }

  async setPwaContentIdByDomain(
    domain: string,
    pwaContentId: string,
  ): Promise<number> {
    const result = await this.mappingModel
      .updateMany({ domain }, { $set: { pwaContentId } })
      .exec();
    return result.modifiedCount || 0;
  }

  async updatePushToken(
    externalId: string,
    pushToken: string,
  ): Promise<PWAExternalMapping | null> {
    return this.mappingModel.findOneAndUpdate(
      { externalId },
      { pushToken },
      { new: true },
    );
  }
}
