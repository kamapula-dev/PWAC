import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePWAContentDto } from './dto/create-pwa-content.dto';
import { UpdatePWAContentDto } from './dto/update-pwa-content.dto';
import { PWAContent } from '../../schemas/pwa-content.scheme';
import { Push } from '../../schemas/push.schema';
import { User } from '../../schemas/user.schema';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { USER_PWA } from './pwa-content.controller';

@Injectable()
export class PWAContentService {
  constructor(
    @InjectModel(PWAContent.name)
    private readonly pwaContentModel: Model<PWAContent>,

    @InjectModel(Push.name)
    private readonly pushModel: Model<Push>,

    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectQueue('buildPWA') private readonly buildQueue: Queue,
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

  async findAllWithUserData(userId: string): Promise<Array<USER_PWA>> {
    const user = await this.userModel.findById(userId).lean();

    if (!user) return [];

    const userPwaIds = user.pwas.map((pwa) => pwa.pwaContentId);
    const jobs = await this.buildQueue.getJobs([
      'waiting',
      'active',
      'delayed',
    ]);

    const jobMap = new Map<string, Job>();

    for (const job of jobs) {
      const jobPwaContentId = job.data?.pwaContentId;

      if (jobPwaContentId) {
        jobMap.set(jobPwaContentId, job);
      }
    }

    const allIdsSet = new Set([...userPwaIds, ...jobMap.keys()]);
    const pwaContents = await this.pwaContentModel
      .find({ _id: { $in: Array.from(allIdsSet) }, user: userId })
      .lean<PWAContent[]>();

    const result = [];

    for (const pwaContentId of allIdsSet) {
      const pwaContent = pwaContents.find(
        (doc) => doc._id.toString() === pwaContentId,
      )!;

      const userPwa = user.pwas.find((p) => p.pwaContentId === pwaContentId);
      const domain = userPwa?.domainName;
      const status = userPwa?.status;

      let jobStatus: string | undefined;
      const job = jobMap.get(pwaContentId);

      if (job) {
        jobStatus = await job.getState();
      }

      if (!pwaContent) {
        continue;
      }

      result.push({
        pwaContent,
        domain,
        status,
        loading: Boolean(jobStatus),
      });
    }

    return result;
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
    const pwaContent = await this.pwaContentModel.findOne({ _id: id }).exec();

    if (!pwaContent) {
      throw new NotFoundException(`PWA Content with ID "${id}" not found.`);
    }

    const hasPushes = await this.pushModel.exists({
      'recipients.pwas.id': id,
    });

    pwaContent.hasPushes = !!hasPushes;

    return pwaContent;
  }

  async update(
    id: string,
    updatePWAContentDto: UpdatePWAContentDto,
    userId: string,
  ): Promise<PWAContent> {
    delete (updatePWAContentDto as { user?: string })?.user;

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
