import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Media, MediaSchema } from './media.scheme';
import { Review, ReviewSchema } from './review.scheme';

@Schema({ timestamps: true })
export class PWAContent extends Document {
  @Prop({ required: true })
  appName: string;

  @Prop({ required: true })
  developerName: string;

  @Prop({ required: true })
  countOfDownloads: string;

  @Prop({ required: true })
  countOfReviews: string;

  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  verified: boolean;

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
  description: string;

  @Prop()
  languages: string[];

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
}

export const PWAContentSchema = SchemaFactory.createForClass(PWAContent);
