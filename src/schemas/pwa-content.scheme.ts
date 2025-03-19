import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as deepl from 'deepl-node';
import { Pixel, PixelSchema } from './pixel.scheme';
import { Review, ReviewSchema } from './review.scheme';
import { Media, MediaSchema } from './media.scheme';

@Schema({ timestamps: true })
export class PWAContent extends Document {
  @Prop({ required: true })
  appName: string;

  @Prop()
  pwaName?: string;

  @Prop()
  hasPaidContentTitle?: boolean;

  @Prop()
  simulate_install?: boolean;

  @Prop()
  age?: string;

  @Prop({ required: true })
  developerName: string;

  @Prop({ required: true })
  countOfDownloads: Map<string, string>;

  @Prop({ required: true })
  countOfReviews: string;

  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  verified: boolean;

  @Prop({ required: true, default: false })
  wideScreens: boolean;

  @Prop()
  videoUrl?: string;

  @Prop()
  keepActualDateOfReviews?: boolean;

  @Prop()
  pwaTags: string[];

  @Prop({ required: true })
  hasLoadingScreen: boolean;

  @Prop({ required: true })
  hasMenu: boolean;

  @Prop({ type: [String], required: true })
  tags: string[];

  @Prop({ required: true })
  securityUI: boolean;

  @Prop({ required: true })
  lastUpdate: string;

  @Prop({ required: true })
  pwaLink: string;

  @Prop({ required: true })
  rating: string;

  @Prop()
  shortDescription: Map<string, string>;

  @Prop()
  fullDescription: Map<string, string>;

  @Prop()
  languages?: (deepl.TargetLanguageCode | 'all')[];

  @Prop({ required: true })
  countOfReviewsFull: string;

  @Prop({ required: true })
  countOfStars: number;

  @Prop({ required: true })
  appIcon: string;

  @Prop({ type: [MediaSchema], required: true })
  images: Media[];

  @Prop({ type: [ReviewSchema], required: true })
  reviews: Review[];

  @Prop({ required: true })
  version: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({
    type: [Number],
    required: true,
    validate: {
      validator: (v: number[]) => v.length === 5 && v.every((n) => n <= 5),
      message: 'Array must contain exactly 5 values between 0 and 5',
    },
  })
  sliders: number[];

  @Prop({
    type: [PixelSchema],
    required: false,
  })
  pixel?: Pixel[];

  @Prop({
    _id: false,
    type: {
      auto: { type: Boolean, required: false },
      dark: { type: Boolean, required: false },
    },
    required: false,
  })
  theme?: {
    auto?: boolean;
    dark?: boolean;
  };

  @Prop({
    _id: false,
    type: {
      showAppHeader: { type: Boolean, required: false },
      title: { type: Map, of: String, required: false },
      content: { type: Map, of: String, required: false },
      buttonText: { type: Map, of: String, required: false },
    },
    required: false,
  })
  customModal?: {
    showAppHeader?: boolean;
    title?: Map<string, string>;
    content?: Map<string, string>;
    buttonText?: Map<string, string>;
  };

  @Prop({ required: false })
  hasPushes?: boolean;
}

export const PWAContentSchema = SchemaFactory.createForClass(PWAContent);
