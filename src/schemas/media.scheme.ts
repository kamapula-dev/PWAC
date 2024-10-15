import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Media extends Document {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true, enum: ['image', 'file', 'video'] })
  type: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
