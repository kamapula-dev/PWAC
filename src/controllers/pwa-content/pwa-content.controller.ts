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
  BadRequestException,
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
import { ReadyDomainService } from '../ready-domain/ready-domain.service';
import * as path from 'path';

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
    private readonly readyDomainService: ReadyDomainService,
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
    const { languages, appIcon } = createPWAContentDto;
    const actualLanguages = languages.includes('all')
      ? ([
          'en-US',
          'DE',
          'FR',
          'ES',
          'IT',
          'PT-BR',
          'NL',
          'SV',
          'DA',
          'FI',
          'PL',
          'ZH-HANS',
          'JA',
          'ET',
          'LT',
          'SL',
          'BG',
          'SK',
          'RO',
          'EL',
          'HU',
          'CS',
          'AR',
        ] as deepl.TargetLanguageCode[])
      : (languages as deepl.TargetLanguageCode[]);

    const allowedFormats = ['.png', '.jpeg', '.jpg', '.svg', '.webp'];

    const processAppIcon = (icon: string): string => {
      if (!icon) {
        throw new BadRequestException('AppIcon is required.');
      }

      const cleanIcon = icon.split('?')[0];
      const ext = path.extname(cleanIcon).toLowerCase();

      if (!allowedFormats.includes(ext)) {
        throw new BadRequestException(
          `Invalid appIcon format. Allowed formats are: ${allowedFormats.join(
            ', ',
          )}`,
        );
      }

      return cleanIcon;
    };

    const validAppIcon = processAppIcon(appIcon);
    createPWAContentDto.appIcon = validAppIcon;

    const translateFields = async (
      field: Map<deepl.TargetLanguageCode, string> | undefined,
      fieldName: string,
    ) => {
      if (field) {
        const initialText = Object.values(field)[0];
        await Promise.all(
          actualLanguages.map(async (lang) => {
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
      throw new NotFoundException('User PWA not found');
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
  @Post(':id/build')
  async buildPWA(
    @Body()
    body: {
      domain?: string;
    },
    @Param('id') id: string,
    @Request() req,
    @Res() res,
  ): Promise<void> {
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
        domain: body?.domain,
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
