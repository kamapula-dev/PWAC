import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Res,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { PWAContentService } from './pwa-content.service';
import { CreatePWAContentDto } from './dto/create-pwa-content.dto';
import { UpdatePWAContentDto } from './dto/update-pwa-content.dto';
import { PWAContent } from '../../schemas/pwa-content.scheme';
import { AuthGuard } from '@nestjs/passport';
import { MediaService } from '../media/media.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { Queue } from 'bull';

@Controller('pwa-content')
export class PWAContentController {
  constructor(
    private readonly pwaContentService: PWAContentService,
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectQueue('buildPWA') private readonly buildQueue: Queue,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() createPWAContentDto: CreatePWAContentDto,
    @Request() req,
  ): Promise<PWAContent> {
    const userId = req.user._id;
    return this.pwaContentService.create(createPWAContentDto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Request() req): Promise<PWAContent[]> {
    const userId = req.user._id;
    return this.pwaContentService.findAll(userId);
  }

  @Get(':id/trusted')
  async findOneTrust(@Param('id') id: string): Promise<PWAContent> {
    return this.pwaContentService.findOneTrusted(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<PWAContent> {
    const userId = req.user._id;
    return this.pwaContentService.findOne(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user._id;
    return this.pwaContentService.remove(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePWAContentDto: UpdatePWAContentDto,
    @Request() req,
  ): Promise<PWAContent> {
    const userId = req.user._id;
    return this.pwaContentService.update(id, updatePWAContentDto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/copy')
  async copyPWAContent(
    @Param('id') id: string,
    @Request() req,
  ): Promise<PWAContent> {
    const userId = req.user._id;

    const originalPWAContent = await this.pwaContentService.findOne(id, userId);

    if (!originalPWAContent) {
      throw new NotFoundException('Original PWA Content not found');
    }

    const copiedPWAContentDto = {
      ...originalPWAContent.toObject(),
      appName: `${originalPWAContent.appName} - Copy`,
    };

    delete copiedPWAContentDto._id;
    delete copiedPWAContentDto.createdAt;
    delete copiedPWAContentDto.updatedAt;

    console.log(copiedPWAContentDto, 'copiedPWAContentDto');

    return this.pwaContentService.create(copiedPWAContentDto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/build')
  async buildPWA(
    @Param('id') id: string,
    @Request() req,
    @Res() res,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      Logger.log('Adding job to the queue job');

      const job = await this.buildQueue.add({
        pwaContentId: id,
        userId,
      });

      Logger.log(`Job ${job.id} added to the queue`);

      res.json({ jobId: job.id });
    } catch (e) {
      Logger.log(e, 'Failed to add job to the queue');
      throw e;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('get-signed-url/:pwaContentId')
  async getSignedUrl(
    @Param('pwaContentId') pwaContentId: string,
    @Request() req,
  ): Promise<string> {
    try {
      const userId = req.user._id;
      const user = await this.userService.findById(userId);

      if (!user) {
        throw new NotFoundException('PWA not found');
      }

      const pwa = user.pwas.find((p) => p.pwaContentId === pwaContentId);

      return this.mediaService.getSignedUrl(pwa.archiveKey);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('status/:jobId')
  async checkBuildStatus(@Param('jobId') jobId: string): Promise<any> {
    const job = await this.buildQueue.getJob(jobId);

    if (!job) {
      return { status: 'error', message: 'Job not found' };
    }

    const state = await job.getState();

    if (state === 'completed') {
      return { status: 'completed', url: job.returnvalue };
    } else if (state === 'failed') {
      return { status: 'failed', message: 'Job failed' };
    }

    return { status: state };
  }
}
