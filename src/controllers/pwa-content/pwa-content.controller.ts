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

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<PWAContent> {
    const userId = req.user._id;
    return this.pwaContentService.findOne(id, userId);
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
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user._id;
    return this.pwaContentService.remove(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/build')
  async buildPWA(
    @Param('id') id: string,
    @Request() req,
    @Res() res,
  ): Promise<void> {
    const userId = req.user._id;
    console.log('Adding job to the queue');

    const job = await this.buildQueue.add({
      pwaId: id,
      userId,
    });

    console.log(`Job ${job.id} added to the queue`);

    res.json({ jobId: job.id });
  }

  @Get('status/:jobId')
  async checkBuildStatus(@Param('jobId') jobId: string): Promise<any> {
    const job = await this.buildQueue.getJob(jobId);

    if (!job) {
      return { status: 'error', message: 'Job not found' };
    }

    const jobs = await this.buildQueue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);

    // Выводим все задачи в консоль
    jobs.forEach(job => {
      console.log(job);
    });

    const state = await job.getState();

    if (state === 'completed') {
      return { status: 'completed', url: job.returnvalue };
    } else if (state === 'failed') {
      return { status: 'failed', message: 'Job failed' };
    }

    return { status: state };
  }
}
