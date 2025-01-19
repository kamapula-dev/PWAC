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
    pwaId: string,
    event: PwaEvent,
    externalId?: string,
    value?: number,
    currency?: string,
  ): Promise<PWAEventLog> {
    const doc = new this.eventLogModel({
      pwa: pwaId,
      externalId,
      event,
      value,
      currency,
    });
    return doc.save();
  }
}
