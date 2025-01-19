import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PWAExternalMapping extends Document {
  @Prop({ required: true, unique: true })
  externalId: string;

  @Prop({ type: Types.ObjectId, ref: 'PWAContent', required: true })
  pwa: Types.ObjectId;
}

export const PWAExternalMappingSchema =
  SchemaFactory.createForClass(PWAExternalMapping);
