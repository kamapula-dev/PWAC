import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PwaStatus, User } from '../../schemas/user.schema';
import { JobId } from 'bull';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async create(name: string, email: string, password: string): Promise<User> {
    const newUser = new this.userModel({ name, email, password });
    return newUser.save();
  }

  async me(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).select('-password').exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async addJobToUser(
    userId: string,
    pwaId: string,
    jobId: JobId,
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId, 'pwas.pwaId': pwaId },
      { $set: { 'pwas.$.jobId': jobId } },
    );
  }

  async addPwa(
    userId: string,
    pwaData: {
      pwaContentId: string;
      createdAt: Date;
      archiveKey?: string;
      email?: string;
      gApiKey?: string;
      domain?: string;
      zoneId?: string;
      status?: PwaStatus;
    },
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $push: { pwas: pwaData } },
    );
  }

  async setUserPwaId(
    userId: string,
    domain: string,
    newPwaContentId: string | null,
    newArchiveKey?: string,
  ): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: userId, 'pwas.domainName': domain },
      {
        $set: {
          'pwas.$.pwaContentId': newPwaContentId,
          ...(newArchiveKey ? { 'pwas.$.archiveKey': newArchiveKey } : {}),
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error(
        `PWA with domain ${domain} not found for user with ID ${userId}`,
      );
    }
  }

  async enrichPwa(
    userId: string,
    pwaContentId: string,
    updateData: {
      email: string;
      gApiKey: string;
      domain: string;
      zoneId: string;
      nsRecords: { name: string }[];
      status: PwaStatus;
    },
  ): Promise<void> {
    const { domain, email, gApiKey, zoneId, nsRecords, status } = updateData;

    const result = await this.userModel.updateOne(
      { _id: userId, 'pwas.pwaContentId': pwaContentId },
      {
        $set: {
          'pwas.$.email': email,
          'pwas.$.gApiKey': gApiKey,
          'pwas.$.domainName': domain,
          'pwas.$.zoneId': zoneId,
          'pwas.$.nsRecords': nsRecords,
          'pwas.$.status': status,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error(
        `PWA with content ID ${pwaContentId} not found for user with ID ${userId}`,
      );
    }
  }

  async updateUserPwaStatus(
    userId: string,
    pwaContentId: string,
    status: PwaStatus,
  ): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: userId, 'pwas.pwaContentId': pwaContentId },
      {
        $set: { 'pwas.$.status': status },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error(
        `PWA with content ID ${pwaContentId} not found for user with ID ${userId}`,
      );
    }
  }

  async deleteUserPwaByContentId(
    userId: string,
    pwaContentId: string,
  ): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $pull: { pwas: { pwaContentId } } },
    );

    if (result.modifiedCount === 0) {
      throw new Error(
        `PWA with content ID ${pwaContentId} not found for user with ID ${userId}`,
      );
    }
  }
}
