import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PwaEvent } from './pixel-event.scheme';

@Schema({ timestamps: true })
export class PWAEventLog extends Document {
  @Prop({ required: true, enum: PwaEvent })
  event: PwaEvent;

  @Prop({ required: true })
  domain: string;

  @Prop()
  pwaContentId?: string;

  @Prop()
  externalId?: string;

  @Prop()
  value?: number;

  @Prop()
  currency?: string;
}

export const PWAEventLogSchema = SchemaFactory.createForClass(PWAEventLog);
