/* eslint-disable prettier/prettier */
// src/notification/services/notification.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendAppNotificationDto } from '../dtos/send-app-notification.dto';
import { NotificationGateway } from '../notification.gateway';
import { Notification } from '../models/notification.model';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification') private readonly notificationModel: Model<Notification>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Creates a new notification (unread), stores it in the DB, 
   * and pushes a WebSocket notification to the user.
   */
  async sendAppNotification(sendDto: SendAppNotificationDto) {
    const { orgId, userId, message } = sendDto;

    // (Optional) Basic validation: 
    // The controller already checks, but we can double-check here if needed.
    if (!orgId || !userId || !message) {
      throw new Error('Invalid input parameters (orgId, userId, message required).');
    }

    // Insert into DB with 'unread' status
    const notification = new this.notificationModel({
      orgId,
      userId,
      message,
      status: 'unread',
      createdAt: new Date(), // optional if your schema uses timestamps
    });
    await notification.save();

    // Immediately return success
    // (The controller returns { success: true, notificationId: ... })

    // Asynchronously push notification via WebSocket
    setImmediate(() => {
      this.notificationGateway.pushNotification(userId, {
        notificationId: notification._id,
        message: notification.message,
        status: notification.status,
      });
    });

    return { success: true, notificationId: notification._id };
  }

  /**
   * Retrieves notifications by orgId or userId, limited by noOfNotification.
   * If orgId is present, we filter by orgId; otherwise, we filter by userId.
   */
  async getNotifications(orgId: string, userId: string, noOfNotification: number) {
    // Build the query object
    const query = orgId ? { orgId } : { userId };

    // Return newest first, limit the results
    return this.notificationModel
      .find(query)
      .limit(noOfNotification)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Updates the status of a notification (e.g., 'read' or 'unread')
   * given userId + messageId.
   */
  async updateNotificationStatus(updateDto: { userId: string; messageId: string; status: string }) {
    const { userId, messageId, status } = updateDto;

    // findOneAndUpdate returns the updated doc or null if not found
    return this.notificationModel.findOneAndUpdate(
      { _id: messageId, userId },
      { status },
      { new: true },
    );
  }
}
