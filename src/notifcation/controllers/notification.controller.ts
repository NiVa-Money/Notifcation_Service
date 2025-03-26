/* eslint-disable prettier/prettier */
// src/notification/controllers/notification.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationService } from '../services/notification.service';
import { SendAppNotificationDto } from '../dtos/send-app-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * POST /notification/sendapp
   * Validates the request body for orgId, userId, and message.
   * Optionally checks if userId is a valid ObjectId, then calls the service.
   */
  @Post('sendapp')
  async sendAppNotification(@Body() sendDto: SendAppNotificationDto) {
    const { orgId, userId, message } = sendDto;

    // 1. Basic Validation
    if (!orgId || !userId || !message) {
      throw new BadRequestException('orgId, userId, and message are required');
    }

    // 2. (Optional) Validate userId is a valid ObjectId if your DB uses _id as ObjectId
    // Remove this try/catch if userId is a custom string field.
    try {
      new Types.ObjectId(userId);
    } catch (error) {
      throw new BadRequestException('Invalid userId (must be a valid ObjectId)');
    }

    // 3. Forward to service
    return this.notificationService.sendAppNotification(sendDto);
  }

  /**
   * GET /notification
   * Retrieves notifications filtered by orgId or userId, with an optional limit (noOfNotification).
   */
  @Get()
  async getNotifications(
    @Query('orgid') orgId: string,
    @Query('userid') userId: string,
    @Query('noofnotification') noOfNotification: number,
  ) {
    // 1. At least one of orgId or userId must be present
    if (!orgId && !userId) {
      throw new BadRequestException('Either orgid or userid is required');
    }

    // 2. Convert noOfNotification to a number or set a default
    const limit = noOfNotification || 10;

    // 3. Delegate to service
    return this.notificationService.getNotifications(orgId, userId, limit);
  }

  /**
   * POST /notification/update-status
   * Updates the status of a notification (e.g., mark as read or unread).
   */
  @Post('update-status')
  async updateStatus(
    @Body() updateDto: { userId: string; messageId: string; status: string },
  ) {
    const { userId, messageId, status } = updateDto;

    // 1. Basic Validation
    if (!userId || !messageId || !status) {
      throw new BadRequestException('userId, messageId, and status are required');
    }

    // 2. (Optional) Validate userId and messageId as ObjectIds
    // Remove this if they're custom strings in your DB.
    try {
      new Types.ObjectId(userId);
      new Types.ObjectId(messageId);
    } catch (error) {
      throw new BadRequestException(
        'Invalid userId or messageId (must be valid ObjectIds)',
      );
    }

    // 3. Forward to service
    const updated = await this.notificationService.updateNotificationStatus(updateDto);
    if (!updated) {
      throw new NotFoundException('Notification or user not found');
    }

    return updated;
  }
}
