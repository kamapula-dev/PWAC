import { IsString } from 'class-validator';

export type Language =
  | 'ar'
  | 'bg'
  | 'cs'
  | 'da'
  | 'de'
  | 'el'
  | 'es'
  | 'et'
  | 'fi'
  | 'fr'
  | 'hu'
  | 'id'
  | 'it'
  | 'ja'
  | 'ko'
  | 'lt'
  | 'lv'
  | 'nb'
  | 'nl'
  | 'pl'
  | 'ro'
  | 'ru'
  | 'sk'
  | 'sl'
  | 'sv'
  | 'tr'
  | 'uk'
  | 'zh'
  | 'en-GB'
  | 'en-US'
  | 'pt-BR'
  | 'pt-PT';
export class LanguagesDto {
  @IsString()
  appName: Language;
}
