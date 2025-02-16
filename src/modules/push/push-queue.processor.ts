import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PushService } from './push.service';
import { Logger } from '@nestjs/common';

@Processor('pushQueue')
export class PushQueueProcessor {
  constructor(private readonly pushService: PushService) {}

  @Process()
  async handlePushJob(job: Job) {
    const { pushId } = job.data;
    Logger.log(`[PushQueueProcessor] Processing pushId=${pushId}`);

    const pushData = await this.pushService.findOne(pushId);
    if (!pushData) {
      Logger.log(`[PushQueueProcessor] Push ID ${pushId} not found`);
      return;
    }

    const result = await this.pushService.sendPushViaFirebase(pushData);
    Logger.log('[PushQueueProcessor] Push job completed:', result);
  }
}
