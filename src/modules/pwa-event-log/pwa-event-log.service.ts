import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PWAEventLog } from '../../schemas/pwa-event-log.scheme';
import { PwaEvent } from '../../schemas/pixel-event.scheme';

@Injectable()
export class PWAEventLogService {
  constructor(
    @InjectModel(PWAEventLog.name)
    private readonly eventLogModel: Model<PWAEventLog>,
  ) {}

  async logEvent(
    pwaContentId: string,
    domain: string,
    event: PwaEvent,
    externalId?: string,
    value?: number,
    currency?: string,
  ): Promise<PWAEventLog> {
    const doc = new this.eventLogModel({
      pwaContentId,
      domain,
      externalId,
      event,
      value,
      currency,
    });
    return doc.save();
  }

  async deleteAllByPwaContentId(pwaContentId: string): Promise<number> {
    const result = await this.eventLogModel.deleteMany({ pwaContentId }).exec();
    return result.deletedCount || 0;
  }

  async removePwaContentIdByDomain(domain: string): Promise<number> {
    const result = await this.eventLogModel
      .updateMany({ domain }, { $unset: { pwaContentId: 1 } })
      .exec();
    return result.modifiedCount || 0;
  }

  async setPwaContentIdByDomain(
    domain: string,
    pwaContentId: string,
  ): Promise<number> {
    const result = await this.eventLogModel
      .updateMany({ domain }, { $set: { pwaContentId } })
      .exec();
    return result.modifiedCount || 0;
  }
}
