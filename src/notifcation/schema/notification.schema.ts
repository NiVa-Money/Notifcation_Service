import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  orgId!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ required: true, enum: ['website', 'email', 'whatsapp'], default: 'website' })
  channel!: string;

  @Prop({ required: true, enum: ['read', 'unread'], default: 'unread' })
  status!: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
