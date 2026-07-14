import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas/base.schema';

export type ImageObjectDocument = HydratedDocument<ImageObject>;

@Schema({ timestamps: true })
export class ImageObject extends BaseSchema {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  imageUrl: string;
}

export const ImageObjectSchema = SchemaFactory.createForClass(ImageObject);
