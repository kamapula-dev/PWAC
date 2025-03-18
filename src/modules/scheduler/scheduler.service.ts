import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Push, PushDocument } from '../../schemas/push.schema';
import { PushService } from '../push/push.service';
import { PWAExternalMapping } from 'src/schemas/pwa-external-mapping.scheme';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectModel(Push.name) private pushModel: Model<PushDocument>,
    private pushService: PushService,
    @InjectModel(PWAExternalMapping.name)
    private mappingModel: Model<PWAExternalMapping>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async schedulePendingPushes() {
    const now = new Date();
    const nextTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const upcomingPushes = await this.pushModel.find({
      active: true,
      schedules: {
        $exists: true,
        $not: { $size: 0 },
        $elemMatch: { $gte: now, $lte: nextTwoHours },
      },
    });

    await Promise.all(
      upcomingPushes.map(async (push) => {
        const pwaContentIds = push.recipients.reduce<string[]>(
          (ids, recipient) => {
            if (recipient.pwas?.length) {
              return ids.concat(
                recipient.pwas
                  .map((pwa) => pwa.id)
                  .filter((id): id is string => !!id),
              );
            }
            return ids;
          },
          [],
        );

        if (!pwaContentIds.length) {
          this.logger.log(`No pwaContentIds for push ${push._id}`);
          return;
        }

        const mappings = await this.mappingModel.find({
          pwaContentId: { $in: pwaContentIds },
          pushToken: { $exists: true, $ne: '' },
        });

        if (!mappings.length) {
          this.logger.log(`No mappings for push ${push._id}`);
          return;
        }

        const eligibleSchedules = push.schedules.filter(
          (schedule) => schedule >= now && schedule <= nextTwoHours,
        );

        if (!eligibleSchedules.length) return;

        await Promise.all(
          eligibleSchedules.map(async (schedule) => {
            const delayMs = schedule.getTime() - now.getTime();

            if (delayMs < 0) return;

            await Promise.all(
              mappings.map(async (mapping) => {
                await this.pushService.schedulePush(
                  push._id.toString(),
                  Math.ceil(delayMs / 1000),
                  mapping.externalId,
                );
              }),
            );
          }),
        );

        const remainingSchedules = push.schedules.filter(
          (s) => !eligibleSchedules.some((es) => es.getTime() === s.getTime()),
        );

        await this.pushModel.updateOne(
          { _id: push._id },
          { $set: { schedules: remainingSchedules } },
        );
      }),
    );
  }
}
