/* eslint-disable prettier/prettier */
import { Schema, Document } from 'mongoose';

export interface Notification extends Document {
  orgId: string;
  userId: string;
  message: string;
  status: string; // 'unread' or 'read'
  createdAt: Date;
}

export const NotificationSchema = new Schema({
  orgId: { type: String, required: true },
  userId: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  createdAt: { type: Date, default: Date.now },
});
