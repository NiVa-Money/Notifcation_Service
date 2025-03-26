/* eslint-disable prettier/prettier */
// src/notifcation/notification.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { SendAppNotificationDto } from '../notifcation/dtos/send-app-notification.dto';
import { NotificationGateway } from './notification.gateway';
import { NotificationDocument } from '../notifcation/schema/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Create and send a notification
   */
  async sendAppNotification(sendDto: SendAppNotificationDto) {
    const { orgId, userId, message } = sendDto;

    // 1. Basic Validation
    if (!orgId || !userId || !message) {
      throw new Error('Invalid input parameters');
    }

    // 2. Insert into DB with 'unread' status
    const notification = new this.notificationModel({
      orgId,
      userId,
      content: message, // If your schema uses 'content' instead of 'message'
      status: 'unread',
      createdAt: new Date(),
    });
    await notification.save();

    // 3. Return success to the caller
    // (the controller will handle the HTTP response)
    
    // 4. Asynchronously push notification via WebSocket
    setImmediate(() => {
      // Safely call pushNotification
      this.notificationGateway.pushNotification(userId, {
        notificationId: notification._id,
        content: notification.message,
        status: notification.status,
      });
    });

    return { success: true, notificationId: notification._id };
  }

  /**
   * Get notifications by orgId or userId, with a limit
   */
  async getNotifications(orgId: string, userId: string, noOfNotification: number) {
    const filter: FilterQuery<NotificationDocument> = {};

    if (orgId) {
      filter.orgId = orgId;
    }
    if (userId) {
      filter.userId = userId;
    }

    return this.notificationModel
      .find(filter)
      .limit(noOfNotification)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Update notification status (e.g., mark as read)
   */
  async updateNotificationStatus(updateDto: {
    userId: string;
    messageId: string;
    status: string;
  }) {
    const { userId, messageId, status } = updateDto;
    try {
      const updated = await this.notificationModel.findOneAndUpdate(
        { _id: messageId, userId },
        { status },
        { new: true },
      );
      return updated;
    } catch (err) {
      // err is 'unknown' in strict mode, so cast or check instance
      if (err instanceof Error) {
        throw new Error(`Failed to update notification status: ${err.message}`);
      }
      throw new Error('Failed to update notification status: Unknown error');
    }
  }
}
