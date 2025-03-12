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

export enum PwaEvent {
  OpenPage = 'OpenPage',
  Install = 'Install',
  Registration = 'Registration',
  Deposit = 'Deposit',
  OpenPWA = 'OpenPWA',
}

@Schema({ _id: false })
export class PixelEvent extends Document {
  @Prop({
    type: String,
    enum: PwaEvent,
    required: true,
  })
  triggerEvent: PwaEvent;

  @Prop({
    type: String,
    enum: FacebookEvent,
    required: true,
  })
  sentEvent: FacebookEvent;
}

export const PixelEventSchema = SchemaFactory.createForClass(PixelEvent);
