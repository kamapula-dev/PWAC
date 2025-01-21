import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PostbackEvent {
  reg = 'reg',
  dep = 'dep',
}
@Schema({ timestamps: true })
export class PWAExternalMapping extends Document {
  @Prop({ required: true, unique: true })
  externalId: string;

  @Prop({ required: true })
  domain: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop()
  pwaContentId?: string;

  @Prop()
  ip?: string;

  @Prop()
  country?: string;

  @Prop()
  fbc?: string;

  @Prop()
  fbp?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop()
  dob?: string;
}

export const PWAExternalMappingSchema =
  SchemaFactory.createForClass(PWAExternalMapping);
