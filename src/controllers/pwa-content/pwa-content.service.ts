import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePWAContentDto } from './dto/create-pwa-content.dto';
import { UpdatePWAContentDto } from './dto/update-pwa-content.dto';
import { PWAContent } from '../../schemas/pwa-content.scheme';

@Injectable()
export class PWAContentService {
  constructor(
    @InjectModel(PWAContent.name)
    private readonly pwaContentModel: Model<PWAContent>,
  ) {}

  async create(createPWAContentDto: CreatePWAContentDto): Promise<PWAContent> {
    const createdPWAContent = new this.pwaContentModel(createPWAContentDto);
    return await createdPWAContent.save();
  }

  async findAll(): Promise<PWAContent[]> {
    return this.pwaContentModel.find().exec();
  }

  async findOne(id: string): Promise<PWAContent> {
    const pwaContent = await this.pwaContentModel.findById(id).exec();

    if (!pwaContent) {
      throw new NotFoundException(`PWA Content with ID "${id}" not found`);
    }

    return pwaContent;
  }

  async update(
    id: string,
    updatePWAContentDto: UpdatePWAContentDto,
  ): Promise<PWAContent> {
    const updatedPWAContent = await this.pwaContentModel
      .findByIdAndUpdate(id, updatePWAContentDto, { new: true })
      .exec();

    if (!updatedPWAContent) {
      throw new NotFoundException(`PWA Content with ID "${id}" not found`);
    }

    return updatedPWAContent;
  }

  async remove(id: string): Promise<void> {
    const result = await this.pwaContentModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`PWA Content with ID "${id}" not found`);
    }
  }
}
