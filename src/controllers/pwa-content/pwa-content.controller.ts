import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
  Logger,
  NotFoundException,
  Patch,
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
import * as deepl from 'deepl-node';
import { DomainManagementService } from '../domain-managemant/domain-management.service';
import { DomainMappingService } from '../domain-mapping/domain-mapping.service';

@Controller('pwa-content')
export class PWAContentController {
  private readonly translator: deepl.Translator;
  constructor(
    private readonly pwaContentService: PWAContentService,
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly domainManagementService: DomainManagementService,
    private readonly domainMappingService: DomainMappingService,
    @InjectQueue('buildPWA') private readonly buildQueue: Queue,
  ) {
    const deeplApiKey = this.configService.get<string>('DEEPL_API_KEY');
    this.translator = new deepl.Translator(deeplApiKey);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() createPWAContentDto: CreatePWAContentDto,
    @Request() req,
  ): Promise<PWAContent> {
    const userId = req.user._id;
    const { languages } = createPWAContentDto;

    const translateFields = async (
      field: Map<deepl.TargetLanguageCode, string> | undefined,
      fieldName: string,
    ) => {
      if (field) {
        const initialText = Object.values(field)[0];
        await Promise.all(
          languages.map(async (lang) => {
            const translatedText = (await this.translator.translateText(
              initialText,
              null,
              lang,
            )) as deepl.TextResult;
            const languageKey = lang.split('-')[0];
            field[languageKey] = translatedText.text;
          }),
        );
      } else {
        Logger.warn(`Field "${fieldName}" is not defined in the DTO.`);
      }
    };

    await Promise.all([
      translateFields(createPWAContentDto.fullDescription, 'fullDescription'),
      translateFields(createPWAContentDto.shortDescription, 'shortDescription'),
      translateFields(createPWAContentDto.countOfDownloads, 'countOfDownloads'),
    ]);

    if (createPWAContentDto.reviews) {
      for (const review of createPWAContentDto.reviews) {
        await Promise.all([
          translateFields(review.reviewText, 'reviewText'),
          translateFields(review.devResponse, 'devResponse'),
        ]);
      }
    }

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
  async delete(@Param('id') id: string, @Request() req): Promise<boolean> {
    const userId = req.user._id;

    const user = await this.userService.findById(userId);
    const existingPwa = user.pwas.find((p) => p.pwaContentId === id);

    await Promise.all([
      this.pwaContentService.remove(id, userId),
      this.mediaService.deleteArchive(existingPwa.archiveKey),
      this.domainMappingService.updateDomainMappingPwaId(
        userId,
        existingPwa.domainName,
        null,
      ),
      this.userService.setUserPwaId(userId, existingPwa.domainName, null),
    ]);

    return true;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/force')
  async forceDelete(@Param('id') id: string, @Request() req): Promise<boolean> {
    const userId = req.user._id;

    const user = await this.userService.findById(userId);
    const existingPwa = user.pwas.find((p) => p.pwaContentId === id);

    await Promise.all([
      this.pwaContentService.remove(id, userId),
      this.domainManagementService.removeDomain(
        existingPwa.email,
        existingPwa.gApiKey,
        existingPwa.domainName,
        id,
        userId,
      ),
      this.userService.deleteUserPwaByContentId(
        userId,
        existingPwa.pwaContentId,
      ),
      this.mediaService.deleteArchive(existingPwa.archiveKey),
    ]);

    return true;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePWAContentDto: UpdatePWAContentDto,
    @Request() req,
  ) {
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

    return this.pwaContentService.create(copiedPWAContentDto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/build')
  async buildPWA(
    @Body()
    body: {
      id: string;
      domain?: string;
    },
    @Request() req,
    @Res() res,
  ): Promise<void> {
    try {
      const { id, domain } = body;
      const userId = req.user._id;
      const pwaContent = await this.pwaContentService.findOne(id, userId);

      if (!pwaContent.appIcon) {
        throw new Error(`appIcon not found for PWA-content with id: ${id}`);
      }

      Logger.log('Adding job to the queue job');

      const job = await this.buildQueue.add({
        appIcon: pwaContent.appIcon,
        pwaContentId: id,
        userId,
        domain,
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
      return { status: 'completed' };
    } else if (state === 'failed') {
      return {
        status: 'failed',
        message: 'Job failed',
        body: job.failedReason || 'No error body available',
      };
    }

    return { status: state };
  }
}
