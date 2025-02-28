import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PushService } from './push.service';
import { Logger } from '@nestjs/common';

@Processor('pushQueue')
export class PushQueueProcessor {
  constructor(private readonly pushService: PushService) {}

  @Process()
  async handlePushJob(job: Job) {
    const { pushId, externalId } = job.data;
    Logger.log(`[PushQueueProcessor] Processing pushId=${pushId}`);

    const pushData = await this.pushService.findOne(pushId);
    if (!pushData) {
      Logger.warn(`[PushQueueProcessor] Push ID ${pushId} not found`);
      return;
    }

    if (!pushData.active) {
      Logger.log(
        `[PushQueueProcessor] Push ID ${pushId} is inactive. Skipping.`,
      );
      return;
    }

    Logger.log(
      `[PushQueueProcessor] Sending push from queue for pushId=${pushId}${externalId ? `, externalId: ${externalId}` : ''}`,
    );
    const result = await this.pushService.sendPushViaFirebase(
      pushData,
      externalId,
    );

    Logger.log(
      `[PushQueueProcessor] Push job completed for pushId=${pushId}${externalId ? `, externalId: ${externalId}` : ''}`,
      JSON.stringify(result),
    );
  }
}
