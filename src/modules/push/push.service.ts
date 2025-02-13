import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PushDto } from './dto/push.dto';
import { Push, PushDocument } from '../../schemas/push.schema';

@Injectable()
export class PushService {
  constructor(
    @InjectModel(Push.name) private readonly pushModel: Model<PushDocument>,
  ) {}

  async create(dto: PushDto, userId: string): Promise<Push> {
    const created = new this.pushModel({
      ...dto,
      user: new Types.ObjectId(userId),
    });
    return created.save();
  }

  async update(id: string, dto: PushDto): Promise<Push> {
    const updated = await this.pushModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) {
      throw new NotFoundException(`Push with id "${id}" not found`);
    }

    return updated;
  }

  async findAll(params: {
    active?: boolean;
    event?: string;
    search?: string;
  }): Promise<Push[]> {
    const { active, event, search } = params;
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

    return this.pushModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Push> {
    const push = await this.pushModel.findById(id).exec();
    if (!push) {
      throw new NotFoundException(`Push with id "${id}" not found`);
    }
    return push;
  }

  /**
   * Тестовый пуш: один раз отправляем на все PWA исходя из filters.
   * В реальном приложении вам нужно будет:
   * 1. Определить логику, как формируются конечные получатели (например,
   *    фильтрация пользователей/устройств по событию, статусу и т. д.)
   * 2. Вызвать сервис уведомлений (например, WebPush, FCM, OneSignal и т. п.)
   */
  async testPush(pushId: string): Promise<any> {
    const pushData = await this.findOne(pushId);

    // допустим, нам нужно пройтись по всем recipients и применить фильтры
    const recipients = pushData.recipients;

    // Здесь псевдо-код для отбора PWA.
    // Допустим, у вас есть сервис, где вы храните пользовательские subscription’ы
    // или список доменов, на которые реально можно отправить push.

    // const allUserSubscriptions = await this.someSubscriptionService.findAll();

    for (const recipient of recipients) {
      const { domains, filters } = recipient;

      // 1. Проверяем, есть ли у нас необходимый event из filters
      // 2. В зависимости от sendTo = 'all' | 'with' | 'without' – выбираем subset
      // 3. На практике здесь будет логика, которую вы опишете согласно бизнес-требованиям

      console.log('PWA domains:', domains);
      console.log('Filters:', filters);

      // Пример перебора фильтров:
      for (const filter of filters) {
        // filter.event => 'Deposit' | 'Registration'
        // filter.sendTo => 'all' | 'with' | 'without'

        // В реальном коде здесь будет выборка, кто подходит под "with deposit" или "without deposit" и т.д.
        console.log(
          `Filter event = ${filter.event}, sendTo = ${filter.sendTo}`,
        );
      }

      // Далее отправляем пуш. Условно:
      // await this.pushNotificationService.send({
      //   pwaDomains: pwas,
      //   title: pushData.content.title,
      //   message: pushData.content.description,
      //   icon: pushData.content.icon,
      //   url: pushData.content.url
      //   ...
      // });
    }

    return { success: true, message: 'Test push sent (mock)' };
  }
}
