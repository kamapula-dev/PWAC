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
import * as deepl from 'deepl-node';

export class MediaDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  url: string;

  @IsEnum(['image', 'file', 'video'])
  type: string;
}

export class ReviewDto {
  @IsString()
  reviewAuthorName: string;

  @IsOptional()
  @IsString()
  reviewAuthorIcon: string;

  @IsNumber()
  reviewAuthorRating: number;

  @IsOptional()
  @IsObject()
  devResponse: Map<deepl.TargetLanguageCode, string>;

  @IsOptional()
  @IsString()
  reviewIconColor: string;

  @IsOptional()
  @IsObject()
  reviewText: Map<deepl.TargetLanguageCode, string>;

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
  countOfDownloads: Map<deepl.TargetLanguageCode, string>;

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
  shortDescription: Map<deepl.TargetLanguageCode, string>;

  @IsOptional()
  fullDescription: Map<deepl.TargetLanguageCode, string>;

  @IsString()
  countOfReviewsFull: string;

  @IsNumber()
  countOfStars: number;

  @IsString()
  appIcon: string;

  @IsArray()
  @Type(() => String)
  languages: (deepl.TargetLanguageCode | 'all')[];

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

  @IsArray()
  @ArrayMinSize(5, { message: 'Array must contain exactly 5 values' })
  @ArrayMaxSize(5, { message: 'Array must contain exactly 5 values' })
  @IsNumber({}, { each: true, message: 'Each value must be a number' })
  @Max(5, { each: true, message: 'Each value must be at most 5' })
  sliders: number[];
}
