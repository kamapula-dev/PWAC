import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  ArrayMinSize,
  ArrayMaxSize,
  Max,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FacebookEvent, PwaEvent } from '../../../schemas/pixel-event.scheme';
import { Language } from '../../languages/dto/languages.dto';

export class PixelEventDto {
  @IsEnum(PwaEvent, { message: 'Invalid triggerEvent value' })
  triggerEvent: PwaEvent;

  @IsEnum(FacebookEvent, { message: 'Invalid sentEvent value' })
  sentEvent: FacebookEvent;
}

export class PixelDto {
  @IsOptional()
  @IsString()
  token?: string;

  @IsString()
  pixelId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PixelEventDto)
  events: PixelEventDto[];
}

export class CustomModalDto {
  @IsOptional()
  @IsBoolean()
  showAppHeader: boolean;

  @IsOptional()
  @IsObject()
  title?: Map<Language, string>;

  @IsOptional()
  @IsObject()
  content?: Map<Language, string>;

  @IsOptional()
  @IsObject()
  buttonText?: Map<Language, string>;
}

export class ThemeDto {
  @IsOptional()
  @IsBoolean()
  auto?: boolean;

  @IsOptional()
  @IsBoolean()
  dark?: boolean;
}

export enum MediaType {
  Image = 'image',
  File = 'file',
  Video = 'video',
}
export class MediaDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  url: string;

  @IsEnum(MediaType, { message: 'Type must be either image, file, or video' })
  type: MediaType;
}
export class ReviewDto {
  @IsString()
  reviewAuthorName: string;

  @IsOptional()
  @IsString()
  reviewAuthorIcon?: string;

  @IsNumber()
  reviewAuthorRating: number;

  @IsOptional()
  @IsObject()
  devResponse?: Map<Language, string>;

  @IsOptional()
  @IsString()
  reviewIconColor?: string;

  @IsOptional()
  @IsObject()
  reviewText?: Map<Language, string>;

  @IsString()
  reviewDate: string;
}

export class CreatePWAContentDto {
  @IsString()
  appName: string;

  @IsOptional()
  @IsString()
  pwaName?: string;

  @IsOptional()
  @IsBoolean()
  hasPaidContentTitle?: boolean;

  @IsString()
  developerName: string;

  @IsOptional()
  @IsObject()
  countOfDownloads?: Map<Language, string>;

  @IsString()
  countOfReviews: string;

  @IsString()
  size: string;

  @IsBoolean()
  verified: boolean;

  @IsBoolean()
  wideScreens: boolean;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  age?: string;

  @IsBoolean()
  @IsOptional()
  hasLoadingScreen?: boolean;

  @IsBoolean()
  @IsOptional()
  hasMenu?: boolean;

  @IsOptional()
  @IsBoolean()
  keepActualDateOfReviews?: boolean;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsBoolean()
  securityUI: boolean;

  @IsString()
  lastUpdate: string;

  @IsString()
  pwaLink: string;

  @IsString()
  rating: string;

  @IsOptional()
  @IsObject()
  shortDescription?: Map<Language, string>;

  @IsOptional()
  @IsObject()
  fullDescription?: Map<Language, string>;

  @IsString()
  countOfReviewsFull: string;

  @IsNumber()
  countOfStars: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pwaTags?: string[];

  @IsString()
  appIcon: string;

  @IsArray()
  @Type(() => String)
  languages: (Language | 'all')[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  images: MediaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewDto)
  reviews: ReviewDto[];

  @IsString()
  version: string;

  @IsBoolean()
  simulate_install: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PixelDto)
  pixel?: PixelDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomModalDto)
  customModal?: CustomModalDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeDto)
  theme?: ThemeDto;

  @IsArray()
  @ArrayMinSize(5, { message: 'Array must contain exactly 5 values' })
  @ArrayMaxSize(5, { message: 'Array must contain exactly 5 values' })
  @IsNumber({}, { each: true, message: 'Each value must be a number' })
  @Max(5, { each: true, message: 'Each value must be at most 5' })
  sliders: number[];
}
