import {
    IsString,
    IsBoolean,
    IsOptional,
    IsNumber,
    IsArray,
    ValidateNested, ArrayMinSize, ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {MediaDto, ReviewDto} from "./create-pwa-content.dto";

export class UpdatePWAContentDto {
    @IsOptional()
    @IsString()
    appName?: string;

    @IsOptional()
    @IsString()
    pwaName?: string;

    @IsOptional()
    @IsBoolean()
    hasPaidContentTitle?: boolean;

    @IsOptional()
    @IsString()
    developerName?: string;

    @IsOptional()
    @IsString()
    countOfDownloads?: string;

    @IsOptional()
    @IsString()
    countOfReviews?: string;

    @IsOptional()
    @IsString()
    size?: string;

    @IsOptional()
    @IsBoolean()
    verified?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsString()
    lastUpdate?: string;

    @IsOptional()
    @IsString()
    pwaLink?: string;

    @IsOptional()
    @IsString()
    rating?: string;

    @IsOptional()
    @IsString()
    shortDescription?: string;

    @IsOptional()
    @IsString()
    fullDescription?: string;

    @IsOptional()
    @IsString()
    countOfReviewsFull?: string;

    @IsOptional()
    @IsNumber()
    countOfStars?: number;

    @IsOptional()
    @IsString()
    appIcon?: string;

    @IsOptional()
    @IsArray()
    @Type(() => String)
    languages?: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MediaDto)
    images?: MediaDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReviewDto)
    reviews?: ReviewDto[];

    @IsOptional()
    @IsString()
    version?: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @IsNumber({}, { each: true })
    sliders?: number[];
}
