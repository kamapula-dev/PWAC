import { Controller, Get, Param } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { Language } from './dto/languages.dto';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly pwaContentService: LanguagesService) {}

  @Get(':language')
  async getLanguages(
    @Param('language') language: Language,
  ): Promise<Record<string, string>> {
    return await this.pwaContentService.getLanguages(language);
  }
}
