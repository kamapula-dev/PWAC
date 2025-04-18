import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePWAContentDto } from './dto/create-pwa-content.dto';
import { UpdatePWAContentDto } from './dto/update-pwa-content.dto';
import { PWAContent } from '../../schemas/pwa-content.scheme';
import { Push } from '../../schemas/push.schema';
import { PwaStatus, User } from '../../schemas/user.schema';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { USER_PWA } from './pwa-content.controller';
import { DomainManagementService } from '../domain-managemant/domain-management.service';

@Injectable()
export class PWAContentService {
  constructor(
    @InjectModel(PWAContent.name)
    private readonly pwaContentModel: Model<PWAContent>,

    @InjectModel(Push.name)
    private readonly pushModel: Model<Push>,

    private readonly domainManagementService: DomainManagementService,

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

  async findAllWithUserData(
    userId: string,
    offset: number = 0,
    limit: number = 10,
    search?: string,
  ): Promise<Array<USER_PWA>> {
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
      if (jobPwaContentId) jobMap.set(jobPwaContentId, job);
    }

    const allIdsSet = new Set([...userPwaIds, ...jobMap.keys()]);
    const searchCondition: Record<string, unknown> = {};

    if (search) {
      const regexSearch = { $regex: search, $options: 'i' };
      searchCondition.$or = [
        { appName: regexSearch },
        { pwaName: regexSearch },
      ];
    }

    const pwaContents = await this.pwaContentModel
      .find({
        _id: { $in: Array.from(allIdsSet) },
        user: userId,
        ...searchCondition,
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean<PWAContent[]>();

    const result: USER_PWA[] = [];

    for (const pwaContent of pwaContents) {
      const pwaContentId = pwaContent._id.toString();
      const userPwa = user.pwas.find((p) => p.pwaContentId === pwaContentId);
      const job = jobMap.get(pwaContentId);

      result.push({
        pwaContent,
        domain: userPwa?.domainName,
        status: userPwa?.status,
        loading: !!job,
      });
    }

    const hasWaitingNameServers = result.some(
      ({ status }) => status === PwaStatus.WAITING_NS,
    );

    if (hasWaitingNameServers) {
      return await Promise.all(
        result.map(async (item) => {
          if (item.status !== PwaStatus.WAITING_NS) {
            return item;
          }

          try {
            const actualStatus =
              await this.domainManagementService.checkDomainStatus(
                item.pwaContent._id.toString(),
                userId,
              );

            return actualStatus === 'active'
              ? { ...item, status: PwaStatus.ACTIVE }
              : item;
          } catch {
            return item;
          }
        }),
      );
    }

    return result;
  }

  async getAll(
    userId: string,
    offset: number = 0,
    limit: number = 10,
    search?: string,
    tags?: string[],
  ): Promise<{ pwas: USER_PWA[]; total: number }> {
    const user = await this.userModel.findById(userId).lean();

    if (!user) return { pwas: [], total: 0 };

    const userPwaIds = user.pwas.map((pwa) => pwa.pwaContentId);
    const jobs = await this.buildQueue.getJobs([
      'waiting',
      'active',
      'delayed',
    ]);
    const jobMap = new Map<string, Job>();

    for (const job of jobs) {
      const jobPwaContentId = job.data?.pwaContentId;
      if (jobPwaContentId) jobMap.set(jobPwaContentId, job);
    }

    const allIdsSet = new Set([...userPwaIds, ...jobMap.keys()]);
    const searchCondition: Record<string, unknown> = {};

    if (search) {
      const regexSearch = { $regex: search, $options: 'i' };
      searchCondition.$or = [
        { appName: regexSearch },
        { pwaName: regexSearch },
      ];
    }

    if (tags && tags.length > 0) {
      searchCondition.pwaTags = { $in: tags };
    }

    const baseFilter = {
      _id: { $in: Array.from(allIdsSet) },
      user: userId,
      ...searchCondition,
    };

    const [pwaContents, total] = await Promise.all([
      this.pwaContentModel
        .find(baseFilter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean<PWAContent[]>(),
      this.pwaContentModel.countDocuments(baseFilter).exec(),
    ]);

    const result = [];

    for (const pwaContent of pwaContents) {
      const pwaContentId = pwaContent._id.toString();
      const userPwa = user.pwas.find((p) => p.pwaContentId === pwaContentId);
      const job = jobMap.get(pwaContentId);

      result.push({
        pwaContent,
        domain: userPwa?.domainName,
        status: userPwa?.status,
        loading: !!job,
      });
    }

    const hasWaitingNameServers = result.some(
      ({ status }) => status === PwaStatus.WAITING_NS,
    );

    if (hasWaitingNameServers) {
      return {
        pwas: await Promise.all(
          result.map(async (item) => {
            if (item.status !== PwaStatus.WAITING_NS) {
              return item;
            }

            try {
              const actualStatus =
                await this.domainManagementService.checkDomainStatus(
                  item.pwaContent._id.toString(),
                  userId,
                );

              return actualStatus === 'active'
                ? { ...item, status: PwaStatus.ACTIVE }
                : item;
            } catch {
              return item;
            }
          }),
        ),
        total,
      };
    }

    return { pwas: result, total };
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
