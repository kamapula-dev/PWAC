import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('chat-gpt')
export class ChatGptController {
  constructor(private readonly contentGenerationService: ChatGptService) {}

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
}
