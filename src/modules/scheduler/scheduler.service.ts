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

  @Cron(CronExpression.EVERY_2_HOURS)
  async schedulePendingPushes() {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

    const upcomingPushes = await this.pushModel.find({
      active: true,
      schedules: {
        $exists: true,
        $not: { $size: 0 },
        $elemMatch: { $gte: now, $lte: nextHour },
      },
    });

    await Promise.all(
      upcomingPushes.map(async (push) => {
        const pwaContentIds = push.recipients.reduce<string[]>(
          (ids, recipient) => {
            if (recipient.pwas && recipient.pwas.length) {
              const validIds = recipient.pwas
                .map((pwa) => pwa.id)
                .filter((id) => !!id);
              return ids.concat(validIds);
            }
            return ids;
          },
          [],
        );

        if (pwaContentIds.length === 0) {
          this.logger.log(
            `No pwaContentIds found for push ${push._id}. Skipping scheduling.`,
          );
          return;
        }

        const mappings = await this.mappingModel.find({
          pwaContentId: { $in: pwaContentIds },
          pushToken: { $exists: true, $ne: '' },
        });

        if (mappings.length === 0) {
          this.logger.log(
            `No mapping with pushToken found for push ${push._id}. Skipping scheduling.`,
          );
          return;
        }

        const eligibleSchedules = push.schedules.filter(
          (schedule) => schedule >= now && schedule <= nextHour,
        );

        await Promise.all(
          eligibleSchedules.map(async (schedule) => {
            const delayMs = schedule.getTime() - now.getTime();
            const delaySeconds = Math.ceil(delayMs / 1000);

            await Promise.all(
              mappings.map(async (mapping) => {
                this.logger.log(
                  `Scheduling push (ID=${push._id}) for schedule ${schedule.toISOString()} with delay ${delaySeconds} seconds and externalId ${mapping.externalId}.`,
                );
                return this.pushService.schedulePush(
                  push._id.toString(),
                  delaySeconds,
                  mapping.externalId,
                );
              }),
            );
          }),
        );
      }),
    );
  }
}
