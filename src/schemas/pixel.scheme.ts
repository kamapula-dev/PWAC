import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PixelEvent, PixelEventSchema } from './pixel-event.scheme';

@Schema({ _id: false })
export class Pixel extends Document {
  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: String, required: true })
  pixelId: string;

  @Prop({ type: [PixelEventSchema], required: true })
  events: PixelEvent[];
}

export const PixelSchema = SchemaFactory.createForClass(Pixel);
