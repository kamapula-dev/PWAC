import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PushService } from './push.service';
import { Logger } from '@nestjs/common';

@Processor('pushQueue')
export class PushQueueProcessor {
  private readonly logger = new Logger(PushQueueProcessor.name);

  constructor(private readonly pushService: PushService) {}

  @Process()
  async handlePushJob(job: Job) {
    const { pushId, externalId } = job.data;
    this.logger.log(`Processing pushId=${pushId}`);

    const pushData = await this.pushService.findOne(pushId);
    if (!pushData) {
      this.logger.warn(`Push ID ${pushId} not found`);
      return;
    }

    if (!pushData.active) {
      this.logger.log(`Push ID ${pushId} is inactive. Skipping.`);
      return;
    }

    this.logger.log(
      `Sending push from queue for pushId=${pushId}${externalId ? `, externalId: ${externalId}` : ''}`,
    );
    const result = await this.pushService.sendPushViaFirebase(
      pushData,
      externalId,
    );

    this.logger.log(
      `Push job completed for pushId=${pushId}${externalId ? `, externalId: ${externalId}` : ''}`,
      JSON.stringify(result),
    );
  }
}
