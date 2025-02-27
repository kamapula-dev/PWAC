import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePWAContentDto } from './dto/create-pwa-content.dto';
import { UpdatePWAContentDto } from './dto/update-pwa-content.dto';
import { PWAContent } from '../../schemas/pwa-content.scheme';
import { Push, Recipient } from '../../schemas/push.schema';

@Injectable()
export class PWAContentService {
  constructor(
    @InjectModel(PWAContent.name)
    private readonly pwaContentModel: Model<PWAContent>,

    @InjectModel(Push.name)
    private readonly pushModel: Model<Push>,
  ) {}

  async create(
    createPWAContentDto: CreatePWAContentDto,
    userId: string,
  ): Promise<PWAContent> {
    const createdPWAContent = new this.pwaContentModel({
      ...createPWAContentDto,
      user: new Types.ObjectId(userId),
    });
    return await createdPWAContent.save();
  }

  async findAll(userId: string): Promise<PWAContent[]> {
    return this.pwaContentModel.find({ user: userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<PWAContent> {
    const pwaContent = await this.pwaContentModel
      .findOne({ _id: id, user: userId })
      .exec();

    if (!pwaContent) {
      throw new NotFoundException(
        `PWA Content with ID "${id}" not found for user ${userId}`,
      );
    }

    return pwaContent;
  }

  async findOneTrusted(id: string): Promise<PWAContent> {
    const pwaContent = await this.pwaContentModel
      .findOne({ _id: id })
      .lean()
      .exec();

    if (!pwaContent) {
      throw new NotFoundException(`PWA Content with ID "${id}" not found.`);
    }

    const hasPushes = await this.pushModel.exists({
      'recipients.pwas.id': id,
    });

    return {
      ...pwaContent,
      hasPushes: !!hasPushes,
    };
  }

  async update(
    id: string,
    updatePWAContentDto: UpdatePWAContentDto,
    userId: string,
  ): Promise<PWAContent> {
    const updatedPWAContent = await this.pwaContentModel
      .findOneAndUpdate({ _id: id, user: userId }, updatePWAContentDto, {
        new: true,
      })
      .exec();

    if (!updatedPWAContent) {
      throw new NotFoundException(
        `PWA Content with ID "${id}" not found for user ${userId}`,
      );
    }

    return updatedPWAContent;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.pwaContentModel
      .findOneAndDelete({ _id: id, user: userId })
      .exec();

    if (!result) {
      throw new NotFoundException(
        `PWA Content with ID "${id}" not found for user ${userId}`,
      );
    }
  }
}
