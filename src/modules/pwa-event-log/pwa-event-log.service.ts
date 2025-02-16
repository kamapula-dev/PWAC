import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PushService } from '../push/push.service';
import { PWAEventLog } from 'src/schemas/pwa-event-log.scheme';
import { PwaEvent } from '../../schemas/pixel-event.scheme';

@Injectable()
export class PWAEventLogService {
  constructor(
    @InjectModel(PWAEventLog.name)
    private readonly eventLogModel: Model<PWAEventLog>,
    private readonly pushService: PushService,
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

    const savedEvent = await doc.save();

    await this.pushService.handleNewEvent(savedEvent);

    return savedEvent;
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
    startDate?: Date,
    endDate?: Date,
    event?: PwaEvent,
  ) {
    const matchFilter: any = { pwaContentId };

    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = startDate;
      if (endDate) matchFilter.createdAt.$lte = endDate;
    }

    matchFilter.event = event || {
      $in: [
        PwaEvent.OpenPage,
        PwaEvent.Install,
        PwaEvent.Registration,
        PwaEvent.Deposit,
      ],
    };

    const results = await this.eventLogModel.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ]);

    return {
      opens: this.getCount(results, PwaEvent.OpenPage),
      installs: this.getCount(results, PwaEvent.Install),
      registrations: this.getCount(results, PwaEvent.Registration),
      deposits: this.getCount(results, PwaEvent.Deposit),
    };
  }

  private getCount(results: { _id: string; count: number }[], event: PwaEvent) {
    return results.find((r) => r._id === event)?.count || 0;
  }
}
