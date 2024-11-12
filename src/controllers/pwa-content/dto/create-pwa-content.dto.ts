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
} from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsString()
  devResponse: string;

  @IsOptional()
  @IsString()
  reviewIconColor: string;

  @IsString()
  reviewText: string;

  @IsString()
  reviewDate: string;
}

export class CreatePWAContentDto {
  @IsString()
  appName: string;

  @IsOptional()
  @IsString()
  pwaName?: string;

  @IsString()
  developerName: string;

  @IsString()
  countOfDownloads: string;

  @IsString()
  countOfReviews: string;

  @IsString()
  size: string;

  @IsBoolean()
  verified: boolean;

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

  @IsString()
  shortDescription: string;

  @IsString()
  fullDescription: string;

  @IsString()
  countOfReviewsFull: string;

  @IsNumber()
  countOfStars: number;

  @IsString()
  appIcon: string;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  languages: string[];

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
