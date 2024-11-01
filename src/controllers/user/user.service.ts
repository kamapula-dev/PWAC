import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/user.schema';
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

  async updateUserPwas(
    userId: string,
    pwaData: {
      pwaContentId: string;
      createdAt: Date;
      archiveKey: string;
    },
  ): Promise<void> {
    const { pwaContentId, createdAt, archiveKey } = pwaData;

    const result = await this.userModel.updateOne(
      { _id: userId, 'pwas.pwaContentId': pwaContentId },
      {
        $set: {
          'pwas.$.createdAt': createdAt,
          'pwas.$.archiveKey': archiveKey,
        },
      },
    );

    if (result.matchedCount === 0) {
      await this.userModel.updateOne(
        { _id: userId },
        { $push: { pwas: pwaData } },
      );
    }
  }

  async addPwa(
    userId: string,
    pwaData: {
      pwaContentId: string;
      createdAt: Date;
      archiveKey: string;
    },
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $push: { pwas: pwaData } },
    );
  }
}
