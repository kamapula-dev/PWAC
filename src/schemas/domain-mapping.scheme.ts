import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DomainMappingDocument = HydratedDocument<DomainMapping>;

@Schema({ timestamps: true })
export class DomainMapping {
  @Prop({ required: true, unique: true })
  domainName: string;

  @Prop({ required: true })
  pwaId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  zoneId: string;
}

export const DomainMappingSchema = SchemaFactory.createForClass(DomainMapping);
