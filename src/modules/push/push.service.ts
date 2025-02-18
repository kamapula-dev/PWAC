import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Push, PushDocument, SendToType } from '../../schemas/push.schema';
import { PWAExternalMapping } from '../../schemas/pwa-external-mapping.scheme';
import { PWAEventLog } from '../../schemas/pwa-event-log.scheme';
import { FirebaseService } from '../firebase/firebase.service';
import { PushDto } from './dto/push.dto';

@Injectable()
export class PushService {
  constructor(
    @InjectModel(Push.name) private readonly pushModel: Model<PushDocument>,
    @InjectModel(PWAExternalMapping.name)
    private readonly mappingModel: Model<PWAExternalMapping>,
    @InjectModel(PWAEventLog.name)
    private readonly pwaEventLogModel: Model<PWAEventLog>,
    private readonly firebasePushService: FirebaseService,
    @InjectQueue('pushQueue') private readonly pushQueue: Queue,
  ) {}

  async create(dto: PushDto, userId: string): Promise<Push> {
    const created = new this.pushModel({
      ...dto,
      user: new Types.ObjectId(userId),
    });
    const savedPush = await created.save();

    if (savedPush.active && savedPush.delay && savedPush.delay > 0) {
      await this.schedulePush(savedPush._id.toString(), savedPush.delay);
    }

    return savedPush;
  }

  async update(id: string, dto: Partial<PushDto>): Promise<Push> {
    const updated = await this.pushModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundException(`Push with id "${id}" not found`);
    }

    if (updated.active && updated.delay && updated.delay > 0) {
      await this.schedulePush(updated._id.toString(), updated.delay);
    }

