import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsObject,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SendToType } from '../../../schemas/push.schema';
import { PwaEvent } from '../../../schemas/pixel-event.scheme';
import * as deepl from 'deepl-node';

class PushContentDto {
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsNotEmpty()
  @IsObject()
  title: Map<deepl.TargetLanguageCode, string>;

  @IsNotEmpty()
  @IsObject()
  description: Map<deepl.TargetLanguageCode, string>;

  @IsNotEmpty()
  @IsString()
  badge: string;

  @IsNotEmpty()
  @IsString()
  icon: string;

  @IsNotEmpty()
  @IsString()
  picture: string;

  @IsOptional()
  @IsString()
  url: string;
}

class FilterDto {
  @IsNotEmpty()
  @IsEnum(PwaEvent)
  event: PwaEvent;

  @IsNotEmpty()
  @IsEnum(SendToType)
  sendTo: SendToType;
}

class PwaMappingDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  domain: string;
}

class RecipientDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PwaMappingDto)
  pwas: PwaMappingDto[];

  @IsArray()
  filters: FilterDto[];
}

export class PushDto {
  @IsNotEmpty()
  @IsString()
  systemName: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsNotEmpty()
  @IsEnum(PwaEvent)
  triggerEvent: PwaEvent;

  @IsOptional()
  @IsInt()
  delay?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsArray()
  @IsDate({ each: true })
  @Type(() => Date)
  schedules?: Date[];

  @IsOptional()
  @IsInt()
  interval?: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PushContentDto)
  content: PushContentDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients: RecipientDto[];
}
