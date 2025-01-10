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
    randomPhrases?: string[],
  ): Promise<string> {
    try {
      const randomIndex = Math.floor(Math.random() * randomPhrases?.length);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'You are user of application related with gambling',
          },
          {
            role: 'user',
            content: `${prompt} ${randomPhrases ? randomPhrases[randomIndex] : ''}`,
          },
        ],
        max_tokens: maxTokens,
        temperature: 1.2,
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
      'Напиши позитивный отзыв о приложении для казино на русском языке. Пиши, как обычный пользователь, используй простой язык, короткие слова. Не добавляй свои комментарии, только отзыв. Два предложения. Начало предложения:',
      100,
      [
        'Как пользователь с большим стажем',
        'Как новичок',
        'Для меня это приложение стало...',
        'Как будто создано для меня!',
        'Честно, удивлен!',
        'Вау, рекомендую каждому!',
      ],
    );
    const reviewAuthor = await this.generateContent(
      'Напиши имя пользователя, оно может быть как реальным, так и вымышленным. Имя должно быть на латинице. Не более 2 слов.',
      20,
    );
    const reviewResponse = await this.generateContent(
      'Напиши ответ на положительный отзыв (любой). Ответ должен быть позитивным и коротким. Не более 50 токенов. Одно предложение.',
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
      'Напиши описание приложения для казино на русском языке простыми словами. Это реклама. Описание должно подчеркнуть интерфейс и бонусы. Около 200 токенов. 3 предложения. Не добавляй свои комментарии, только описание. Начало предложения:',
      200,
      [
        'Казино в твоем кармане – запускай и побеждай.',
        'Лучшее приложение для игроков, которые ценят удобство и бонусы.',
        'Бонусы и выигрыши каждый день ждут тебя.',
        'Интерфейс как у профессионалов – все под рукой и ничего лишнего.',
        'Играй и выигрывай в любое время, где бы ты ни был.',
        'Твой шанс стать победителем доступен в один клик.',
        'Здесь выигрыши – это не мечта, а реальность.',
        'Твоя следующая победа ближе, чем ты думаешь.',
        'Все, что нужно для азартного отдыха – в твоем смартфоне.',
        'Игра, которая приносит удовольствие и награды.',
        'Не упусти шанс получить бонусы уже сегодня.',
        'Легкое управление, быстрые ставки и яркие эмоции.',
        'Начни свой путь к успеху прямо сейчас.',
        'Только лучшие игры с крупными выигрышами.',
        'Ощути себя настоящим победителем с нашим приложением.',
        'Каждый день – это новые возможности для выигрыша.',
        'Простота и динамика – идеальный тандем для азартной игры.',
        'Больше побед, больше радости, больше азарта!',
        'Играй с комфортом и получай удовольствие от побед.',
        'Здесь даже маленькие ставки приносят большие эмоции.',
        'Попробуй свои силы – джекпот может быть твоим.',
      ],
    );
  }

  async generateReviewResponseText(review: string): Promise<string> {
    return this.generateContent(
      `Напиши ответ на отзыв "${review}". Ответ должен быть позитивным и коротким, не фокусируйся на плохом, отвечай так как будто все отлично. Не более 50 токенов. Одно предложение.`,
      50,
    );
  }

  async generateAppReviewText(): Promise<{ text: string }> {
    return {
      text: await this.generateContent(
        'Напиши позитивный отзыв о приложении для казино на русском языке. Пиши, как обычный пользователь, используй простой язык, короткие слова. Не добавляй свои комментарии, только отзыв. Два предложения.',
        100,
        [
          'Как пользователь с большим стажем',
          'Как новичок',
          'Для меня это приложение стало...',
          'Как будто создано для меня!',
          'Честно, удивлен!',
          'Вау, рекомендую каждому!',
        ],
      ),
    };
  }
}
