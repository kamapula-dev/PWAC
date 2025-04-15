import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ContentGenerationService } from './content-generation.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('content-generation')
export class ContentGenerationController {
  constructor(
    private readonly contentGenerationService: ContentGenerationService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('generate-review')
  async generateHaiku(): Promise<{
    reviewText: string;
    reviewResponse: string;
    reviewAuthor: string;
  }> {
    return this.contentGenerationService.generateReview();
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

  @UseGuards(AuthGuard('jwt'))
  @Post('generate-review-response-text')
  async generateReviewResponse(
    @Body('text') review: { text: string },
  ): Promise<{ text: string }> {
    return {
      text: await this.contentGenerationService.generateReviewResponseText(
        review.text,
      ),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('generate-review-text')
  async generateReviewText(): Promise<{ text: string }> {
    return await this.contentGenerationService.generateAppReviewText();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('generate-white-page')
  async generateWhitePage(@Body('url') url: string): Promise<{ html: string }> {
    const html =
      await this.contentGenerationService.generateWhitePageFromUrl(url);
    return { html };
  }
}
