import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
        domainName: { type: String, required: false },
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
    createdAt: Date;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
