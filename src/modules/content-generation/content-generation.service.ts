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
      'Напиши позитивный отзыв о приложении для казино на русском языке. Пиши, как обычный пользователь, используй простой язык, короткие слова. Не добавляй свои комментарии, только отзыв. Два предложения. Важно, чтобы не было видно, что это AI писал. Начало предложения может начинаться с таких слов (не дословно):',
      100,
      [
        'Как человек, который перепробовал много приложений, могу сказать – это топ!',
        'Как новичок, приятно удивлен, что всё так просто и понятно.',
        'Для меня это приложение стало любимым – захожу каждый вечер.',
        'Как будто создано специально под меня – всё идеально!',
        'Честно, даже не ожидал, что так втянусь!',
        'Вау, это просто огонь! Даже друзья начали спрашивать, что за приложение.',
        'Как опытный игрок, кайфую от быстрого отклика и классных бонусов.',
        'Реально играю с удовольствием, особенно когда выпадают щедрые выигрыши!',
        'Мне нравится, когда всё работает без тормозов – здесь именно так!',
        'Как будто читают мои мысли – интерфейс сделан максимально удобно.',
        'Приложение приятно удивило – ничего лишнего, только азарт и эмоции.',
        'Больше всего люблю, что можно сразу получить бонусы – без подвоха!',
        'Если честно, не ожидал такого качества от мобильного приложения.',
        'Кажется, нашел своё идеальное место для отдыха после работы.',
        'Я редко оставляю отзывы, но тут не удержался!',
        'Честно говоря, это одно из лучших приложений для азарта, что я видел.',
        'Мне важно, чтобы всё было просто – и тут это сделано на 100%.',
        'Респект разработчикам – всё удобно и реально работает без багов.',
        'Сначала был скептически настроен, но теперь это моё любимое приложение!',
        'Мне нравится, что тут нет навязчивой рекламы – играешь и кайфуешь.',
        'Раньше искал что-то похожее, но теперь остановился на этом приложении.',
        'Для меня важна быстрая поддержка – тут ребята реально помогают!',
        'Круто, когда можно расслабиться и немного отвлечься от забот.',
        'Играть тут – как побывать в настоящем казино, только из дома!',
        'Моё любимое времяпрепровождение – открыть приложение и наслаждаться.',
        'Честно, дизайн настолько классный, что хочется играть снова и снова.',
        'Обычно не пишу отзывы, но тут прям захотелось поделиться впечатлением.',
        'Каждый раз, когда выигрываю, не могу сдержать улыбку.',
        'Наконец-то нашёл приложение, где всё работает как нужно!',
        'Как будто общаешься с настоящим крупье – так всё атмосферно.',
        'Особенно нравится, что всё работает даже на старом телефоне.',
        'Нравится, что можно играть в любое время – ни разу не подвисло!',
        'Кажется, нашёл идеальное приложение для быстрых ставок и хорошего настроения.',
        'Мне всегда важно, чтобы приложение не нагружало телефон – это идеальный вариант!',
        'Классно, что можно делать ставки и получать бонусы без сложных условий.',
        'Если бы мне раньше сказали, что мобильное казино может быть таким крутым – не поверил бы!',
        'Каждый раз удивляюсь, насколько быстро запускается приложение.',
        'Как будто тут всё сделано для удобства обычных пользователей.',
        'Самое приятное – это атмосфера азарта, которая чувствуется с первых секунд.',
        'Серьезно, в этом приложении собрано всё, что нужно для комфортной игры.',
        'Больше всего впечатляет, что поддержка отвечает моментально!',
        'Я просто в восторге – удобное меню, куча бонусов и никаких проблем!',
        'Чувствуется, что разработчики реально заботятся о пользователях.',
        'Редко играю, но это приложение затянуло – даже времени не замечаю.',
        'Лучшее, что я пробовал за последнее время!',
        'После работы включаю и просто отдыхаю – идеальный вариант.',
        'Всегда приятно видеть, что всё интуитивно понятно и не нужно долго разбираться.',
        'Кажется, нашёл своё любимое место для онлайн-игр.',
        'Смело рекомендую – проверено на себе и друзьях!',
      ],
    );
    const reviewAuthor = await this.generateContent(
      'Напиши имя пользователя, оно может быть как реальным, так и вымышленным. Имя должно быть на латинице. Не более 2 слов. Не обязательно связано с казино. Не добавляй свои комментарии, только имя пользователя.',
      20,
      [
        'Напиши крутое имя пользователя на латинице, которое звучит как никнейм опытного геймера.',
        'Придумай имя пользователя на латинице с позитивной атмосферой, которое подойдет любому человеку.',
        'Создай короткое имя на латинице, вдохновленное природой или эмоциями.',
        'Предложи интересное и запоминающееся имя на латинице без привязки к тематике казино.',
        'Сгенерируй простое и дружелюбное имя на латинице, которое мог бы использовать обычный пользователь.',
        'Придумай оригинальный никнейм на латинице с небольшой ноткой юмора.',
        'Напиши короткое, звучное имя пользователя на латинице, которое легко запомнить.',
        'Создай вымышленное имя на латинице, похожее на настоящие имена людей.',
        'Предложи уникальное имя пользователя на латинице, которое можно встретить в соцсетях.',
        'Напиши псевдоним на латинице, вдохновленный путешествиями или приключениями.',
        'Придумай имя пользователя с двумя словами на латинице, например "Lucky Joe" или "Happy Max".',
        'Напиши стильное имя пользователя на латинице, которое понравилось бы молодому человеку.',
        'Предложи имя на латинице, которое похоже на реальное, но слегка изменено для оригинальности.',
        'Сгенерируй имя, которое подойдет любому, например "Cool Tim" или "Sunny Ray".',
        'Придумай веселый и лёгкий никнейм, который мог бы выбрать новичок.',
        'Напиши классическое имя на латинице, которое ассоциируется с дружелюбным человеком.',
        'Создай короткое и звучное имя пользователя без специальных символов и цифр.',
        'Предложи уникальное и простое имя, которое звучит красиво и понятно.',
        'Напиши имя, которое подходит для любого пользователя и звучит позитивно.',
        'Создай никнейм на латинице с ноткой азарта, но без прямого указания на казино.',
      ],
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
      `Напиши ответ на отзыв "${review}". Ответ должен быть позитивным и коротким, не фокусируйся на плохом, отвечай так как будто все отлично. Не более 50 токенов. Одно предложение. Не оставляй свои комментарии, только ответ.`,
      50,
    );
  }

  async generateAppReviewText(): Promise<{ text: string }> {
    return {
      text: await this.generateContent(
        'Напиши позитивный отзыв о приложении для казино на русском языке. Пиши, как обычный пользователь, используй простой язык, короткие слова. Не добавляй свои комментарии, только отзыв. Два предложения. Важно, чтобы не было видно, что это AI писал.  Начало предложения может начинаться с таких слов (не дословно):',
        100,
        [
          'Как человек, который перепробовал много приложений, могу сказать – это топ!',
          'Как новичок, приятно удивлен, что всё так просто и понятно.',
          'Для меня это приложение стало любимым – захожу каждый вечер.',
          'Как будто создано специально под меня – всё идеально!',
          'Честно, даже не ожидал, что так втянусь!',
          'Вау, это просто огонь! Даже друзья начали спрашивать, что за приложение.',
          'Как опытный игрок, кайфую от быстрого отклика и классных бонусов.',
          'Реально играю с удовольствием, особенно когда выпадают щедрые выигрыши!',
          'Мне нравится, когда всё работает без тормозов – здесь именно так!',
          'Как будто читают мои мысли – интерфейс сделан максимально удобно.',
          'Приложение приятно удивило – ничего лишнего, только азарт и эмоции.',
          'Больше всего люблю, что можно сразу получить бонусы – без подвоха!',
          'Если честно, не ожидал такого качества от мобильного приложения.',
          'Кажется, нашел своё идеальное место для отдыха после работы.',
          'Я редко оставляю отзывы, но тут не удержался!',
          'Честно говоря, это одно из лучших приложений для азарта, что я видел.',
          'Мне важно, чтобы всё было просто – и тут это сделано на 100%.',
          'Респект разработчикам – всё удобно и реально работает без багов.',
          'Сначала был скептически настроен, но теперь это моё любимое приложение!',
          'Мне нравится, что тут нет навязчивой рекламы – играешь и кайфуешь.',
          'Раньше искал что-то похожее, но теперь остановился на этом приложении.',
          'Для меня важна быстрая поддержка – тут ребята реально помогают!',
          'Круто, когда можно расслабиться и немного отвлечься от забот.',
          'Играть тут – как побывать в настоящем казино, только из дома!',
          'Моё любимое времяпрепровождение – открыть приложение и наслаждаться.',
          'Честно, дизайн настолько классный, что хочется играть снова и снова.',
          'Обычно не пишу отзывы, но тут прям захотелось поделиться впечатлением.',
          'Каждый раз, когда выигрываю, не могу сдержать улыбку.',
          'Наконец-то нашёл приложение, где всё работает как нужно!',
          'Как будто общаешься с настоящим крупье – так всё атмосферно.',
          'Особенно нравится, что всё работает даже на старом телефоне.',
          'Нравится, что можно играть в любое время – ни разу не подвисло!',
          'Кажется, нашёл идеальное приложение для быстрых ставок и хорошего настроения.',
          'Мне всегда важно, чтобы приложение не нагружало телефон – это идеальный вариант!',
          'Классно, что можно делать ставки и получать бонусы без сложных условий.',
          'Если бы мне раньше сказали, что мобильное казино может быть таким крутым – не поверил бы!',
          'Каждый раз удивляюсь, насколько быстро запускается приложение.',
          'Как будто тут всё сделано для удобства обычных пользователей.',
          'Самое приятное – это атмосфера азарта, которая чувствуется с первых секунд.',
          'Серьезно, в этом приложении собрано всё, что нужно для комфортной игры.',
          'Больше всего впечатляет, что поддержка отвечает моментально!',
          'Я просто в восторге – удобное меню, куча бонусов и никаких проблем!',
          'Чувствуется, что разработчики реально заботятся о пользователях.',
          'Редко играю, но это приложение затянуло – даже времени не замечаю.',
          'Лучшее, что я пробовал за последнее время!',
          'После работы включаю и просто отдыхаю – идеальный вариант.',
          'Всегда приятно видеть, что всё интуитивно понятно и не нужно долго разбираться.',
          'Кажется, нашёл своё любимое место для онлайн-игр.',
          'Смело рекомендую – проверено на себе и друзьях!',
        ],
      ),
    };
  }
}