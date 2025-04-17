import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface ProcessDomainDto {
  cloudflare: {
    email: string;
    gApiKey: string;
  };
  domain: string;
  userEmail: string;
}
@Schema({ timestamps: true })
export class ReadyDomain extends Document {
  @Prop({ required: true })
  domain: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  gApiKey: string;

  @Prop({ required: true })
  zoneId: string;

  @Prop({ required: false })
  userId?: string;

  @Prop({ required: false })
  pwaId?: string;
}

export const ReadyDomainScheme = SchemaFactory.createForClass(ReadyDomain);
