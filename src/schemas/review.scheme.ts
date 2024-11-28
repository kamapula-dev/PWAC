import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PWAContent } from './pwa-content.scheme';
import * as deepl from 'deepl-node';

const AVAILABLE_COLORS = [
  '#0098A7',
  '#004D40',
  '#F3511D',
  '#34691E',
  '#512DA9',
  '#C2185B',
];

function assignUniqueColor(parentDocument: PWAContent) {
  if (parentDocument && parentDocument.reviews) {
    const usedColors = parentDocument.reviews.map(
      (review) => review.reviewIconColor,
    );

    const availableColors = AVAILABLE_COLORS.filter(
      (color) => !usedColors.includes(color),
    );

    if (availableColors.length === 0) {
      const nextIndex = usedColors.length % AVAILABLE_COLORS.length;
      return AVAILABLE_COLORS[nextIndex];
    }

    return availableColors[0];
  }

  return AVAILABLE_COLORS[0];
}

@Schema()
export class Review extends Document {
  @Prop({ required: true })
  reviewAuthorName: string;

  @Prop()
  reviewAuthorIcon: string;

  @Prop({ required: true })
  reviewAuthorRating: number;

  @Prop()
  devResponse: Map<deepl.TargetLanguageCode, string>;

  @Prop({
    required: true,
    default: function () {
      return assignUniqueColor(this.$parent());
    },
  })
  reviewIconColor: string;

  @Prop({ required: true })
  reviewText: Map<deepl.TargetLanguageCode, string>;

  @Prop({ required: true })
  reviewDate: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
