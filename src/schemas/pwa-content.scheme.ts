import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as deepl from 'deepl-node';
import { Pixel, PixelSchema } from './pixel.scheme';
import { Review, ReviewSchema } from './review.scheme';
import { Media, MediaSchema } from './media.scheme';

export enum TrafficDirection {
  INSTALL_PAGE = 'INSTALL_PAGE',
  WHITE_PAGE = 'WHITE_PAGE',
  OFFER_URL = 'OFFER_URL',
  CUSTOM_URL = 'CUSTOM_URL',
}

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
    required: false,
    type: {
      auto: { type: Boolean, required: false },
      dark: { type: Boolean, required: false },
    },
  })
  theme?: {
    auto?: boolean;
    dark?: boolean;
  };

  @Prop({
    _id: false,
    required: false,
    type: {
      background: { type: String, required: false },
      loader: { type: String, required: false },
    },
  })
  offerPreloader?: {
    background?: string;
    loader?: string;
  };

  @Prop({
    _id: false,
    required: false,
    type: {
      showAppHeader: { type: Boolean, required: false },
      timeout: { type: Number, required: false },
      title: { type: Map, of: String, required: false },
      content: { type: Map, of: String, required: false },
      buttonText: { type: Map, of: String, required: false },
    },
  })
  customModal?: {
    showAppHeader?: boolean;
    timeout?: number;
    title?: Map<string, string>;
    content?: Map<string, string>;
    buttonText?: Map<string, string>;
  };

  @Prop({ required: false })
  mainThemeColor?: string;

  @Prop({ required: false })
  testDesign?: boolean;

  @Prop({ required: false })
  installButtonTextColor?: string;

  @Prop({ required: false })
  hasPushes?: boolean;

  @Prop({
    _id: false,
    required: false,
    type: {
      offer: {
        all: { type: Boolean, required: true },
        offersMap: {
          type: Map,
          of: String,
          required: true,
        },
        irrelevantTrafficUrl: { type: String, required: false },
      },
      devices: {
        androidOnly: { type: Boolean, required: true },
        android: {
          direction: {
            type: String,
            enum: Object.values(TrafficDirection),
            required: false,
          },
          url: { type: String, required: false },
        },
        desktop: {
          direction: {
            type: String,
            enum: Object.values(TrafficDirection),
            required: false,
          },
          url: { type: String, required: false },
        },
        ios: {
          direction: {
            type: String,
            enum: Object.values(TrafficDirection),
            required: false,
          },
          url: { type: String, required: false },
        },
        telegram: {
          direction: {
            type: String,
            enum: Object.values(TrafficDirection),
            required: false,
          },
          url: { type: String, required: false },
        },
      },
      cloaca: {
        enabled: { type: Boolean, required: true },
        direction: {
          type: String,
          enum: Object.values(TrafficDirection),
          required: false,
        },
        url: { type: String, required: false },
      },
    },
  })
  trackerSettings?: {
    offer: {
      all: boolean;
      offersMap: Record<string, string>;
      irrelevantTrafficUrl?: string;
    };
    devices: {
      androidOnly: boolean;
      android?: { direction: TrafficDirection; url?: string };
      desktop?: { direction: TrafficDirection; url?: string };
      ios?: { direction: TrafficDirection; url?: string };
      telegram?: { direction: TrafficDirection; url?: string };
    };
    cloaca: {
      enabled: boolean;
      direction?: TrafficDirection;
      url?: string;
    };
  };
}

export const PWAContentSchema = SchemaFactory.createForClass(PWAContent);