    return updated;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const deleted = await this.pushModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Push with id "${id}" not found`);
    }
    return { success: true };
  }

  async schedulePush(pushId: string, delaySeconds: number) {
    Logger.log(
      `[PushService] Scheduling push (ID=${pushId}) with delay=${delaySeconds}s`,
    );
    await this.pushQueue.add({ pushId }, { delay: delaySeconds * 1000 });
  }

  async findAll(params: {
    userId: string;
    active?: boolean;
    event?: string;
    search?: string;
  }): Promise<Push[]> {
    const { active, event, search, userId } = params;
    const filter: any = {};

    if (active !== undefined) {
      filter.active = active;
    }

    if (event) {
      filter.triggerEvent = event;
    }

    if (search) {
      filter.systemName = { $regex: search, $options: 'i' };
    }

    return this.pushModel.find({ ...filter, user: userId }).exec();
  }

  async findOne(id: string): Promise<Push> {
    const push = await this.pushModel.findById(id).exec();
    if (!push) {
      throw new NotFoundException(`Push with id "${id}" not found`);
    }
    return push;
  }

  async updatePwaIdByDomain(
    userId: string,
    domain: string,
    newId: string | null,
  ): Promise<void> {
    const pushes = await this.pushModel.find({ user: userId });

    if (!pushes.length) {
      throw new NotFoundException(`No pushes found for user "${userId}"`);
    }

    pushes.forEach((push) => {
      push.recipients.forEach((recipient) => {
        recipient.pwas.forEach((pwa) => {
          if (pwa.domain === domain) {
            pwa.id = newId;
          }
        });
      });
    });

    await Promise.all(pushes.map((push) => push.save()));
  }

  async removePwaById(userId: string, pwaId: string): Promise<void> {
    const pushes = await this.pushModel.find({ user: userId });

    if (!pushes.length) {
      throw new NotFoundException(`No pushes found for user "${userId}"`);
    }

    pushes.forEach((push) => {
      push.recipients = push.recipients.map((recipient) => {
        recipient.pwas = recipient.pwas.filter((pwa) => pwa.id !== pwaId);
        return recipient;
      });
    });

    await Promise.all(pushes.map((push) => push.save()));
  }

  async duplicatePush(id: string): Promise<Push> {
    const existingPush = await this.pushModel.findById(id).lean();
    if (!existingPush) {
      throw new NotFoundException(`Push with id "${id}" not found`);
    }

    const duplicatedPush = new this.pushModel({
      ...existingPush,
      _id: new Types.ObjectId(),
      createdAt: undefined,
      updatedAt: undefined,
      systemName: `${existingPush.systemName} (Copy)`,
      active: false,
    });

    return duplicatedPush.save();
  }

  async sendPushViaFirebase(pushData: Push) {
    const { content, recipients } = pushData;
    const { title, description, icon, url } = content;

    let allTokens: string[] = [];

    for (const recipient of recipients) {
      const { pwas, filters } = recipient;

      let mappings = await this.mappingModel.find({
        pwaContentId: { $in: pwas.map((pwa) => pwa.id) },
        pushToken: { $exists: true, $ne: '' },
      });

      for (const filter of filters) {
        const userHasEvent = await this.pwaEventLogModel.exists({
          event: filter.event,
        });

        if (filter.sendTo === SendToType.with && !userHasEvent) {
          continue;
        }

        if (filter.sendTo === SendToType.without && userHasEvent) {
          continue;
        }
      }

      const tokens = mappings.map((m) => m.pushToken).filter(Boolean);
      allTokens = [...allTokens, ...tokens];
    }

    const uniqueTokens = Array.from(new Set(allTokens));

    if (uniqueTokens.length === 0) {
      Logger.log(`[PushService] No recipients found for push.`);
      return { success: false, message: 'No recipients found' };
    }

    Logger.log(
      `[PushService] Sending push to ${uniqueTokens.length} recipients...`,
    );

    const chunkSize = 500;
    const results = [];

    for (let i = 0; i < uniqueTokens.length; i += chunkSize) {
      const chunk = uniqueTokens.slice(i, i + chunkSize);
      const res = await this.firebasePushService.sendPushToMultipleDevices(
        chunk,
        {
          title,
          body: description,
          icon,
          url,
        },
      );
      results.push(res);
    }

    return {
      success: true,
      totalTokens: uniqueTokens.length,
      results,
    };
  }

  async testPush(pushId: string): Promise<void> {
    const pushData = await this.findOne(pushId);

    if (!pushData) {
      throw new NotFoundException(`Push with ID ${pushId} not found`);
    }

    Logger.log(
      `[PushService] Manually triggering test push for pushId=${pushId}`,
    );

    const result = await this.sendPushViaFirebase(pushData);

    Logger.log(
      `[PushService] Test push completed for pushId=${pushId}`,
      JSON.stringify(result),
    );
  }

  async handleNewEvent(eventLog: PWAEventLog): Promise<void> {
    Logger.log(
      `[PushService] New event detected: ${eventLog.event} for externalId: ${eventLog.externalId}`,
    );

    const activePushes = await this.pushModel.find({
      active: true,
      triggerEvent: eventLog.event,
    });

    for (const push of activePushes) {
      const matchingRecipients = push.recipients.filter((recipient) =>
        recipient.pwas.some((pwa) => pwa.id === eventLog.pwaContentId),
      );

      if (matchingRecipients.length === 0) {
        Logger.log(
          `[PushService] No matching recipients for event ${eventLog.event}`,
        );
        continue;
      }

      const pwaMapping = await this.mappingModel.findOne({
        externalId: eventLog.externalId,
        pwaContentId: eventLog.pwaContentId,
      });

      if (!(pwaMapping && pwaMapping.pushToken)) {
        Logger.log(
          `[PushService] No push token found for externalId ${eventLog.externalId}`,
        );
        continue;
      }

      let shouldSend = false;

      for (const recipient of matchingRecipients) {
        for (const filter of recipient.filters) {
          if (filter.event === eventLog.event) {
            const userHasEvent = await this.pwaEventLogModel.exists({
              externalId: eventLog.externalId,
              event: filter.event,
            });

            if (filter.sendTo === SendToType.with && userHasEvent) {
              shouldSend = true;
            } else if (filter.sendTo === SendToType.without && !userHasEvent) {
              shouldSend = true;
            } else if (filter.sendTo === SendToType.all) {
              shouldSend = true;
            }
          }
        }
      }

      if (!shouldSend) {
        Logger.log(
          `[PushService] Push not sent for event ${eventLog.event} due to filters`,
        );
        continue;
      }

      if (push.delay > 0) {
        await this.schedulePush(push._id.toString(), push.delay);
        continue;
      }

      await this.firebasePushService.sendPushToMultipleDevices(
        [pwaMapping.pushToken],
        {
          title: push.content.title,
          body: push.content.description,
          color: push.content.color,
          badge: push.content.badge,
          icon: push.content.icon,
          picture: push.content.picture,
          url: push.content.url,
        },
      );

      Logger.log(
        `[PushService] Push sent immediately for event ${eventLog.event}`,
      );
    }
  }
}
