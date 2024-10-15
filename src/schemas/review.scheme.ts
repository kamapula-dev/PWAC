import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Review extends Document {
  @Prop({ required: true })
  reviewAuthorName: string;

  @Prop({ required: true })
  reviewAuthorIcon: string;

  @Prop({ required: true })
  reviewAuthorRating: number;

  @Prop({ required: true })
  reviewIconColor: string;

  @Prop({ required: true })
  avatarTitle: string;

  @Prop({ required: true })
  reviewText: string;

  @Prop({ required: true })
  reviewDate: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
