import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Push, PushDocument } from '../../schemas/push.schema';
import { PushService } from '../push/push.service';
import { PWAExternalMapping } from '../../schemas/pwa-external-mapping.scheme';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectModel(Push.name) private pushModel: Model<PushDocument>,
    private pushService: PushService,
    @InjectModel(PWAExternalMapping.name)
    private mappingModel: Model<PWAExternalMapping>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleScheduledPushes() {
    const now = new Date();
    const timeWindowEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    try {
      const candidates = await this.findEligiblePushes(now, timeWindowEnd);
      await this.processPushes(candidates, now, timeWindowEnd);
    } catch (error) {
      this.logger.error(`Scheduling failed: ${error.message}`, error.stack);
    }
  }

  private async findEligiblePushes(start: Date, end: Date) {
    return this.pushModel
      .find({
        active: true,
        schedules: {
          $elemMatch: { $gte: start, $lte: end },
        },
      })
      .lean()
      .exec();
  }

  private async processPushes(
    pushes: Array<Record<string, unknown>>,
    now: Date,
    end: Date,
  ) {
    for (const rawPush of pushes) {
      const session = await this.pushModel.startSession();

      try {
        await session.withTransaction(async () => {
          const pushId = new Types.ObjectId(rawPush._id as string);
          const freshPush = await this.lockPushDocument(pushId, session);

          if (!this.validatePush(freshPush)) return;

          const schedules = this.extractValidSchedules(freshPush, now, end);
          if (schedules.length === 0) return;

          await this.processPushNotifications(freshPush, schedules, now);
          await this.updatePushSchedules(freshPush, schedules, session);
        });
      } catch (error) {
        this.logger.error(
          `Transaction failed for push ${rawPush._id}: ${error.message}`,
        );
      } finally {
        await session.endSession();
      }
    }
  }

  private async lockPushDocument(
    pushId: Types.ObjectId,
    session: ClientSession,
  ) {
    return this.pushModel
      .findById(pushId)
      .session(session)
      .select('+schedules')
      .exec();
  }

  private validatePush(push: PushDocument | null): push is PushDocument {
    return !!push?.active && !!push.schedules?.length;
  }

  private extractValidSchedules(
    push: PushDocument,
    start: Date,
    end: Date,
  ): Date[] {
    return push.schedules.filter(
      (s) => s >= start && s <= end && !isNaN(s.getTime()),
    );
  }

  private async processPushNotifications(
    push: PushDocument,
    schedules: Date[],
    now: Date,
  ) {
    const pwaIds = this.extractPwaContentIds(push);
    if (pwaIds.length === 0) {
      this.logger.warn(`No valid PWA IDs for push ${push._id}`);
      return;
    }

    const mappings = await this.findValidMappings(pwaIds);
    if (mappings.length === 0) {
      this.logger.warn(`No valid mappings for push ${push._id}`);
      return;
    }

    for (const schedule of schedules) {
      const delay = this.calculateSafeDelay(schedule, now);
      if (delay <= 0) continue;

      try {
        await Promise.all(
          mappings.map((mapping) =>
            this.pushService.schedulePush(
              push._id.toString(),
              delay,
              mapping.externalId,
            ),
          ),
        );
      } catch (error) {
        this.logger.error(
          `Failed to schedule push ${push._id}: ${error.message}`,
        );
      }
    }
  }

  private extractPwaContentIds(push: PushDocument): string[] {
    return push.recipients.flatMap(
      (recipient) => recipient.pwas?.map((pwa) => pwa.id).filter(Boolean) || [],
    );
  }

  private async findValidMappings(pwaIds: string[]) {
    return this.mappingModel.find({
      pwaContentId: { $in: pwaIds },
      pushToken: { $exists: true, $ne: '' },
    });
  }

  private calculateSafeDelay(schedule: Date, now: Date): number {
    const delayMs = schedule.getTime() - now.getTime();
    return Math.max(0, Math.ceil(delayMs / 1000));
  }

  private async updatePushSchedules(
    push: PushDocument,
    schedules: Date[],
    session: ClientSession,
  ) {
    try {
      await this.pushModel.updateOne(
        { _id: push._id },
        { $pullAll: { schedules } },
        { session },
      );
      this.logger.log(`Schedules updated for push ${push._id}`);
    } catch (error) {
      this.logger.error(`Failed to update schedules: ${error.message}`);
      throw error;
    }
  }
}
