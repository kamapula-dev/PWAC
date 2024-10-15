import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

class MediaDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  url: string;

  @IsEnum(['image', 'file', 'video'])
  type: string;
}

class ReviewDto {
  @IsString()
  reviewAuthorName: string;

  @IsString()
  reviewAuthorIcon: string;

  @IsNumber()
  reviewAuthorRating: number;

  @IsString()
  reviewIconColor: string;

  @IsString()
  avatarTitle: string;

  @IsString()
  reviewText: string;

  @IsString()
  reviewDate: string;
}

export class CreatePWAContentDto {
  @IsString()
  appName: string;

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
}
