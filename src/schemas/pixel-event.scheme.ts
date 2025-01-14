import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export enum FacebookEvent {
  AddPaymentInfo = 'AddPaymentInfo',
  AddToCart = 'AddToCart',
  AddToWishlist = 'AddToWishlist',
  CompleteRegistration = 'CompleteRegistration',
  Contact = 'Contact',
  CustomizeProduct = 'CustomizeProduct',
  Donate = 'Donate',
  FindLocation = 'FindLocation',
  InitiateCheckout = 'InitiateCheckout',
  Lead = 'Lead',
  Purchase = 'Purchase',
  Schedule = 'Schedule',
  Search = 'Search',
  StartTrial = 'StartTrial',
  SubmitApplication = 'SubmitApplication',
  Subscribe = 'Subscribe',
  ViewContent = 'ViewContent',
}

@Schema({ _id: false })
export class PixelEvent extends Document {
  @Prop({
    type: String,
    enum: FacebookEvent,
    required: true,
  })
  sourceEvent: FacebookEvent;

  @Prop({
    type: String,
    enum: FacebookEvent,
    required: true,
  })
  targetEvent: FacebookEvent;
}

export const PixelEventSchema = SchemaFactory.createForClass(PixelEvent);
