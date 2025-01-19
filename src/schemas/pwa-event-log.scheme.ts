import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PwaEvent } from './pixel-event.scheme';

@Schema({ timestamps: true })
export class PWAEventLog extends Document {
  @Prop({ required: true, enum: PwaEvent })
  event: PwaEvent;

  @Prop({ type: Types.ObjectId, ref: 'PWAContent', required: true })
  pwa: Types.ObjectId;

  @Prop()
  externalId?: string;

  @Prop()
  value?: number;

  @Prop()
  currency?: string;
}

export const PWAEventLogSchema = SchemaFactory.createForClass(PWAEventLog);
