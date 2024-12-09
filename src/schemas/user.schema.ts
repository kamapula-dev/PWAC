import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PwaStatus {
  BUILDED = 'BUILDED',
  BUILD_FAILED = 'BUILD_FAILED',
  WAITING_NS = 'WAITING_NS',
  ACTIVE = 'ACTIVE',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [
      {
        pwaContentId: { type: String, required: true },
        archiveKey: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        email: { type: String, required: false },
        gApiKey: { type: String, required: false },
        zoneId: { type: String, required: false },
        domainName: { type: String, required: false },
        nsRecords: {
          type: [
            {
              name: { type: String, required: true },
            },
          ],
          required: false,
          default: [],
        },
        status: {
          type: String,
          enum: Object.values(PwaStatus),
          required: false,
        },
      },
    ],
    default: [],
  })
  pwas: {
    pwaContentId: string;
    archiveKey: string;
    email?: string;
    gApiKey?: string;
    zoneId?: string;
    domainName?: string;
    nsRecords?: { name: string }[];
    status?: PwaStatus;
    createdAt: Date;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
