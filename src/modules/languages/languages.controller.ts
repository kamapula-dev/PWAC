import { Controller, Get, Param } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import * as deepl from 'deepl-node';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly pwaContentService: LanguagesService) {}

  @Get(':language')
  async getLanguages(
    @Param('language') language: deepl.TargetLanguageCode,
  ): Promise<Record<string, string>> {
    return await this.pwaContentService.getLanguages(language);
  }
}
