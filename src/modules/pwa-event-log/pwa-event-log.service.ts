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

  async getEventStats(
    pwaContentId: string,
    startDate?: string,
    endDate?: string,
    event?: PwaEvent,
  ): Promise<{
    opens: number;
    installs: number;
    registrations: number;
    deposits: number;
  }> {
    const matchFilter: { [key: string]: unknown } = { pwaContentId };

    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) {
        matchFilter.createdAt['$gte'] = new Date(startDate);
      }
      if (endDate) {
        matchFilter.createdAt['$lte'] = new Date(endDate);
      }
    }

    if (event) {
      matchFilter.event = event;
    } else {
      matchFilter.event = {
        $in: [
          PwaEvent.OpenPage,
          PwaEvent.Install,
          PwaEvent.Registration,
          PwaEvent.Deposit,
        ],
      };
    }

    const results = await this.eventLogModel.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ]);

    const stats = {
      opens: 0,
      installs: 0,
      registrations: 0,
      deposits: 0,
    };

    results.forEach((item) => {
      switch (item._id) {
        case PwaEvent.OpenPage:
          stats.opens = item.count;
          break;
        case PwaEvent.Install:
          stats.installs = item.count;
          break;
        case PwaEvent.Registration:
          stats.registrations = item.count;
          break;
        case PwaEvent.Deposit:
          stats.deposits = item.count;
          break;
      }
    });

    return stats;
  }
}
