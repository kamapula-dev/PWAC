import { IsString } from 'class-validator';
import * as deepl from 'deepl-node';

export class LanguagesDto {
  @IsString()
  appName: deepl.TargetLanguageCode;
}
