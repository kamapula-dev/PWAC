import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PwaEvent } from './pixel-event.scheme';
import * as deepl from 'deepl-node';

export type PushDocument = Push & Document;

export enum SendToType {
  all = 'all',
  with = 'with',
  without = 'without',
}

@Schema({ _id: false })
export class PushContent {
  @Prop({ required: false })
  color?: string;

  @Prop()
  languages?: (deepl.TargetLanguageCode | 'all')[];

  @Prop()
  title: Map<string, string>;

  @Prop()
  description: Map<string, string>;

  @Prop()
  badge: string;

  @Prop()
  icon: string;

  @Prop()
  picture: string;

  @Prop({ required: false })
  url?: string;
}

const PushContentSchema = SchemaFactory.createForClass(PushContent);

@Schema({ _id: false })
export class Filter {
  @Prop({ enum: PwaEvent, required: true })
  event: PwaEvent;

  @Prop({ enum: SendToType, required: true })
  sendTo: SendToType;
}

const FilterSchema = SchemaFactory.createForClass(Filter);

@Schema({ _id: false })
export class PwaMapping {
  @Prop()
  id?: string;

  @Prop({ required: true })
  domain: string;
}

const PwaMappingSchema = SchemaFactory.createForClass(PwaMapping);

@Schema({ _id: false })
export class Recipient {
  @Prop({ type: [FilterSchema], default: [] })
  filters: Filter[];

  @Prop({ type: [PwaMappingSchema], default: [] })
  pwas: PwaMapping[];
}

const RecipientSchema = SchemaFactory.createForClass(Recipient);

@Schema({ timestamps: true })
export class Push {
  @Prop({ required: true })
  systemName: string;

  @Prop({ default: false, index: true })
  active: boolean;

  @Prop({ enum: PwaEvent, required: false })
  triggerEvent: PwaEvent;

  @Prop({ required: false })
  timeZone?: string;

  @Prop({ default: 0 })
  delay: number;

  @Prop({ required: false })
  color?: string;

  @Prop({ type: [Date], required: false, index: true })
  schedules?: Date[];

  @Prop({ type: [Date], required: false, index: true })
  recordedSchedules?: Date[];

  @Prop({ default: 0 })
  interval?: number;

  @Prop({ type: PushContentSchema, required: true })
  content: PushContent;

  @Prop({ type: [RecipientSchema], default: [] })
  recipients: Recipient[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;
}

export const PushSchema = SchemaFactory.createForClass(Push);
