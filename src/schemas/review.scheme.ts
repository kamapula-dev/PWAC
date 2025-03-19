import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as deepl from 'deepl-node';

@Schema()
export class Review extends Document {
  @Prop({ required: true })
  reviewAuthorName: string;

  @Prop()
  reviewAuthorIcon: string;

  @Prop({ required: true })
  reviewAuthorRating: number;

  @Prop()
  devResponse: Map<deepl.TargetLanguageCode, string>;

  @Prop({ required: false })
  reviewIconColor?: string;

  @Prop({ required: true })
  reviewText: Map<deepl.TargetLanguageCode, string>;

  @Prop({ required: true })
  reviewDate: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
