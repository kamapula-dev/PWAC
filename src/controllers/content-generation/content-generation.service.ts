import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

@Injectable()
export class ContentGenerationService {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('API key for OpenAI is not configured.');
    }
    this.openai = new OpenAI({ apiKey });
  }

  private async generateContent(
    prompt: string,
    maxTokens: number,
  ): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
      });
      return completion.choices[0]?.message?.content?.trim();
    } catch (error) {
      throw new BadRequestException(
        "Couldn't generate the requested content. Please try again later.",
      );
    }
  }

  async generateReview(): Promise<{
    reviewText: string;
    reviewAuthor: string;
    reviewResponse: string;
  }> {
    const reviewText = await this.generateContent(
      'Напиши позитивный отзыв о приложении для казино на русском языке. Пиши, как обычный пользователь, используй простой язык, короткие слова и немного сленга. Не добавляй свои комментарии, только отзыв. Два предложения.',
      100,
    );
    const reviewAuthor = await this.generateContent(
      'Напиши имя пользователя, оно может быть как реальным, так и вымышленным. Имя должно быть на латинице. Не более 2 слов.',
      20,
    );
    const reviewResponse = await this.generateContent(
      'Напиши ответ на отзыв. Ответ должен быть позитивным и коротким. Не более 50 токенов. Одно предложение.',
      50,
    );
    return {
      reviewText,
      reviewAuthor,
      reviewResponse,
    };
  }

  async generateAppDescription(): Promise<string> {
    return this.generateContent(
      'Напиши описание приложения для казино на русском языке простыми словами. Это реклама. Описание должно подчеркнуть интерфейс и бонусы. Около 200 токенов. 3 предложения.',
      200,
    );
  }

  async generateReviewResponseText(review: string): Promise<string> {
    return this.generateContent(
      `Напиши ответ на отзыв "${review}". Ответ должен быть позитивным и коротким. Не более 50 токенов. Одно предложение.`,
      50,
    );
  }

  async generateAppReviewText(): Promise<{ text: string }> {
    return {
      text: await this.generateContent(
        'Напиши позитивный отзыв о приложении для казино на русском языке. Пиши, как обычный пользователь, используй простой язык, короткие слова и немного сленга. Не добавляй свои комментарии, только отзыв. Два предложения.',
        100,
      ),
    };
  }
}
