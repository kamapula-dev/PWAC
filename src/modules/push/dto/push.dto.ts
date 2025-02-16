import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FilterEvent, SendToType } from '../../../schemas/push.schema';
import { PwaEvent } from '../../../schemas/pixel-event.scheme';

class FilterDto {
  @IsEnum(FilterEvent)
  event: FilterEvent;

  @IsEnum(SendToType)
  sendTo: SendToType;
}

class RecipientDto {
  @IsArray()
  @IsString({ each: true })
  pwas: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters: FilterDto[];
}

class PushContentDto {
  @IsOptional()
  @IsString()
  color?: string;

  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  badge: string;

  @IsOptional()
  icon: string;

  @IsOptional()
  picture: string;

  @IsOptional()
  @IsString()
  url: string;
}

export class PushDto {
  @IsString()
  systemName: string;

  @IsBoolean()
  active: boolean;

  @IsEnum(PwaEvent)
  triggerEvent: PwaEvent;

  @IsNumber()
  delay: number;

  @IsOptional()
  interval: number;

  @ValidateNested()
  @Type(() => PushContentDto)
  content: PushContentDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients: RecipientDto[];
}
