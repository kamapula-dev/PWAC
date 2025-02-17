import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SendToType } from '../../../schemas/push.schema';
import { PwaEvent } from '../../../schemas/pixel-event.scheme';

class PushContentDto {
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  badge: string;

  @IsNotEmpty()
  @IsString()
  icon: string;

  @IsNotEmpty()
  @IsString()
  picture: string;

  @IsNotEmpty()
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
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  domain: string;
}

class RecipientDto {
  @IsArray()
  pwas: PwaMappingDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
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
