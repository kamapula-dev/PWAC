import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PWAExternalMapping extends Document {
  @Prop({ required: true, unique: true })
  externalId: string;

  @Prop({ required: true })
  domain: string;

  @Prop()
  pwaContentId?: string;
}

export const PWAExternalMappingSchema =
  SchemaFactory.createForClass(PWAExternalMapping);
