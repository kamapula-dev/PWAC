import { Controller, Get, UseGuards } from '@nestjs/common';
import { ContentGenerationService } from './content-generation.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('content-generation')
export class ContentGenerationController {
  constructor(
    private readonly contentGenerationService: ContentGenerationService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('generate-review-text')
  async generateHaiku(): Promise<{
    reviewText: string;
    reviewAuthor: string;
  }> {
    return this.contentGenerationService.generateReviewText();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('generate-app-description')
  async generateAppDescription(): Promise<{ text: string }> {
    const description =
      await this.contentGenerationService.generateAppDescription();
    return {
      text: description,
    };
  }
}
