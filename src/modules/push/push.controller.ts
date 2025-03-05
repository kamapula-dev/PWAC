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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PushService } from './push.service';
import { Push } from '../../schemas/push.schema';
import { PushDto } from './dto/push.dto';
import { ConfigService } from '@nestjs/config';
import { LANGUAGES } from '../pwa-content/consts';
import { translateFields } from '../../services/languages';
import { ChatGptService } from '../chat-gpt/chat-gpt.service';
import { Language } from '../languages/dto/languages.dto';

@Controller('push')
export class PushController {
  constructor(
    private readonly pushService: PushService,
    private readonly configService: ConfigService,
    private readonly chatGPTService: ChatGptService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createPush(@Body() dto: PushDto, @Request() req): Promise<Push> {
    const userId = req.user._id;
    const languages = dto.content.languages;
    const actualLanguages = languages.includes('all') ? LANGUAGES : languages;

    await Promise.all([
      translateFields(
        dto.content.title,
        'title',
        actualLanguages as Language[],
        this.chatGPTService.translateText,
      ),
      translateFields(
        dto.content.description,
        'description',
        actualLanguages as Language[],
        this.chatGPTService.translateText,
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
    const actualLanguages: Language[] = languages.includes('all')
      ? LANGUAGES
      : (languages as Language[]);

    await Promise.all([
      translateFields(
        dto.content.title,
        'title',
        actualLanguages,
        this.chatGPTService.translateText,
      ),
      translateFields(
        dto.content.description,
        'description',
        actualLanguages,
        this.chatGPTService.translateText,
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
