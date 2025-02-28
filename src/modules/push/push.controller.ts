import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PushService } from './push.service';
import { Push } from '../../schemas/push.schema';
import { PushDto } from './dto/push.dto';
import * as deepl from 'deepl-node';
import { ConfigService } from '@nestjs/config';
import { LANGUAGES } from '../pwa-content/consts';
import { translateFields } from '../../services/languages';

@Controller('push')
export class PushController {
  private readonly translator: deepl.Translator;
  constructor(
    private readonly pushService: PushService,
    private readonly configService: ConfigService,
  ) {
    const deeplApiKey = this.configService.get<string>('DEEPL_API_KEY');
    this.translator = new deepl.Translator(deeplApiKey);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createPush(@Body() dto: PushDto, @Request() req): Promise<Push> {
    const userId = req.user._id;
    const languages = dto.content.languages;
    const actualLanguages: deepl.TargetLanguageCode[] = languages.includes(
      'all',
    )
      ? LANGUAGES
      : (languages as deepl.TargetLanguageCode[]);

    await Promise.all([
      translateFields(
        dto.content.title,
        'title',
        actualLanguages,
        this.translator,
      ),
      translateFields(
        dto.content.description,
        'description',
        actualLanguages,
        this.translator,
      ),
    ]);

    return this.pushService.create(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updatePush(
    @Param('id') id: string,
    @Body() dto: Partial<PushDto>,
  ): Promise<Push> {
    const languages = dto.content.languages;
    const actualLanguages: deepl.TargetLanguageCode[] = languages.includes(
      'all',
    )
      ? LANGUAGES
      : (languages as deepl.TargetLanguageCode[]);

    await Promise.all([
      translateFields(
        dto.content.title,
        'title',
        actualLanguages,
        this.translator,
      ),
      translateFields(
        dto.content.description,
        'description',
        actualLanguages,
        this.translator,
      ),
    ]);

    return this.pushService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deletePush(@Param('id') id: string) {
    return this.pushService.delete(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllPushes(
    @Request() req,
    @Query('active') active?: string,
    @Query('event') event?: string,
    @Query('search') search?: string,
  ): Promise<Push[]> {
    const userId = req.user._id;
    const isActive = active !== undefined ? active === 'true' : undefined;
    return this.pushService.findAll({
      active: isActive,
      event,
      search,
      userId,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getPush(@Param('id') id: string): Promise<Push> {
    return this.pushService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('test/:id')
  async testPush(@Param('id') id: string) {
    return this.pushService.testPush(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('duplicate/:id')
  async duplicatePush(@Param('id') id: string) {
    return this.pushService.duplicatePush(id);
  }
}
