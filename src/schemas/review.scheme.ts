import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Review extends Document {
  @Prop({ required: true })
  reviewAuthorName: string;

  @Prop()
  reviewAuthorIcon: string;

  @Prop({ required: true })
  reviewAuthorRating: number;

  @Prop()
  reviewIconColor: string;

  @Prop({ required: true })
  reviewText: string;

  @Prop({ required: true })
  reviewDate: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
