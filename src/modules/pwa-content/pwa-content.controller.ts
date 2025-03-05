import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { PWAContentService } from './pwa-content.service';
import { CreatePWAContentDto } from './dto/create-pwa-content.dto';
import { UpdatePWAContentDto } from './dto/update-pwa-content.dto';
import { PWAContent } from '../../schemas/pwa-content.scheme';
import { AuthGuard } from '@nestjs/passport';
import { MediaService } from '../media/media.service';
import { UserService } from '../user/user.service';
import { Queue } from 'bull';
import { DomainManagementService } from '../domain-managemant/domain-management.service';
import { DomainMappingService } from '../domain-mapping/domain-mapping.service';
import { ReadyDomainService } from '../ready-domain/ready-domain.service';
import * as path from 'path';
import { PWAEventLogService } from '../pwa-event-log/pwa-event-log.service';
import { PWAExternalMappingService } from '../pwa-external-mapping/pwa-external-mapping.service';
import { LANGUAGES, SUPPORTED_IMAGES } from './consts';
import { PushService } from '../push/push.service';
import { ChatGptService } from '../chat-gpt/chat-gpt.service';
import { Language } from '../languages/dto/languages.dto';

@Controller('pwa-content')
export class PWAContentController {
  constructor(
    private readonly pwaContentService: PWAContentService,
    private readonly mediaService: MediaService,
    private readonly userService: UserService,
    private readonly domainManagementService: DomainManagementService,
    private readonly domainMappingService: DomainMappingService,
    private readonly readyDomainService: ReadyDomainService,
    private readonly pwaEventLogService: PWAEventLogService,
    private readonly pwaExternalMappingService: PWAExternalMappingService,
    private readonly pushService: PushService,
    private readonly chatGPTService: ChatGptService,
    @InjectQueue('buildPWA') private readonly buildQueue: Queue,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() createPWAContentDto: CreatePWAContentDto,
    @Request() req,
  ): Promise<PWAContent> {
    const userId = req.user._id;
    const { languages, appIcon } = createPWAContentDto;
    const actualLanguages: Language[] = languages.includes('all')
      ? LANGUAGES
      : (languages as Language[]);

    const processAppIcon = (icon: string): string => {
      if (!icon) {
        throw new BadRequestException('AppIcon is required.');
      }

      const cleanIcon = icon.split('?')[0];
      const ext = path.extname(cleanIcon).toLowerCase();

      if (!SUPPORTED_IMAGES.includes(ext)) {
        throw new BadRequestException(
          `Invalid appIcon format. Allowed formats are: ${SUPPORTED_IMAGES.join(
            ', ',
          )}`,
        );
      }

      return cleanIcon;
    };

    createPWAContentDto.appIcon = processAppIcon(appIcon);

    await Promise.all([
      this.chatGPTService.translateFields(
        createPWAContentDto.fullDescription,
        'fullDescription',
        actualLanguages,
      ),
      this.chatGPTService.translateFields(
        createPWAContentDto.shortDescription,
        'shortDescription',
        actualLanguages,
      ),
      this.chatGPTService.translateFields(
        createPWAContentDto.countOfDownloads,
        'countOfDownloads',
        actualLanguages,
      ),
    ]);

    if (createPWAContentDto.reviews) {
      for (const review of createPWAContentDto.reviews) {
        await Promise.all([
          this.chatGPTService.translateFields(
            review.reviewText,
            'reviewText',
            actualLanguages,
          ),
          this.chatGPTService.translateFields(
            review.devResponse,
            'devResponse',
            actualLanguages,
          ),
        ]);
      }
    }

    if (createPWAContentDto.customModal) {
      await Promise.all([
        this.chatGPTService.translateFields(
          createPWAContentDto.customModal.content,
          'content',
          actualLanguages,
        ),
        this.chatGPTService.translateFields(
          createPWAContentDto.customModal.buttonText,
          'buttonText',
          actualLanguages,
        ),
        this.chatGPTService.translateFields(
          createPWAContentDto.customModal.title,
          'title',
          actualLanguages,
        ),
      ]);
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
      existingPwa.archiveKey
        ? this.mediaService.deleteArchive(existingPwa.archiveKey)
        : Promise.resolve(),
      existingPwa.domainName
        ? this.domainMappingService.updateDomainMappingPwaId(
            userId,
            existingPwa.domainName,
            null,
          )
        : Promise.resolve(),
      this.userService.setUserPwaId(userId, existingPwa.domainName, null),
      this.pwaContentService.remove(id, userId),
      this.pushService.updatePwaIdByDomain(
        userId,
        existingPwa.domainName,
        null,
      ),
      this.pwaEventLogService.removePwaContentIdByDomain(
        existingPwa.domainName,
      ),
      this.pwaExternalMappingService.removePwaContentIdByDomain(
        existingPwa.domainName,
      ),
    ]);

    return true;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/force')
  async forceDelete(@Param('id') id: string, @Request() req): Promise<boolean> {
    const userId = req.user._id;

    const user = await this.userService.findById(userId);
    const existingPwa = user.pwas.find((p) => p.pwaContentId === id);

    if (!existingPwa) {
      Logger.warn(
        `User PWA was not found for pwa content id: ${id}, deleted pwa content only.`,
      );
      await this.pwaContentService.remove(id, userId);
      return true;
    }

    await Promise.all([
      existingPwa.domainName && !existingPwa.readyDomainId
        ? this.domainManagementService.removeDomain(
            existingPwa.email,
            existingPwa.gApiKey,
            existingPwa.domainName,
            id,
            userId,
          )
        : Promise.resolve(),
      existingPwa.readyDomainId
        ? this.readyDomainService.detachFromPwa(
            userId,
            id,
            existingPwa.readyDomainId,
          )
        : Promise.resolve(),
      existingPwa.archiveKey
        ? this.mediaService.deleteArchive(existingPwa.archiveKey)
        : Promise.resolve(),
      this.userService.deleteUserPwaByContentId(
        userId,
        existingPwa.pwaContentId,
      ),
      this.pwaContentService.remove(id, userId),
      this.pushService.removePwaById(userId, id),
      this.pwaEventLogService.deleteAllByPwaContentId(id),
      this.pwaExternalMappingService.deleteAllByPwaContentId(id),
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
  @Post(':id/buildAndDeploy')
  async buildAndDeploy(
    @Body()
    body: {
      deploy: boolean;
      domain: string;
      email?: string;
      gApiKey?: string;
      readyDomainId?: string;
    },
    @Param('id') id: string,
    @Request() req,
    @Res() res,
  ): Promise<void> {
    const { deploy, email, gApiKey, domain, readyDomainId } = body;

    try {
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
        domain: domain,
        deploy: deploy,
        email: email,
        gApiKey: gApiKey,
        readyDomainId: readyDomainId,
        pwaName: pwaContent.appName,
        ...(pwaContent?.pixel && { pixel: pwaContent.pixel }),
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
  @Get('status/:pwaContentId')
  async checkBuildStatusByPwaContentId(
    @Param('pwaContentId') pwaContentId: string,
  ): Promise<any> {
    const jobs = await this.buildQueue.getJobs([
      'waiting',
      'active',
      'delayed',
      'completed',
      'failed',
    ]);

    const job = jobs.find((j) => j.data.pwaContentId === pwaContentId);

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
